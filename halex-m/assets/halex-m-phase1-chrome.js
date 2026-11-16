/* ---------------- HALEX-M phase-1 chrome (sandbox copy) ----------------
   The live HALEX-M index references this file, but it was never pushed
   to the live repo (it answers 404 on the live site too), so this
   sandbox copy carries a local implementation of the phase-1 chrome
   layer: pure presentation polish for the app shell. It reads no data,
   fetches nothing, and changes no app state — it only:
   1. adds a scrolled shadow to the sticky top strip once the page
      moves, so the strip reads as a raised bar over the content;
   2. makes sure outbound links that open a new tab carry
      rel="noopener" alongside any existing rel values.
   Everything else in HALEX-M (tabs, workers, data) is driven by the
   page's own scripts; this layer never touches them. */
(function () {
  "use strict";
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  onReady(function () {
    var strip = document.querySelector(".topstrip");
    if (strip) {
      var apply = function () {
        if (window.scrollY > 4) strip.classList.add("hm-chrome-scrolled");
        else strip.classList.remove("hm-chrome-scrolled");
      };
      window.addEventListener("scroll", apply, { passive: true });
      apply();
    }
    var links = document.querySelectorAll('a[target="_blank"]');
    for (var i = 0; i < links.length; i++) {
      var rel = (links[i].getAttribute("rel") || "").split(/\s+/).filter(Boolean);
      if (rel.indexOf("noopener") === -1) rel.push("noopener");
      if (rel.indexOf("noreferrer") === -1) rel.push("noreferrer");
      links[i].setAttribute("rel", rel.join(" "));
    }
    window.HalexPhase1Chrome = { loaded: true, layer: "phase1-chrome", scope: "presentation only" };
  });
})();
