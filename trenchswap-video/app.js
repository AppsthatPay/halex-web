"use strict";
/*
 * TrenchSwap Video - in-browser WebM to MP4 converter.
 *
 * Pinned libraries:
 *   @ffmpeg/ffmpeg 0.12.15  UMD main (ffmpeg.js) and its worker chunk
 *                           (814.ffmpeg.js) are hosted NEXT TO this page.
 *                           They must be: when a classWorkerURL is passed,
 *                           the 0.12.15 UMD build creates a MODULE worker,
 *                           but its own worker chunk is a classic script
 *                           (importScripts is undefined in a module worker,
 *                           load dies with "Cannot find module"). With no
 *                           classWorkerURL, the library loads the chunk
 *                           from this folder as a classic worker. Verified
 *                           2026-11-26 in headless Chromium.
 *   @ffmpeg/core   0.12.10  SINGLE-THREAD core, fetched from jsDelivr at
 *                           runtime (dist/umd/ffmpeg-core.js/.wasm) and
 *                           handed to the worker as blob URLs. The core
 *                           wasm is about 32 MB, too big for our GitHub
 *                           upload route, so it is not hosted here.
 * The single-thread core is deliberate: GitHub Pages cannot serve the
 * COOP/COEP headers the multi-thread core needs for SharedArrayBuffer.
 * Everything runs on the device. The video is never uploaded anywhere.
 *
 * @ffmpeg/util is NOT used: its 0.12.2 UMD build throws
 * "exports is not defined" in a browser and never sets its global
 * (verified 2026-11-26 in headless Chromium). The two helpers this page
 * needs from it (toBlobURL, fetchFile) are implemented locally below.
 */

var FFMPEG_VERSION = "0.12.15";
var CORE_VERSION = "0.12.10";
var CDN = "https://cdn.jsdelivr.net/npm";
var CORE_BASE = CDN + "/@ffmpeg/core@" + CORE_VERSION + "/dist/umd";

var IDB_NAME = "trenchswap-video";
var IDB_STORE = "inbox";
var IDB_KEY = "pending";

var $ = function (id) { return document.getElementById(id); };
var statusEl = $("status"), barwrapEl = $("barwrap"), barEl = $("bar");
var inmetaEl = $("inmeta"), resultEl = $("result"), previewEl = $("preview");
var outmetaEl = $("outmeta"), downloadEl = $("download"), shareEl = $("share");

var ffmpeg = null;
var loadPromise = null;
var busy = false;
var recentLogs = [];
var probeDuration = null;   // seconds, parsed from the ffmpeg input dump
var estDuration = null;     // seconds, best estimate for the progress bar
var lastLogTime = 0;        // seconds of media processed, from ffmpeg logs
var outputBlob = null;
var outputName = "trenchswap-video.mp4";
var outputFile = null;
var currentSource = null;   // "picker" | "drop" | "inbox"

/* Small hooks so the page can be driven and checked by a test harness. */
window.__tsv = {
  ffmpegVersion: FFMPEG_VERSION,
  coreVersion: CORE_VERSION,
  ready: false,
  outputBlob: null,
  outputName: null,
  error: null,
  loadMs: null,
  transcodeMs: null
};

function setState(s) { document.body.setAttribute("data-state", s); }

function setStatus(msg, cls) {
  statusEl.textContent = msg;
  statusEl.className = cls || "";
}

function setProgress(frac) {
  barwrapEl.classList.remove("hidden", "indet");
  if (frac == null || !isFinite(frac)) {
    barwrapEl.classList.add("indet");
    barEl.style.width = "";
    return;
  }
  var pct = Math.max(0, Math.min(100, Math.round(frac * 100)));
  barEl.style.width = pct + "%";
}

function hideProgress() { barwrapEl.classList.add("hidden"); }

function fmtBytes(n) {
  if (n == null) return "?";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

function fmtSecs(s) {
  if (s == null || !isFinite(s)) return "unknown length";
  return s.toFixed(2) + " s";
}

function baseName(name) {
  var b = (name || "trenchswap-video").replace(/\.[^.]*$/, "");
  b = b.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "");
  return b || "trenchswap-video";
}

function isMp4Like(file) {
  var t = (file.type || "").toLowerCase();
  var n = (file.name || "").toLowerCase();
  return t.indexOf("mp4") >= 0 || t.indexOf("quicktime") >= 0 ||
    /\.(mp4|m4v|mov)$/.test(n);
}

/* ---------------- IndexedDB handoff (TrenchSwap app -> this page) -------- */

function idbOpen() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function idbGet(key) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var q = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
      q.onsuccess = function () { resolve(q.result || null); };
      q.onerror = function () { reject(q.error); };
    });
  });
}

function idbDelete(key) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve) {
      var q = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(key);
      q.onsuccess = function () { resolve(); };
      q.onerror = function () { resolve(); };
    });
  });
}

/* ---------------- ffmpeg loading ---------------------------------------- */

/* Local replacements for the two @ffmpeg/util helpers (see header note). */
async function toBlobURL(url, mimeType) {
  var buf = await (await fetch(url)).arrayBuffer();
  return URL.createObjectURL(new Blob([buf], { type: mimeType }));
}

async function fetchFileBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

function loadFFmpeg() {
  if (loadPromise) return loadPromise;
  var t0 = performance.now();
  loadPromise = (async function () {
    var FFmpegClass = window.FFmpegWASM.FFmpeg;
    ffmpeg = new FFmpegClass();
    ffmpeg.on("log", function (e) {
      recentLogs.push(e.message);
      if (recentLogs.length > 400) recentLogs.shift();
      var m = /time=(\d+):(\d+):([\d.]+)/.exec(e.message);
      if (m) {
        lastLogTime = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
        if (estDuration) setProgress(lastLogTime / estDuration);
      }
    });
    ffmpeg.on("progress", function (e) {
      if (e && isFinite(e.progress) && e.progress > 0) {
        var cur = parseFloat(barEl.style.width) || 0;
        if (e.progress * 100 > cur) setProgress(e.progress);
      }
    });
    var coreURL = await toBlobURL(CORE_BASE + "/ffmpeg-core.js", "text/javascript");
    var wasmURL = await toBlobURL(CORE_BASE + "/ffmpeg-core.wasm", "application/wasm");
    /* No classWorkerURL on purpose (see header): the library then loads
       814.ffmpeg.js from this folder as a classic worker. */
    await ffmpeg.load({ coreURL: coreURL, wasmURL: wasmURL });
    window.__tsv.ready = true;
    window.__tsv.loadMs = Math.round(performance.now() - t0);
  })();
  return loadPromise;
}

/* ---------------- probing ------------------------------------------------ */

/* Chrome gives duration = Infinity for MediaRecorder WebM (no Duration
   element in the header). Seeking to a huge time forces it to reveal the
   real duration. Used only for the progress bar and the info line. */
function estimateDuration(blob) {
  return new Promise(function (resolve) {
    var url = URL.createObjectURL(blob);
    var v = document.createElement("video");
    var done = false;
    function finish(val) {
      if (done) return;
      done = true;
      URL.revokeObjectURL(url);
      resolve(val);
    }
    v.preload = "metadata";
    v.muted = true;
    v.src = url;
    v.addEventListener("loadedmetadata", function () {
      if (isFinite(v.duration) && v.duration > 0) finish(v.duration);
      else v.currentTime = 1e7;
    });
    v.addEventListener("durationchange", function () {
      if (isFinite(v.duration) && v.duration > 0) finish(v.duration);
    });
    v.addEventListener("error", function () { finish(null); });
    setTimeout(function () {
      finish(isFinite(v.duration) && v.duration > 0 ? v.duration : null);
    }, 4000);
  });
}

/* Runs ffmpeg -i and parses the input dump: duration + audio presence. */
async function probe(inName) {
  recentLogs = [];
  try { await ffmpeg.exec(["-i", inName]); } catch (e) { /* -i alone exits non-zero; the dump is what we want */ }
  var text = recentLogs.join("\n");
  var hasAudio = /Stream #\d+:\d+.*:\s*Audio:/.test(text);
  var dur = null;
  var m = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(text);
  if (m) dur = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
  return { hasAudio: hasAudio, duration: dur };
}

/* ---------------- conversion --------------------------------------------- */

/* The export spec is the audited one-export-fits-all from the v51 share
   system work: H.264 High Profile level 4.0, yuv420p, AAC-LC 48 kHz
   128 kbps, closed GOP 48, faststart, 24 fps, 5 Mbps target.
   Two deliberate deviations for in-browser WASM: preset veryfast (the
   single-thread core is far slower than a desktop CPU) and a scale cap
   at 1080p (the audited command ran on files already at 1080x604).
   Audio choice: a real audio track is kept and re-encoded to AAC-LC.
   When the input has NO audio track (every MediaRecorder capture),
   a silent AAC-LC track is added, because the published X spec wants
   an AAC track present and the audited export does the same. */
function transcodeArgs(inName, outName, hasAudio) {
  var vf = "fps=24,scale='min(1920,iw)':'min(1080,ih)':force_divisible_by=2,format=yuv420p";
  var enc = [
    "-c:v", "libx264", "-preset", "veryfast",
    "-profile:v", "high", "-level:v", "4.0", "-pix_fmt", "yuv420p",
    "-b:v", "5M", "-maxrate", "8M", "-bufsize", "10M",
    "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "128k", "-ar", "48000"
  ];
  if (hasAudio) {
    return ["-i", inName, "-map", "0:v:0", "-map", "0:a:0", "-vf", vf]
      .concat(enc, ["-movflags", "+faststart", outName]);
  }
  return ["-i", inName, "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
    "-map", "0:v:0", "-map", "1:a:0", "-vf", vf]
    .concat(enc, ["-shortest", "-movflags", "+faststart", outName]);
}

/* Already an MP4: no re-encode, just remux with faststart so it plays
   inline everywhere and carries clean timestamps. */
function remuxArgs(inName, outName) {
  return ["-i", inName, "-map", "0:v:0", "-map", "0:a:0?",
    "-c", "copy", "-movflags", "+faststart", outName];
}

async function processFile(file, source) {
  if (busy) { setStatus("Still working on the last video. Give it a moment.", ""); return; }
  if (!file) return;
  busy = true;
  currentSource = source;
  resultEl.classList.add("hidden");
  shareEl.classList.add("hidden");
  outputBlob = null; outputFile = null;
  window.__tsv.outputBlob = null; window.__tsv.error = null;
  setState("working");

  var inName = "input";
  var outName = "output.mp4";
  outputName = baseName(file.name) + ".mp4";

  try {
    setStatus("Loading the converter...");
    setProgress(null);
    await loadFFmpeg();

    inmetaEl.classList.remove("hidden");
    inmetaEl.innerHTML = "Got <b class='fname'></b> (" + fmtBytes(file.size) + "). Working on it on this device.";
    inmetaEl.querySelector(".fname").textContent = file.name || "video from TrenchSwap";

    var ext = isMp4Like(file) ? ".mp4" : ".webm";
    inName = "input" + ext;
    await ffmpeg.writeFile(inName, await fetchFileBytes(file));

    var info = await probe(inName);
    probeDuration = info.duration;
    estDuration = probeDuration || await estimateDuration(file);
    lastLogTime = 0;

    var t0 = performance.now();
    var code;
    if (isMp4Like(file)) {
      setStatus("This one is already an MP4. Cleaning it up (faststart remux, no re-encode)...");
      setProgress(null);
      code = await ffmpeg.exec(remuxArgs(inName, outName));
    } else {
      setStatus(info.hasAudio
        ? "Converting to MP4 (H.264 + AAC). This can take a bit on a phone..."
        : "Converting to MP4 (H.264 + AAC, silent track added). This can take a bit on a phone...");
      setProgress(0);
      code = await ffmpeg.exec(transcodeArgs(inName, outName, info.hasAudio));
    }
    window.__tsv.transcodeMs = Math.round(performance.now() - t0);
    if (code !== 0) throw new Error("ffmpeg exited with code " + code);

    var data = await ffmpeg.readFile(outName);
    outputBlob = new Blob([data], { type: "video/mp4" });
    outputFile = new File([outputBlob], outputName, { type: "video/mp4" });
    window.__tsv.outputBlob = outputBlob;
    window.__tsv.outputName = outputName;

    var url = URL.createObjectURL(outputBlob);
    previewEl.src = url;
    downloadEl.href = url;
    downloadEl.setAttribute("download", outputName);

    outmetaEl.innerHTML = "Your MP4 is ready: <b></b><br>Size " + fmtBytes(outputBlob.size) +
      " &middot; length <b id='outdur'>reading...</b><br>It plays here, and it will post to X, Facebook, Instagram and Telegram.";
    outmetaEl.querySelector("b").textContent = outputName;
    previewEl.addEventListener("loadedmetadata", function () {
      var d = $("outdur");
      if (d) d.textContent = fmtSecs(previewEl.duration);
    }, { once: true });

    if (navigator.canShare && outputFile && navigator.canShare({ files: [outputFile] })) {
      shareEl.classList.remove("hidden");
    }

    resultEl.classList.remove("hidden");
    hideProgress();
    setStatus("Done. Preview it, then download or share the MP4.", "ok");
    setState("done");

    if (source === "inbox") {
      try { await idbDelete(IDB_KEY); } catch (e) { /* entry stays; harmless */ }
    }
  } catch (err) {
    window.__tsv.error = String(err && err.message || err);
    hideProgress();
    setStatus("That did not work: " + (err && err.message || err) +
      ". Try again, or pick a different video file.", "err");
    setState("error");
  } finally {
    try { await ffmpeg.deleteFile(inName); } catch (e) {}
    try { await ffmpeg.deleteFile(outName); } catch (e) {}
    busy = false;
  }
}

/* ---------------- wiring -------------------------------------------------- */

var dropEl = $("drop"), fileEl = $("file");
dropEl.addEventListener("click", function () { fileEl.click(); });
dropEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileEl.click(); }
});
fileEl.addEventListener("change", function () {
  if (fileEl.files && fileEl.files[0]) processFile(fileEl.files[0], "picker");
  fileEl.value = "";
});
["dragenter", "dragover"].forEach(function (ev) {
  dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.add("over"); });
});
["dragleave", "drop"].forEach(function (ev) {
  dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.remove("over"); });
});
dropEl.addEventListener("drop", function (e) {
  var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) processFile(f, "drop");
});
document.addEventListener("dragover", function (e) { e.preventDefault(); });
document.addEventListener("drop", function (e) { e.preventDefault(); });

shareEl.addEventListener("click", function () {
  if (!outputFile) return;
  navigator.share({ files: [outputFile], title: "TrenchSwap Video" }).catch(function () {});
});
$("again").addEventListener("click", function () {
  resultEl.classList.add("hidden");
  setState("idle");
  setStatus("Pick another video whenever you are ready.", "");
  fileEl.click();
});

/* ---------------- boot ----------------------------------------------------- */

(async function boot() {
  setState("loading");
  try {
    await loadFFmpeg();
    setState("idle");
    setStatus("Ready. Pick a video, or drop one on the box above.", "");
  } catch (e) {
    setState("error");
    setStatus("The converter could not load. Check your connection and reload the page.", "err");
    window.__tsv.error = String(e && e.message || e);
    return;
  }
  /* Handoff: did TrenchSwap stash a recording for us? */
  try {
    var pending = await idbGet(IDB_KEY);
    if (pending) {
      var blob = pending.blob || pending;
      var name = pending.filename || pending.name || "trenchswap-video.webm";
      if (blob && blob.size > 0) {
        var f = new File([blob], name, { type: blob.type || "video/webm" });
        setStatus("Got the video TrenchSwap sent over. Converting it now...", "");
        processFile(f, "inbox");
      }
    }
  } catch (e) { /* no handoff available; the picker still works */ }
})();
