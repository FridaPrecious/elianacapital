/* Eliana Capital v14: motion layer.
   1. Smooth scroll (a small Lenis-style glide on the mouse wheel; touch, keyboard and the scrollbar stay native)
   2. Scroll velocity as a CSS variable (the giant type band leans into the scroll)
   3. Hero scrub: headline lifts away and the callouts fade as you scroll off the hero
   4. A soft cursor ring that grows over links and says "View" over photos
   Plain JavaScript. All of it is off for visitors who ask for reduced motion. */
(function () {
  "use strict";
  var root = document.documentElement, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. smooth scroll ---------- */
  var cur = window.pageYOffset, target = cur, anim = false, last = 0, vel = 0, speed = 8;
  function maxY() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function canSmooth() { return !reduce && !document.body.classList.contains("menu-open"); }
  function scrollable(el) {
    while (el && el !== document.body && el !== root) {
      var s = getComputedStyle(el), oy = s.overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) return true;
      el = el.parentElement;
    }
    return false;
  }
  function loop(now) {
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    var prev = cur;
    cur += (target - cur) * (1 - Math.exp(-dt * speed));
    if (Math.abs(target - cur) < .4) { cur = target; anim = false; }
    window.scrollTo(0, cur);
    vel = (cur - prev) / Math.max(dt, .001) / 60;
    root.style.setProperty("--vel", clamp(vel, -60, 60).toFixed(2));
    if (anim) requestAnimationFrame(loop); else { root.style.setProperty("--vel", "0"); }
  }
  function go(y, sp) { target = clamp(y, 0, maxY()); speed = sp || 8; if (!anim) { anim = true; cur = window.pageYOffset; last = performance.now(); requestAnimationFrame(loop); } }
  if (!reduce) {
    root.classList.add("smooth");
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented || !canSmooth() || scrollable(e.target)) return;
      e.preventDefault();
      var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!anim) target = window.pageYOffset;
      go(target + d * 1.05, 7.5);
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!anim) { cur = target = window.pageYOffset; } }, { passive: true });
    /* in-page links glide */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2 || e.defaultPrevented) return;
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      go(el.getBoundingClientRect().top + window.pageYOffset - 84, 5);
    });
  }

  /* ---------- 3. hero scrub ---------- */
  var hero = document.querySelector(".hero--v10");
  function scrub() {
    var s = window.pageYOffset, h = window.innerHeight;
    root.style.setProperty("--hs", clamp(s / (h * .75), 0, 1).toFixed(3));
  }
  if (hero && !reduce) { window.addEventListener("scroll", scrub, { passive: true }); scrub(); }

  /* ---------- 4. cursor ring ---------- */
  if (fine && !reduce) {
    var ring = document.createElement("div"), lab = document.createElement("span");
    ring.className = "cur"; ring.setAttribute("aria-hidden", "true"); ring.appendChild(lab);
    document.body.appendChild(ring);
    var x = -100, y = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; ring.classList.add("on"); }
      var t = e.target.closest ? e.target.closest("a,button,.btn,[data-cursor],.arch,.pic,.story,.svc,.card,input,textarea,summary") : null;
      var state = "", text = "";
      if (t) {
        if (t.matches(".arch,.pic,.story,[data-cursor=view]") || t.querySelector && t.matches("figure")) { state = "view"; text = "View"; }
        else state = "link";
      }
      ring.className = "cur on" + (state ? " is-" + state : "");
      lab.textContent = text;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { ring.classList.remove("on"); });
    (function tick() { rx += (x - rx) * .2; ry += (y - ry) * .2; ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)"; requestAnimationFrame(tick); })();
  }
})();
