/* ---------------- ZCURE client half ----------------
   The client half of the HALEX ZCURE handshake (design: Jeffrey's locked
   spec, 2026-10-07). ZCURE is the almost-dormant integrity layer: at
   handshake time it receives the passive watcher's modification record,
   inspects the connection and the data passed for scam/hacker code, and
   the session presents as connected only on ALLOW. Known-good connects;
   tampered or untrusted does not. Fail-closed throughout.

   What genuinely runs HERE, in the page:
   1. A passive watcher record for the wallet session store: every save
      appends a hash-chained entry (SHA-256) over the session as stored.
      A session edited after it was recorded (devtools, a hostile
      extension, anything) no longer matches the chain head, and a chain
      edited after the fact no longer recomputes: both are refused.
   2. The UXSS + SHELL inspection of the connection descriptors (wallet
      name, via, chain label, address) — the same patterns as the
      halex_security gates, mirrored in JS.
   The AUTHORITY is the Python verifier (halex-security/zcure), which
   holds the known-good manifest on the verifying side. This page holds
   no manifest, so a determined attacker with full control of this
   browser could rebuild the local chain: the client half catches
   tampering that does not rewrite history, and its verdicts are the
   record the authority will judge. It never fakes the remote leg:
   ZCURE_ENDPOINT is empty, so remote verification reports NOT WIRED
   and the handshake rests on the local legs only.
   ZCURE only allows or refuses connections. It signs nothing, sends
   nothing, and never touches keys. */
(function(){
  "use strict";
  var WATERMARK = "HALEX-ZCURE-1";
  var WATCH_KEY = "halex.zcure.watch.v1";
  var LOG_KEY = "halex.zcure.log.v1";
  var ZCURE_ENDPOINT = "";            /* empty: remote leg NOT WIRED */
  var GENESIS = "GENESIS:" + WATERMARK;

  var UXSS_PATTERNS = [
    [/<\s*script/i, "script tag"],
    [/javascript\s*:/i, "javascript: URI"],
    [/on\w+\s*=/i, "event handler attribute"],
    [/<\s*iframe/i, "iframe tag"],
    [/<\s*object/i, "object tag"],
    [/<\s*embed/i, "embed tag"],
    [/eval\s*\(/i, "eval() call"],
    [/document\s*\.\s*cookie/i, "cookie access"],
    [/window\s*\.\s*location/i, "location hijack"],
    [/<\s*svg[^>]*on/i, "svg event handler"]
  ];
  var SHELL_PATTERNS = [
    [/\$\(/, "command substitution $("],
    [/`[^`]+`/, "backtick execution"],
    [/;\s*(rm|mv|cp|chmod|chown|dd|mkfs)\b/i, "destructive shell chaining"],
    [/curl[^\n]*\|\s*(sh|bash)/i, "curl-pipe-shell"],
    [/wget[^\n]*\|\s*(sh|bash)/i, "wget-pipe-shell"],
    [/\.\.\//, "path traversal"],
    [/__import__\s*\(/, "python import hook"],
    [/os\s*\.\s*system\s*\(/, "os.system call"],
    [/subprocess\s*\./, "subprocess call"],
    [/powershell\s+-/i, "powershell invocation"],
    [/ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i, "instruction override"],
    [/disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|rules)/i, "instruction disregard"],
    [/you\s+are\s+now\s+/i, "identity override"],
    [/system\s*:\s*/i, "fake system prompt"],
    [/jailbreak/i, "jailbreak attempt"],
    [/\bDAN\s+mode\b/, "DAN jailbreak mode"],
    [/reveal\s+(your\s+)?(system\s+)?prompt/i, "prompt extraction"],
    [/bypass\s+(the\s+)?(filter|safety|gate|policy)/i, "safeguard bypass"],
    [/developer\s+mode\s+enabled/i, "fake developer mode"]
  ];
  function scan(text, patterns, gate){
    var out = [];
    for(var i = 0; i < patterns.length; i++){
      if(patterns[i][0].test(text || "")) out.push(gate + ": " + patterns[i][1]);
    }
    return out;
  }

  function sha256Hex(text){
    if(!(typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest)){
      return Promise.reject(new Error("crypto unavailable (fail-closed)"));
    }
    var bytes = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", bytes).then(function(buf){
      var hex = "";
      var view = new Uint8Array(buf);
      for(var i = 0; i < view.length; i++) hex += ("0" + view[i].toString(16)).slice(-2);
      return hex;
    });
  }

  /* Serialize every chain operation: appends must never interleave. */
  var queue = Promise.resolve();
  function enqueue(fn){
    var run = queue.then(fn, fn);
    queue = run.then(function(){}, function(){});
    return run;
  }

  function readChain(){
    try{
      var raw = localStorage.getItem(WATCH_KEY);
      if(!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }
  function writeChain(entries){
    try{ localStorage.setItem(WATCH_KEY, JSON.stringify(entries)); }catch(e){}
  }
  function entryDigest(entry){
    return sha256Hex(entry.prev + "|" + entry.seq + "|" + entry.sha256);
  }

  /* Recompute the whole watcher chain. Any post-hoc edit breaks a link. */
  function verifyChain(){
    return enqueue(function(){
      var entries = readChain();
      return sha256Hex(GENESIS).then(function(prev){
        var problems = [];
        var chain = Promise.resolve(prev);
        entries.forEach(function(e, i){
          chain = chain.then(function(expectedPrev){
            if(!e || typeof e !== "object" || e.seq !== i || typeof e.sha256 !== "string"){
              problems.push("watcher entry " + i + ": malformed");
              return expectedPrev;
            }
            if(e.prev !== expectedPrev){
              problems.push("watcher entry " + i + ": chain link broken");
            }
            return entryDigest(e);
          });
        });
        return chain.then(function(){
          return { ok: problems.length === 0, problems: problems, entries: entries };
        });
      });
    });
  }

  /* The passive watcher: record the session exactly as it was saved. */
  function noteSession(session){
    return enqueue(function(){
      var entries = readChain();
      var body = session ? JSON.stringify(session) : "null";
      return sha256Hex(body).then(function(bodyHash){
        var last = entries[entries.length - 1];
        if(last && last.sha256 === bodyHash) return entries;   /* no change */
        var base = last ? entryDigest(last) : sha256Hex(GENESIS);
        return Promise.resolve(base).then(function(prev){
          entries.push({ seq: entries.length, sha256: bodyHash, prev: prev });
          writeChain(entries);
          return entries;
        });
      });
    });
  }

  function logVerdict(kind, verdict){
    var entry = { ts: Date.now(), kind: kind, decision: verdict.decision,
                  reasons: verdict.reasons, remote: verdict.remote };
    try{
      var raw = localStorage.getItem(LOG_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if(!Array.isArray(arr)) arr = [];
      arr.push(entry);
      if(arr.length > 100) arr = arr.slice(arr.length - 100);
      localStorage.setItem(LOG_KEY, JSON.stringify(arr));
    }catch(e){}
    if(typeof window !== "undefined"){
      window.HalexZcureLog = window.HalexZcureLog || [];
      window.HalexZcureLog.push(entry);
    }
    return entry;
  }

  function inspect(session){
    var fields = ["name", "via", "chainLabel", "address", "kind"];
    var ux = [], sh = [];
    fields.forEach(function(f){
      var v = session && session[f] != null ? String(session[f]) : "";
      ux = ux.concat(scan(v, UXSS_PATTERNS, "UXSS"));
      sh = sh.concat(scan(v, SHELL_PATTERNS, "SHELL"));
    });
    return { uxss_failures: ux, shell_failures: sh };
  }

  function verdict(allow, reasons, checks){
    return { allow: allow, decision: allow ? "ALLOW" : "DENY",
             reasons: reasons, checks: checks,
             remote: ZCURE_ENDPOINT ? "WIRED" : "NOT_WIRED",
             watermark: WATERMARK, ts: Date.now() };
  }

  /* The handshake for a NEW connection: the existing watcher chain must
     recompute (a tampered history refuses new connections), and the
     descriptors must pass inspection. On ALLOW the caller saves the
     session, and hwSave's noteSession call starts/continues the record. */
  function handshake(session){
    if(!session || !session.address || !session.kind){
      var v0 = verdict(false, ["malformed connection: no session to verify"],
                       { integrity: "malformed", uxss_failures: [], shell_failures: [] });
      logVerdict("handshake", v0);
      return Promise.resolve(v0);
    }
    return verifyChain().then(function(chain){
      var reasons = [];
      var insp = inspect(session);
      var integrity;
      if(!chain.ok){
        integrity = "failed";
        reasons = reasons.concat(chain.problems.map(function(p){ return "integrity: " + p; }));
      } else {
        integrity = chain.entries.length ? "ok" : "chain-started";
      }
      if(insp.uxss_failures.length || insp.shell_failures.length){
        reasons = reasons.concat(
          insp.uxss_failures.concat(insp.shell_failures).map(function(f){
            return "inspection: " + f;
          }));
      }
      var v = verdict(reasons.length === 0, reasons,
        { integrity: integrity, uxss_failures: insp.uxss_failures,
          shell_failures: insp.shell_failures });
      logVerdict("handshake", v);
      return v;
    }).catch(function(e){
      var v = verdict(false, ["ZCURE check failed: " + ((e && e.message) || String(e))],
                      { integrity: "error", uxss_failures: [], shell_failures: [] });
      logVerdict("handshake", v);
      return v;
    });
  }

  /* The restore check: a session found in storage is presented as
     connected only if it is exactly the session the watcher last
     recorded, on an intact chain. No record = fail closed. */
  function checkRestored(session){
    if(!session || !session.address){
      var v0 = verdict(false, ["no saved session"], { integrity: "missing" });
      logVerdict("restore", v0);
      return Promise.resolve(v0);
    }
    return verifyChain().then(function(chain){
      var reasons = [];
      if(!chain.ok) reasons = reasons.concat(chain.problems);
      if(chain.ok && !chain.entries.length){
        reasons.push("no watcher record for the saved session");
      }
      var body = JSON.stringify(session);
      return sha256Hex(body).then(function(bodyHash){
        if(chain.ok && chain.entries.length){
          var head = chain.entries[chain.entries.length - 1];
          if(head.sha256 !== bodyHash){
            reasons.push("saved session does not match the watcher record (modified after recording)");
          }
        }
        var insp = inspect(session);
        reasons = reasons.concat(insp.uxss_failures, insp.shell_failures);
        var v = verdict(reasons.length === 0, reasons,
          { integrity: reasons.length ? "failed" : "ok",
            uxss_failures: insp.uxss_failures, shell_failures: insp.shell_failures });
        logVerdict("restore", v);
        return v;
      });
    }).catch(function(e){
      var v = verdict(false, ["ZCURE check failed: " + ((e && e.message) || String(e))],
                      { integrity: "error" });
      logVerdict("restore", v);
      return v;
    });
  }

  function heartbeat(){
    var entries = readChain();
    var log = [];
    try{ log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }catch(e){}
    return { alive: true, watermark: WATERMARK,
             watcher_entries: entries.length,
             checks_logged: Array.isArray(log) ? log.length : 0,
             remote: ZCURE_ENDPOINT ? "WIRED" : "NOT_WIRED" };
  }

  var api = { version: "1.0.0", watermark: WATERMARK,
              endpoint: ZCURE_ENDPOINT,
              remoteStatus: ZCURE_ENDPOINT ? "WIRED" : "NOT_WIRED",
              gate: handshake, handshake: handshake,
              checkRestored: checkRestored, noteSession: noteSession,
              verifyChain: verifyChain, heartbeat: heartbeat };
  var root = (typeof window !== "undefined") ? window :
             ((typeof globalThis !== "undefined") ? globalThis : this);
  root.HalexZcure = api;
})();
