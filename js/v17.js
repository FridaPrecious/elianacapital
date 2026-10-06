/* Eliana Capital v17: finishing layer (home page).
   - A thin scroll-progress line along the top.
   - Hero depth: sky and logo drift in opposite directions with the pointer (eased, mouse only).
   - Staged entrance: adds .v17-in to the page once the hero has settled so the tagline and cue arrive after the sun.
   Reduced motion: no drift, no staging. */
(function () {
  "use strict";
  var root = document.documentElement, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var bar = document.createElement("div"); bar.className = "v17-bar"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  var hero = document.querySelector(".h-hero"), tx = 0, ty = 0, cx = 0, cy = 0, tick = false;
  function prog() { var m = Math.max(1, root.scrollHeight - window.innerHeight); bar.style.setProperty("--p", clamp(window.pageYOffset / m, 0, 1).toFixed(4)); }
  window.addEventListener("scroll", prog, { passive: true }); window.addEventListener("resize", prog); prog();
  if (hero && fine && !reduce) {
    window.addEventListener("pointermove", function (e) { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      if (Math.abs(tx - cx) + Math.abs(ty - cy) < .0005) return;
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      hero.style.setProperty("--px", cx.toFixed(4)); hero.style.setProperty("--py", cy.toFixed(4));
    })();
  }
  if (reduce) root.classList.add("v17-in"); else window.addEventListener("load", function () { requestAnimationFrame(function () { root.classList.add("v17-in"); }); });
})();
