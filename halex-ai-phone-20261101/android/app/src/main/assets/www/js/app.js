/* HALEX-AI phone app wiring — UI only. No network calls from the
   chain core. The only network use in this app is the human's in-app
   browser tab (native shell); the core, ledger, manifest, and socket
   queue are all local. Questions are never written to the ledger. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var bridge = (typeof window !== "undefined") ? window.HalexBridge : undefined;
  var LS_LEARN = "zinium-phone-learn-queue";
  var LS_TRACE = "zinium-phone-show-trace";

  function esc(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function loadLS(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function saveLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ---------- tabs + composer ---------- */
  var tabs = document.querySelectorAll("nav button");
  function switchTab(name) {
    tabs.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === name); });
    document.querySelectorAll(".tab").forEach(function (s) {
      s.classList.toggle("active", s.id === "tab-" + name);
    });
    $("composer").style.display = (name === "chat") ? "flex" : "none";
    if (name === "reports") renderReports();
    if (name === "manifest") renderManifest();
    if (name === "settings") renderSettings();
    if (name === "cube") renderCubeState();
    if (name === "mapping" && typeof ChainMapping !== "undefined" && ChainMapping.render) { try { ChainMapping.render(); } catch (e) {} }
    if (name === "train") { feedTrainDistance(); if (typeof TrainZinium !== "undefined" && TrainZinium.render) { try { TrainZinium.render(); } catch (e) {} } }
    if (name === "connect") { try { if (typeof GithubSwitch !== "undefined" && GithubSwitch.render) GithubSwitch.render(); } catch (e) {} try { if (typeof Proposals !== "undefined" && Proposals.render) Proposals.render(); } catch (e) {} }
    if (name === "tracking") { try { if (typeof UserTracking !== "undefined" && UserTracking.render) UserTracking.render(); } catch (e) {} }
  }
  tabs.forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
  });

  /* ---------- chat ---------- */
  var lastProposal = null;
  var lastRun = null;
  function ask() {
    var q = $("q").value;
    var started = Date.now();
    var result = ZiniumCore.answerQuestion(q);
    lastProposal = result.proposal;
    var log = $("chat-log");
    var u = document.createElement("div"); u.className = "msg user"; u.textContent = q; log.appendChild(u);
    var a = document.createElement("div"); a.className = "msg ai"; a.textContent = "[" + result.status + "] " + result.answer; log.appendChild(a);
    var showTrace = localStorage.getItem(LS_TRACE) !== "0";
    if (showTrace) {
      var m = document.createElement("div"); m.className = "meta";
      var trace = result.trace.map(function (t) {
        return t.id + " score " + t.score + " via " + t.triggers.join(", ") + " [" + t.lane + "] (" + (t.origin || "bundled") + ")";
      }).join("; ");
      m.textContent = "Answered in " + (Date.now() - started) + " ms. " + (trace || "No trace — no record matched.");
      log.appendChild(m);
    }
    /* ZINIUM runtime: the backbone, spine, and mesh checksum actually
       RUN in this app on every message (js/zinium-runtime.js). The
       answer above comes from the chain records; the run aids the
       processing trace only — it never decides, executes, signs,
       spends, or trades. A failed run is shown, never hidden. */
    if (typeof ZiniumRuntime !== "undefined") {
      var run = null;
      try { run = ZiniumRuntime.processChat(q, result); }
      catch (e) { run = { ok: false, error: String(e && e.message ? e.message : e) }; }
      lastRun = run;
      var z = document.createElement("div"); z.className = "meta";
      if (run && run.spine && run.spine.ok) {
        z.textContent = "ZINIUM run (in this app): seeded-reference backbone generated " +
          run.generatedTokens.length + " continuation tokens · spine routed via " +
          run.spine.chainName + " (digest " + run.spine.digest.slice(0, 12) + "…) · mesh checksum " +
          (run.mesh.verified ? "verified" : "FAILED") + " · " + run.ms + " ms. " +
          "Continuation (untrained reference head — characters, not words): " + run.continuation;
      } else {
        z.textContent = "ZINIUM run FAILED — error shown, not hidden: " +
          (run ? (run.error || (run.spine && run.spine.error) || "unknown") : "runtime unavailable");
      }
      log.appendChild(z);
      renderZiniumLive();
    }
    $("intake-area").style.display = (result.status === "MISS" && result.proposal) ? "block" : "none";
    $("q").value = "";
    window.scrollTo(0, document.body.scrollHeight);
  }
  $("ask").addEventListener("click", ask);
  $("q").addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
  /* ---------- ZINIUM live panel (chat tab): the runtime, visible ---------- */
  function renderZiniumLive() {
    var box = $("zinium-live");
    if (!box || typeof ZiniumRuntime === "undefined") return;
    try {
      var st = ZiniumRuntime.status();
      var chains = st.chains.map(function (c) {
        return "<div style=\"margin:6px 0\"><b>" + esc(c.name) + "</b>" +
          "<br><span class=\"small\">" + esc(c.role) + "</span>" +
          "<br><span class=\"small\">Processes routed: " + c.processed +
          (c.lastDigest ? " · last digest " + esc(c.lastDigest.slice(0, 16)) + "…" : "") +
          "</span></div>";
      }).join("");
      box.innerHTML = "<h3>ZINIUM — running in this app</h3>" +
        "<p class=\"small\">The neural backbone (seeded reference model — deterministic " +
        "weights, NOT trained, NOT a learned LLM), the spine, and the mesh checksum all " +
        "run here on this phone, on every chat message. The five chain processor records " +
        "below are instantiated in the app and route each message. Answers still come " +
        "from the chain records; the backbone aids the processing trace only and never " +
        "decides, executes, signs, spends, or trades. GPU: none (CPU only). " +
        "Spine errors recorded: " + st.spineErrors + ".</p>" + chains +
        ((lastRun && lastRun.spine && lastRun.spine.ok) ?
          "<p class=\"small\"><b>Last run:</b> " + esc(lastRun.lane) + " lane → chain " +
          lastRun.spine.chain + " · backbone continuation (untrained — characters, not " +
          "words): <code>" + esc(lastRun.continuation) + "</code></p>" : "");
    } catch (e) {
      box.innerHTML = "<h3>ZINIUM — running in this app</h3>" +
        "<p class=\"small\">Status render failed — shown, not hidden: " + esc(String(e)) + "</p>";
    }
  }

  $("queue-intake").addEventListener("click", function () {
    if (!lastProposal) return;
    var stored = loadLS("zinium-phone-intake-proposals");
    stored.push({ question: $("chat-log").lastChild ? "" : "", proposal: lastProposal, queued_at: new Date().toISOString() });
    stored[stored.length - 1].question = document.querySelectorAll(".msg.user");
    stored[stored.length - 1].question = stored[stored.length - 1].question.length ?
      stored[stored.length - 1].question[stored[stored.length - 1].question.length - 1].textContent : "";
    saveLS("zinium-phone-intake-proposals", stored);
    $("intake-area").style.display = "none";
    renderSettings();
  });

  /* ---------- cube tab: live chain state on this phone ---------- */
  function renderCubeState() {
    var box = $("cube-chain-state");
    if (!box) return;
    var v = ZiniumLedger.verifyChain();
    var cube = ZiniumManifest.cubeStatus();
    box.innerHTML = "<b>Running chain on this phone:</b> " +
      (v.ok ? "genesis headers verified (" + v.blocks + " blocks, last " +
        esc(v.last_hash.slice(0, 16)) + "…)" : "ledger check: " + esc(v.reason)) +
      " · <b>Answerable in chat:</b> " + ZiniumCore.recordCount() + " bundled records + " +
      ZiniumManifest.listLocalRecords().length + " locally adopted tokens" +
      " · <b>Cube:</b> " + cube.used_mb + " MB used of " + cube.cap_mb + " MB cap" +
      " · The WebGL render below is still the artistic demo slice; the numbers above are this phone's live chain." +
      ((typeof ZiniumRuntime !== "undefined") ?
        " <b>ZINIUM runtime:</b> " + ZiniumRuntime.status().chains.map(function (c) {
          return "chain " + c.id + " (" + c.processed + " routed)";
        }).join(", ") + " — backbone, spine, and mesh run in this app (seeded reference model, untrained)." : "");
  }

  /* ---------- reports ---------- */
  function renderReports() {
    var v = ZiniumLedger.verifyChain();
    $("verify-result").textContent = v.ok ? "Chain OK: " + v.blocks + " blocks, last " + v.last_hash.slice(0, 16) + "…" : "BROKEN: " + v.reason;
    $("ledger-view").innerHTML = ZiniumLedger.headers.map(function (h) {
      return "<div><b>Block " + h.block + "</b> " + esc(h.kind || "genesis") +
        "<br><span class='small'>hash " + h.hash.slice(0, 24) + "…<br>prev " +
        h.previous_hash.slice(0, 24) + "…</span></div>";
    }).join("");
    $("chain-status").innerHTML = "<b>System:</b> ZINIUM 1000^5 · <b>Brainchain chain:</b> 500 · " +
      "<b>Center:</b> (500, 500, 500, 500, 500) · <b>Blocks:</b> " + ZiniumLedger.headers.length +
      " · <b>Records:</b> " + ZiniumCore.recordCount() + " bundled + " +
      ZiniumManifest.listLocalRecords().length + " adopted locally · <b>Agencies:</b> 32 (DRAFT, awaiting instructions)";
    $("records-view").innerHTML = ZINIUM_RECORDS.map(function (r) {
      return "<div><b>" + esc(r.title) + "</b> <span class='small'>[" + esc(r.lane) + "]</span><br>" +
        esc(r.lead) + "</div>";
    }).join("") + "<h3>Adopted locally</h3>" + (ZiniumManifest.listLocalRecords().map(function (r) {
      return "<div><b>" + esc(r.title) + "</b> <span class='small'>[" + esc(r.lane) + ", token " + esc(r.id) + "]</span></div>";
    }).join("") || "<span class='small'>None yet.</span>");
    $("agencies-view").innerHTML = "<span class='small'>All 32 first-cube agencies: DRAFT, awaiting instructions, load 0.1. " +
      "Coordinates span axes 500/501 in 5 dimensions; center (500, 500, 500, 500, 500).</span>" +
      ZINIUM_AGENCIES.slice(0, 8).map(function (a) {
        return "<div class='small'>(" + a.coordinate.join(", ") + ") — " + esc(a.status) + ", " + esc(a.operational_state) + "</div>";
      }).join("") + "<div class='small'>… and 24 more (same mandate, same status).</div>";
    renderApprovalQueue();
    renderLocalChains();
  }
  function renderApprovalQueue() {
    var box = $("approval-queue");
    var socks = ZiniumManifest.listSocketQueue();
    var learns = loadLS(LS_LEARN);
    if (!socks.length && !learns.length) {
      box.innerHTML = "<span class='small'>Queue empty.</span>"; return;
    }
    var html = "";
    socks.forEach(function (e) {
      html += "<div class='card'><h3>Socket deposit: " + esc(e.item.title) + "</h3>" +
        "<div class='small'>category " + esc(e.item.category) + " · need: " + esc(e.item.recorded_need) +
        " · provenance: " + esc(e.item.provenance) + "</div><div>" + esc(e.item.body) + "</div>" +
        "<button data-sock-approve='" + e.id + "'>Approve &amp; adopt</button> " +
        "<button data-sock-drop='" + e.id + "' class='secondary'>Drop</button></div>";
    });
    learns.forEach(function (e) {
      html += "<div class='card'><h3>Browser learn: " + esc(e.title) + "</h3>" +
        "<div class='small'>category " + esc(e.category) + " · need: " + esc(e.need) +
        " · provenance: " + esc(e.url) + "</div><div>" + esc(e.summary) + "</div>" +
        "<button data-learn-approve='" + e.id + "'>Approve &amp; adopt</button> " +
        "<button data-learn-drop='" + e.id + "' class='secondary'>Drop</button></div>";
    });
    box.innerHTML = html;
    box.querySelectorAll("[data-sock-approve]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-sock-approve");
        var entry = socks.filter(function (e) { return e.id === id; })[0];
        var r = ZiniumManifest.adoptKnowledge({ title: entry.item.title, body: entry.item.body,
          provenance: entry.item.provenance, approved_by: "human-via-socket-queue",
          lane: entry.item.category, supersedes: entry.item.supersedes || null });
        if (!r.ok) { alert("Not adopted: " + r.reason); return; }
        ZiniumManifest.dropSocketItem(id);
        renderReports(); renderManifest();
      });
    });
    box.querySelectorAll("[data-sock-drop]").forEach(function (b) {
      b.addEventListener("click", function () {
        ZiniumManifest.dropSocketItem(b.getAttribute("data-sock-drop")); renderReports();
      });
    });
    box.querySelectorAll("[data-learn-approve]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-learn-approve");
        var entry = learns.filter(function (e) { return e.id === id; })[0];
        var r = ZiniumManifest.adoptKnowledge({ title: entry.title, body: entry.summary,
          provenance: entry.url, approved_by: "human", lane: entry.category });
        if (!r.ok) { alert("Not adopted: " + r.reason); return; }
        saveLS(LS_LEARN, loadLS(LS_LEARN).filter(function (e) { return e.id !== id; }));
        renderReports(); renderManifest();
      });
    });
    box.querySelectorAll("[data-learn-drop]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-learn-drop");
        saveLS(LS_LEARN, loadLS(LS_LEARN).filter(function (e) { return e.id !== id; }));
        renderReports();
      });
    });
  }
  function renderLocalChains() {
    var drafts = ZiniumLedger.listDrafts(), active = ZiniumLedger.listActive();
    var html = "<div class='small'>Drafts: " + drafts.length + " · Active: " + active.length + "</div>";
    drafts.forEach(function (d) {
      html += "<div class='card'><b>" + esc(d.name) + "</b> <span class='small'>DRAFT · need: " + esc(d.need) + "</span><br>" +
        "<button data-activate='" + d.id + "' class='secondary'>Run parity gate → activate</button> " +
        "<button data-rollback='" + d.id + "' class='danger'>Rollback (delete draft)</button> " +
        "<span class='small' id='chain-msg-" + d.id + "'></span></div>";
    });
    active.forEach(function (a) {
      html += "<div class='card'><b>" + esc(a.name) + "</b> <span class='small'>ACTIVE · " + esc(a.parity || "") + "</span></div>";
    });
    $("local-chains").innerHTML = html;
    document.querySelectorAll("[data-activate]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-activate");
        var r = ZiniumLedger.activateDraft(id);
        var m = document.getElementById("chain-msg-" + id);
        if (m) m.textContent = r.ok ? "Activated." : "Stays DRAFT: " + r.reason;
        renderLocalChains();
      });
    });
    document.querySelectorAll("[data-rollback]").forEach(function (b) {
      b.addEventListener("click", function () {
        ZiniumLedger.rollbackDraft(b.getAttribute("data-rollback")); renderLocalChains();
      });
    });
  }
  $("verify-ledger").addEventListener("click", renderReports);
  $("request-chain").addEventListener("click", function () {
    var name = $("chain-name").value.trim(), need = $("chain-need").value.trim();
    if (!name || !need) { alert("A chain needs a name and a recorded need, in words."); return; }
    var r = ZiniumLedger.requestChain(name, need, false);
    if (!r.ok) { alert(r.reason); return; }
    $("chain-name").value = ""; $("chain-need").value = "";
    renderLocalChains();
  });

  /* ---------- browse / learn ---------- */
  function isX(url) {
    var u = (url || "").toLowerCase();
    return u.indexOf("twitter.com") !== -1 || u.indexOf("x.com") !== -1 || u.indexOf("t.co") !== -1;
  }
  $("open-browser").addEventListener("click", function () {
    if (bridge && bridge.openBrowser) { bridge.openBrowser(""); }
    else { $("browser-note").textContent = "Native in-app browser is available in the installed APK. In this web preview, use the form below: visit the page in your own browser, then paste its URL and write your own-words summary here."; }
  });
  window.onLearnCandidate = function (url, title) {
    switchTab("browse");
    $("learn-url").value = url || "";
    $("learn-title").value = title || "";
    $("learn-result").textContent = "Page sent from the in-app browser. Write your own-words summary and send it to the approval queue — nothing is adopted until you approve it.";
  };
  $("send-learn").addEventListener("click", function () {
    var url = $("learn-url").value.trim(), title = $("learn-title").value.trim(),
        summary = $("learn-summary").value.trim(), cat = $("learn-category").value,
        need = $("learn-need").value.trim();
    if (!url || !title || !summary || !need) { $("learn-result").textContent = "All fields are required."; return; }
    if (isX(url)) { $("learn-result").textContent = "Refused: X/Twitter content is never adopted into records."; return; }
    var q = loadLS(LS_LEARN);
    q.push({ id: "learn-" + Date.now(), url: url, title: title, summary: summary,
             category: cat, need: need, sent_at: new Date().toISOString() });
    if (!saveLS(LS_LEARN, q)) { $("learn-result").textContent = "Storage write failed — nothing queued."; return; }
    $("learn-result").textContent = "Queued for your approval (Reports → Approval queue). Nothing adopted yet.";
    $("learn-url").value = ""; $("learn-title").value = ""; $("learn-summary").value = ""; $("learn-need").value = "";
  });

  /* ---------- manifest ---------- */
  function renderManifest() {
    var m = ZiniumManifest.buildManifest();
    $("manifest-view").innerHTML = "<div class='card'><pre>" + esc(JSON.stringify(m, null, 1)) + "</pre></div>";
    var cube = ZiniumManifest.cubeStatus();
    $("cube-view").innerHTML = "<div>Cap: <b>" + cube.cap_mb + " MB</b> (hard cap) · used: " +
      cube.used_mb + " MB (" + cube.used_bytes + " bytes) · at cap: <b>" + (cube.at_cap ? "YES" : "no") + "</b></div>" +
      (cube.at_cap ? "<div class='small'>Adoption is stopped. Choose: ADOPT the compiled libraries into ZINIUM (relay out, then free/continue) or ALLOCATE MORE SPACE (your call).</div>" : "<div class='small'>Expansive only up to the cap. No flashing — app install created this cube in allocated space.</div>");
    $("cap-actions").style.display = cube.at_cap ? "block" : "none";
    $("libraries-view").innerHTML = (ZiniumManifest.libraries().map(function (lib) {
      return "<div><b>" + esc(lib.lane) + "</b> — " + lib.tokens + " token(s) <span class='small'>" + esc(lib.token_ids.join(", ")) + "</span></div>";
    }).join("") || "<span class='small'>No libraries yet — learning creates them, one gated adoption at a time.</span>");
    $("advancements-view").innerHTML = (ZiniumManifest.listAdvancements().map(function (a) {
      return "<div><b>" + esc(a.what) + "</b> <span class='small'>" + esc(a.at) + " · " + esc(a.provenance) + "</span></div>";
    }).join("") || "<span class='small'>No advancements yet — the manifest advances only by gated learning.</span>");
    $("tokens-view").innerHTML = (ZiniumManifest.listLocalRecords().map(function (t) {
      return "<div><b>" + esc(t.title) + "</b> <span class='small'>[" + esc(t.lane) + ", token " + esc(t.id) +
        ", provenance: " + esc(t.provenance) + "]</span></div>";
    }).join("") || "<span class='small'>No adopted learning tokens yet.</span>");
  }
  $("refresh-manifest").addEventListener("click", renderManifest);
  $("export-libraries").addEventListener("click", function () {
    var v = $("export-view");
    v.style.display = "block";
    v.textContent = JSON.stringify({ exported_at: new Date().toISOString(),
      note: "Compiled libraries export (ADOPT path). Relay to ZINIUM happens through the owner's relay — the phone has no backend; this export is what gets relayed out, then the cube frees/continues on the owner's word.",
      tokens: ZiniumManifest.listLocalRecords(),
      advancements: ZiniumManifest.listAdvancements() }, null, 1);
  });
  $("allocate-more").addEventListener("click", function () {
    if (!window.confirm("Allocate more cube space? This is your call — the cap only moves when you say so.")) return;
    var n = window.prompt("New cube cap in MB (current: " + ZiniumManifest.effectiveCubeCapMB() + "):", "8192");
    if (n === null) return;
    var r = ZiniumManifest.setCubeCapMB(n);
    if (!r.ok) { alert("Not changed: " + r.reason); return; }
    renderManifest();
  });

  /* ---------- settings ---------- */
  function renderSettings() {
    var caps = ZiniumSpace.ALLOCATION;
    $("alloc-view").innerHTML = "<div class='small'>Install manifest allocation (checked, not just documented): " +
      "minimum free space " + caps.min_free_space_mb + " MB · ledger cap " + caps.ledger_cap_mb +
      " MB · records cap " + caps.records_cap_mb + " MB · modules cap " + caps.modules_cap_mb +
      " MB · total app cap " + caps.total_app_cap_mb + " MB · cube space " + caps.cube_space_mb +
      " MB (hard cap).</div>";
    var cube = ZiniumManifest.cubeStatus();
    $("cube-settings-view").innerHTML = "<div class='small'>One ZINIUM⁵ cube, allocated space, hard cap " +
      cube.cap_mb + " MB · used " + cube.used_mb + " MB · at cap: " + (cube.at_cap ? "YES — adoption stopped until you choose ADOPT or ALLOCATE MORE SPACE" : "no") +
      ". No flashing: app install created this cube. Only HALEX-AI + its ZINIUM⁵ chain are installed.</div>";
    if (bridge && bridge.getGithubState) {
      try { $("github-state").textContent = bridge.getGithubState(); } catch (e) { $("github-state").textContent = "GitHub state unavailable."; }
    } else {
      $("github-state").textContent = "GitHub is READ-ONLY in this web preview (no token vault here). In the installed APK, save your own token to app private storage to enable gated writes; without a token, GitHub stays read-only.";
    }
    $("proposals-view").innerHTML = (loadLS("zinium-phone-intake-proposals").map(function (p) {
      return "<div class='small'>" + esc(p.question) + "</div>";
    }).join("") || "<span class='small'>None queued.</span>");
    $("show-trace").checked = localStorage.getItem(LS_TRACE) !== "0";
    refreshSocketStatus();
  }
  $("save-github-token").addEventListener("click", function () {
    var tok = $("github-token").value.trim();
    if (!tok) { $("github-result").textContent = "Paste a token first — or leave it empty and GitHub stays read-only."; return; }
    if (bridge && bridge.setGithubToken) {
      try {
        $("github-result").textContent = bridge.setGithubToken(tok);
        $("github-token").value = "";
        renderSettings();
      } catch (e) { $("github-result").textContent = "Token not saved: " + e; }
    } else {
      $("github-result").textContent = "Not saved: the token vault lives in the installed APK's app private storage. Never paste a real token into a web preview — it would land in page storage, not the vault.";
      $("github-token").value = "";
    }
  });
  $("show-trace").addEventListener("change", function () {
    localStorage.setItem(LS_TRACE, $("show-trace").checked ? "1" : "0");
  });
  $("show-directives").addEventListener("click", function () {
    var v = $("directives-view");
    v.style.display = (v.style.display === "none") ? "block" : "none";
    v.textContent = window.ZINIUM_DIRECTIVES || "Directives not bundled.";
  });
  $("run-probe").addEventListener("click", function () {
    ZiniumSpace.probe(function (res) {
      var free = (bridge && bridge.getFreeSpaceMB) ? bridge.getFreeSpaceMB() : null;
      var check = ZiniumSpace.checkInstall(free);
      $("probe-view").innerHTML = "<div>Probe tier: <b>" + res.tier + "</b> · storage quota: " +
        (res.quota_bytes === null ? "unknown" : Math.round(res.quota_bytes / 1024 / 1024) + " MB") +
        " · RAM: " + (res.ram_gb === null ? "unknown" : res.ram_gb + " GB") +
        " · device free space: " + (free === null || free < 0 ? "unknown" : Math.round(free) + " MB") + "</div>" +
        "<div class='" + (check.ok ? "" : "warn") + "'>" + esc(check.ok ? ("Deployment fits: " + (check.note || ("free " + Math.round(free) + " MB"))) : check.reason) + "</div>";
    });
  });
  function refreshSocketStatus() {
    if (bridge && bridge.getSocketStatus) {
      try { $("socket-status").textContent = bridge.getSocketStatus(); } catch (e) { $("socket-status").textContent = "socket status unavailable"; }
    } else {
      $("socket-status").textContent = "Native socket runs in the installed APK (loopback 127.0.0.1:47291, opt-in). Not available in this web preview.";
    }
    var btn = $("socket-toggle");
    if (bridge && bridge.setSocketEnabled) {
      btn.textContent = "Toggle agent socket";
    } else { btn.disabled = true; }
  }
  $("socket-toggle").addEventListener("click", function () {
    if (bridge && bridge.setSocketEnabled) {
      var cur = false;
      try { cur = bridge.getSocketStatus().indexOf("ON") !== -1; } catch (e) {}
      bridge.setSocketEnabled(!cur);
      refreshSocketStatus();
    }
  });

  /* ---------- first-run allocation check ---------- */
  (function firstRun() {
    var free = null;
    try { if (bridge && bridge.getFreeSpaceMB) { var f = bridge.getFreeSpaceMB(); free = (f >= 0) ? f : null; } } catch (e) {}
    var check = ZiniumSpace.checkInstall(free);
    var banner = $("alloc-banner");
    if (!check.ok) {
      banner.className = "banner warn";
      banner.textContent = "Local deployment refused: " + check.reason;
    } else {
      banner.className = "banner ok";
      banner.textContent = "Single deployment fits this phone. " +
        (free === null ? "Free space unknown in this preview — writes are still capped." : ("Free space: " + Math.round(free) + " MB (minimum 100 MB).")) +
        " Bundled records are read-only; local writes are capped per store.";
    }
  })();

  /* ---------- new tabs: wire once at load (never on every visit,
     so the robot task is not reset by switching tabs) ---------- */
  function feedTrainDistance() {
    /* Distance wiring: the mapping store holds the points (user opted
       in there); the training store receives only the metre total.
       Coordinates are never copied into the training store. */
    try {
      if (typeof ChainMapping === "undefined" || typeof TrainZinium === "undefined") return;
      if (!TrainZinium.isRunning()) return;
      var pts = ChainMapping.getPoints();
      if (!pts.length) return;
      var last = pts[pts.length - 1];
      TrainZinium.updateDistance(last.lat, last.lon);
    } catch (e) {}
  }
  (function wireNewTabs() {
    try { if (typeof ChainShare !== "undefined") ChainShare.init({ capability: "share-capability", scan: "share-scan", scanResult: "share-scan-result", export: "share-export", exportOutput: "share-export-output", importInput: "share-import-input", importButton: "share-import", importResult: "share-import-result", pending: "share-pending", shareSheetNote: "share-sheet-note" }); } catch (e) {}
    try { if (typeof WifiRelay !== "undefined") WifiRelay.init({ capability: "wifi-capability", linkState: "wifi-link-state", ssidInput: "wifi-ssid-input", ssidSave: "wifi-ssid-save", endpointInput: "wifi-endpoint-input", endpointSave: "wifi-endpoint-save", endpointClear: "wifi-endpoint-clear", probeButton: "wifi-probe", probeResult: "wifi-probe-result", packetButton: "wifi-packet", packetOutput: "wifi-packet-output" }); } catch (e) {}
    try { if (typeof ChainMapping !== "undefined") ChainMapping.init({ enable: "mapping-enable", status: "mapping-status", canvas: "mapping-canvas", list: "mapping-list", count: "mapping-count", storage: "mapping-storage", deleteAll: "mapping-delete-all" }); } catch (e) {}
    try { if (typeof TrainZinium !== "undefined") TrainZinium.init({ enable: "train-enable", status: "train-status", capabilities: "train-capabilities", categories: "train-categories", report: "train-report", choices: "train-choices", finish: "train-finish", continueWeek: "train-continue-week", stop: "train-stop", delete: "train-delete", approve: "train-approve" }); } catch (e) {}
    try { if (typeof RobotArm !== "undefined") RobotArm.init({ canvas: "robot-arm-canvas", state: "robot-arm-state", steps: "robot-arm-steps", log: "robot-arm-log", lastCommand: "robot-arm-command", baseSlider: "robot-arm-base-slider", baseMinus: "robot-arm-base-minus", basePlus: "robot-arm-base-plus", baseValue: "robot-arm-base-value", shoulderSlider: "robot-arm-shoulder-slider", shoulderMinus: "robot-arm-shoulder-minus", shoulderPlus: "robot-arm-shoulder-plus", shoulderValue: "robot-arm-shoulder-value", elbowSlider: "robot-arm-elbow-slider", elbowMinus: "robot-arm-elbow-minus", elbowPlus: "robot-arm-elbow-plus", elbowValue: "robot-arm-elbow-value", gripSlider: "robot-arm-grip-slider", gripOpen: "robot-arm-grip-open", gripClose: "robot-arm-grip-close", gripValue: "robot-arm-grip-value", reset: "robot-arm-reset" }); } catch (e) {}
    try { if (typeof RobotArm !== "undefined") wireRoboticsTraining(); } catch (e) {}
    try { if (typeof GithubSwitch !== "undefined") GithubSwitch.init({ toggle: "github-switch-toggle", status: "github-switch-status", repoOwner: "github-repo-owner", repoName: "github-repo-name", repoCheck: "github-repo-check", repoResult: "github-repo-result" }); } catch (e) {}
    try { if (typeof Proposals !== "undefined") Proposals.init({ proposalTitle: "proposal-title", proposalText: "proposal-text", proposalSubmit: "proposal-submit", proposalStatus: "proposal-status", feedbackText: "feedback-text", feedbackSubmit: "feedback-submit", feedbackStatus: "feedback-status", pendingList: "connect-pending-list" }); } catch (e) {}
    try { if (typeof ZiniumLink !== "undefined") ZiniumLink.init({ availability: "z2z-availability", endpointInput: "z2z-endpoint-input", endpointSave: "z2z-endpoint-save", endpointSelect: "z2z-endpoint-select", pickButton: "z2z-pick", peerResult: "z2z-peer-result", helloButton: "z2z-hello", helloOutput: "z2z-hello-output", acceptButton: "z2z-accept", packetButton: "z2z-packet", packetOutput: "z2z-packet-output", sessionState: "z2z-session-state", receiveInput: "z2z-receive-input", receiveButton: "z2z-receive", receiveResult: "z2z-receive-result", pending: "z2z-pending", manualNote: "z2z-manual-note", sendButton: "z2z-send", sendResult: "z2z-send-result" }); } catch (e) {}
    try { if (typeof UserTracking !== "undefined") UserTracking.init({ status: "tracking-status",
      sensorsToggle: "sensorsToggle", sensorsStatus: "sensorsStatus", sensorsData: "sensorsData", sensorsDelete: "sensorsDelete",
      "mapping-shareToggle": "mapping-shareToggle", "mapping-shareStatus": "mapping-shareStatus", "mapping-shareData": "mapping-shareData", "mapping-shareDelete": "mapping-shareDelete",
      "activity-shareToggle": "activity-shareToggle", "activity-shareStatus": "activity-shareStatus", "activity-shareData": "activity-shareData", "activity-shareDelete": "activity-shareDelete",
      tvToggle: "tvToggle", tvStatus: "tvStatus", tvData: "tvData", tvDelete: "tvDelete",
      appuseToggle: "appuseToggle", appuseStatus: "appuseStatus", appuseData: "appuseData", appuseDelete: "appuseDelete",
      picturesToggle: "picturesToggle", picturesStatus: "picturesStatus", picturesData: "picturesData", picturesDelete: "picturesDelete",
      notesToggle: "notesToggle", notesStatus: "notesStatus", notesData: "notesData", notesDelete: "notesDelete",
      questionsToggle: "questionsToggle", questionsStatus: "questionsStatus", questionsData: "questionsData", questionsDelete: "questionsDelete",
      tasksToggle: "tasksToggle", tasksStatus: "tasksStatus", tasksData: "tasksData", tasksDelete: "tasksDelete",
      rfidToggle: "rfidToggle", rfidStatus: "rfidStatus", rfidData: "rfidData", rfidDelete: "rfidDelete",
      fingerprintToggle: "fingerprintToggle", fingerprintStatus: "fingerprintStatus", fingerprintData: "fingerprintData", fingerprintDelete: "fingerprintDelete",
      facialToggle: "facialToggle", facialStatus: "facialStatus", facialData: "facialData", facialDelete: "facialDelete",
      appactivityToggle: "appactivityToggle", appactivityStatus: "appactivityStatus", appactivityData: "appactivityData", appactivityDelete: "appactivityDelete",
      activityCategories: "activityCategories", appactivityButtons: "appactivityButtons",
      pictureLog: "pictureLog",
      notesAdd: "notesAdd", notesInput: "notesInput",
      tasksAdd: "tasksAdd", tasksInput: "tasksInput",
      rfidDeviceAdd: "rfidDeviceAdd", rfidDeviceInput: "rfidDeviceInput",
      rfidDraftAdd: "rfidDraftAdd", rfidDraftDevice: "rfidDraftDevice", rfidDraftLabel: "rfidDraftLabel", rfidSendAttempt: "rfidSendAttempt",
      fingerprintAttempt: "fingerprintAttempt", facialAttempt: "facialAttempt",
      mappingEndpointSave: "mappingEndpointSave", mappingEndpointInput: "mappingEndpointInput", mappingShareOnce: "mappingShareOnce",
      activityEndpointSave: "activityEndpointSave", activityEndpointInput: "activityEndpointInput", activityShareOnce: "activityShareOnce",
      deleteAll: "deleteAll",
      "questionsAnswer-q1": "questionsAnswer-q1", "questionsInput-q1": "questionsInput-q1", "questionsSkip-q1": "questionsSkip-q1",
      "questionsAnswer-q2": "questionsAnswer-q2", "questionsInput-q2": "questionsInput-q2", "questionsSkip-q2": "questionsSkip-q2",
      "questionsAnswer-q3": "questionsAnswer-q3", "questionsInput-q3": "questionsInput-q3", "questionsSkip-q3": "questionsSkip-q3",
      "questionsAnswer-q4": "questionsAnswer-q4", "questionsInput-q4": "questionsInput-q4", "questionsSkip-q4": "questionsSkip-q4",
      "questionsAnswer-q5": "questionsAnswer-q5", "questionsInput-q5": "questionsInput-q5", "questionsSkip-q5": "questionsSkip-q5",
      aggregateShow: "aggregateShow", aggregateOutput: "aggregateOutput", aggregateApprove: "aggregateApprove" }); } catch (e) {}
    try { renderZiniumLive(); } catch (e) {}
    try { if (typeof Ai2Ai !== "undefined") Ai2Ai.init({ availability: "ai2ai-availability", announceInput: "ai2ai-announce-input", announceButton: "ai2ai-announce", announceResult: "ai2ai-announce-result", connections: "ai2ai-connections", acceptButton: "ai2ai-accept", rejectButton: "ai2ai-reject", workspaceView: "ai2ai-workspace", messageInput: "ai2ai-message-input", messageButton: "ai2ai-message-send", offerKind: "ai2ai-offer-kind", offerTitle: "ai2ai-offer-title", offerSummary: "ai2ai-offer-summary", offerButton: "ai2ai-offer-send", offerResult: "ai2ai-offer-result", pending: "ai2ai-pending", exportBtn: "ai2ai-export", exportOutput: "ai2ai-export-output", shareSheetNote: "ai2ai-share-note", learnButton: "ai2ai-learn", learnResult: "ai2ai-learn-result" }); } catch (e) {}
  })();

  function wireRoboticsTraining() {
    var current = null;
    var stateEl = document.getElementById("robotics-training-state");
    var stepsEl = document.getElementById("robotics-training-steps");
    var logEl = document.getElementById("robotics-training-log");
    var recordsEl = document.getElementById("robotics-training-records");
    var reviewEl = document.getElementById("robotics-training-review");
    var reviewResultEl = document.getElementById("robotics-training-review-result");
    if (!stateEl || !stepsEl || !logEl || !recordsEl) return;
    function renderReview() {
      if (!reviewEl) return;
      reviewEl.textContent = "";
      var records = RobotArm.loadTrainingRecords(window.localStorage);
      records.forEach(function (rec, idx) {
        var row = document.createElement("div");
        row.textContent = rec.routineName + " — " + rec.outcome + " in " +
          rec.stepsTaken + " steps (" + rec.timestamp + ").";
        var ap = document.createElement("button");
        ap.textContent = "Approve into chain"; ap.className = "secondary";
        ap.addEventListener("click", function () {
          var r = RobotArm.adoptTrainingRecord(rec);
          if (r.ok) {
            RobotArm.dropTrainingRecordAt(idx, window.localStorage);
            if (reviewResultEl) reviewResultEl.textContent =
              "Approved and adopted into the chain records (simulated practice only).";
          } else if (reviewResultEl) {
            reviewResultEl.textContent = "Not adopted: " + r.reason;
          }
          render();
        });
        var rj = document.createElement("button");
        rj.textContent = "Reject"; rj.className = "secondary";
        rj.addEventListener("click", function () {
          RobotArm.dropTrainingRecordAt(idx, window.localStorage);
          render();
        });
        row.appendChild(ap); row.appendChild(rj);
        reviewEl.appendChild(row);
      });
    }
    function render() {
      renderReview();
      if (!current) { stateEl.textContent = "Choose a routine above."; return; }
      var st = current.getState();
      stateEl.textContent = st.routineName + " — " + st.state;
      stepsEl.textContent = String(st.stepCount);
      logEl.textContent = st.log.map(function (e) {
        return "Step " + e.step + " · " + e.time + " · " + e.event + " — " + e.detail;
      }).join("\n");
      /* When a routine finishes, its record is stored on this phone only. */
      var record = current.toTrainingRecord();
      if (record && !current._recordStored) {
        current._recordStored = true;
        RobotArm.storeTrainingRecord(record, window.localStorage);
      }
      recordsEl.textContent = JSON.stringify(
        RobotArm.loadTrainingRecords(window.localStorage), null, 2);
    }
    function start(id) {
      current = RobotArm.createRoutine(id);
      if (current) render();
    }
    document.querySelectorAll("[data-routine]").forEach(function (btn) {
      btn.addEventListener("click", function () { start(btn.getAttribute("data-routine")); });
    });
    function act(fn) { if (current) { fn(); render(); } }
    document.getElementById("robotics-training-pick").addEventListener("click", function () {
      act(function () {
        var st = current.getState();
        var order = { "stack-blocks": ["block-a", "block-b", "block-c"],
                      "pick-place-sort": ["item-1", "item-2", "item-3"] };
        var next = (order[st.routineId] || [])[st.progress];
        if (!next) {
          next = ["item-small", "item-medium", "item-large"].filter(function (id) {
            return st.placed.indexOf(id) === -1;
          })[0];
        }
        current.pick(next);
      });
    });
    document.getElementById("robotics-training-place").addEventListener("click", function () {
      act(function () {
        var st = current.getState();
        var slots = [0, 1, 2];
        var bins = { "block-a": "small-bin", "item-small": "small-bin", "item-1": "small-bin",
                     "item-medium": "medium-bin", "item-2": "medium-bin",
                     "item-large": "large-bin", "item-3": "large-bin" };
        if (st.routineId === "stack-blocks") current.place(slots[st.progress]);
        else current.place(bins[st.holding]);
      });
    });
    document.getElementById("robotics-training-waypoint").addEventListener("click", function () {
      act(function () {
        var st = current.getState();
        current.moveTo("waypoint-" + (st.progress + 1));
      });
    });
    document.getElementById("robotics-training-move").addEventListener("click", function () {
      act(function () {
        var st = current.getState();
        var seq = ["turn-base", "raise-shoulder", "bend-elbow", "close-gripper"];
        current.input(seq[st.progress]);
      });
    });
    document.getElementById("robotics-training-abort").addEventListener("click", function () {
      act(function () { current.abort(); });
    });
    document.getElementById("robotics-training-reset").addEventListener("click", function () {
      act(function () { current.reset(); current._recordStored = false; });
    });
    render();
  }

  renderReports();
})();
