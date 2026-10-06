/* Eliana Capital v18 (home page).
   1. Story panels: the one you point at (or tab to) opens; when nobody is pointing, they open one by one. Phones swipe instead.
   2. "How we work": each card scales back and dims as the next slides over it; photos clear a curtain and drift as you scroll.
   Reduced motion: panels still open on hover, no auto-play, no scaling, everything visible. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var vp = document.querySelector(".v-prog"); if (vp && vp.parentNode) vp.parentNode.removeChild(vp);

  /* ---------- 1. story panels ---------- */
  var list = document.querySelector(".hs"), items = list ? $$(".hs-item", list) : [];
  if (list && items.length) {
    var cur = 0, timer = null, inView = false, hover = false, wide = function () { return window.innerWidth > 860; };
    function show(i) {
      if (i === cur && items[i].classList.contains("on")) return;
      items.forEach(function (it, k) {
        var on = k === i;
        if (on && !it.classList.contains("on")) { var b = it.querySelector(".hs-bar"); if (b) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } }
        it.classList.toggle("on", on);
      });
      cur = i;
    }
    function play() {
      stop(); if (reduce || !wide() || !inView || hover) return;
      var ms = parseFloat(getComputedStyle(list).getPropertyValue("--dwell")) * 1000 || 5200;
      timer = setTimeout(function () { show((cur + 1) % items.length); play(); }, ms);
    }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } }
    items.forEach(function (it, i) {
      it.addEventListener("pointerenter", function (e) { if (e.pointerType === "touch" || !wide()) return; hover = true; list.classList.add("paused"); show(i); stop(); });
      it.addEventListener("focusin", function () { if (!wide()) return; hover = true; list.classList.add("paused"); show(i); stop(); });
    });
    list.addEventListener("pointerleave", function () { hover = false; list.classList.remove("paused"); play(); });
    list.addEventListener("focusout", function () { hover = false; list.classList.remove("paused"); play(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          inView = e.isIntersecting;
          if (inView) { list.classList.add("in"); var b = items[cur].querySelector(".hs-bar"); if (b) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } play(); } else stop();
        });
      }, { threshold: .35 }).observe(list);
    } else { list.classList.add("in"); inView = true; play(); }
    window.addEventListener("resize", play);
  }

  /* ---------- 2. stacking promise cards ---------- */
  var cards = $$(".hp-card");
  if (cards.length) {
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .3 });
      cards.forEach(function (c) { io.observe(c); });
    } else cards.forEach(function (c) { c.classList.add("in"); });
    var imgs = cards.map(function (c) { return c.querySelector(".hp-fig img"); }), tick = false;
    function frame() {
      tick = false; var vh = window.innerHeight;
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        if (!reduce) {
          var p = 0, nx = cards[i + 1];
          if (nx) { var rn = nx.getBoundingClientRect(); p = clamp(1 - (rn.top - (r.top + 18)) / Math.max(1, r.height), 0, 1); }
          c.style.setProperty("--sc", (1 - .06 * p).toFixed(4));
          c.firstElementChild.style.setProperty("--dim", (.5 * p).toFixed(3));
          if (imgs[i]) imgs[i].style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * -.05).toFixed(1) + "px");
        }
      });
    }
    function req() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); frame();
  }
})();
