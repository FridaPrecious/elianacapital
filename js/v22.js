/* v22: count-up numbers, the scroll-linked "Who you are dealing with" ledger, and the plate tilt.
   Plain JavaScript, no dependencies. Works with Lenis because it only reads the page's scroll position. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. count-up numbers: <span class="num" data-num="30">30</span> ---------- */
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  var nums = $$(".num[data-num]");
  nums.forEach(function (el) {
    var to = parseFloat(el.getAttribute("data-num"));
    el.setAttribute("data-final", fmt(to));
    el.textContent = fmt(to);                 /* final value in the HTML, so it is right with no JavaScript */
  });
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-num")), d = 1700, t0 = performance.now();
    setTimeout(function () { el.textContent = fmt(to); }, d + 150);      /* always land on the exact figure, even if frames were dropped */
    (function step(now) {
      var k = clamp((now - t0) / d, 0, 1), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);   /* ease-out expo */
      if (k < 1) { el.textContent = fmt(to * e); requestAnimationFrame(step); }
    })(t0);
  }
  if (!reduce && "IntersectionObserver" in window) {
    nums.forEach(function (el) { el.textContent = "0"; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: .6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. the ledger: rows rise in, the row nearest the middle of the screen takes focus ---------- */
  var list = document.querySelector("[data-ledger]");
  if (list) {
    var rows = $$(".trow", list), pinned = null, ticking = false;
    if ("IntersectionObserver" in window && !reduce) {
      var rio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); } });
      }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
      rows.forEach(function (r) { rio.observe(r); });
    } else rows.forEach(function (r) { r.classList.add("is-in"); });

    var setActive = function (row) {
      rows.forEach(function (r) { r.classList.toggle("is-active", r === row); });
    };
    var update = function () {
      ticking = false;
      var vh = window.innerHeight, mid = vh * .5, lr = list.getBoundingClientRect();
      list.style.setProperty("--p", clamp((mid - lr.top) / lr.height, 0, 1).toFixed(3));
      if (pinned) return;                                   /* a hovered or focused row wins over scroll */
      var best = null, bd = Infinity;
      rows.forEach(function (r) {
        var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bd) { bd = d; best = r; }
      });
      if (lr.bottom < 0 || lr.top > vh) best = null;       /* list off screen: nothing is in focus */
      setActive(best);
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    rows.forEach(function (r) {
      r.addEventListener("mouseenter", function () { pinned = r; setActive(r); });
      r.addEventListener("mouseleave", function () { pinned = null; req(); });
      r.addEventListener("focusin", function () { pinned = r; setActive(r); });
      r.addEventListener("focusout", function () { pinned = null; req(); });
    });
    update();
  }

  /* ---------- 3. the company plate: a quiet pointer tilt with a moving highlight ---------- */
  var plate = document.querySelector("[data-plate]");
  if (plate && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var raf = 0, px = 0, py = 0;
    var paint = function () {
      raf = 0;
      plate.style.setProperty("--rx", (-py * 5).toFixed(2) + "deg");
      plate.style.setProperty("--ry", (px * 6).toFixed(2) + "deg");
      plate.style.setProperty("--gx", ((px + .5) * 100).toFixed(1) + "%");
      plate.style.setProperty("--gy", ((py + .5) * 100).toFixed(1) + "%");
    };
    plate.addEventListener("pointermove", function (e) {
      var r = plate.getBoundingClientRect();
      px = clamp((e.clientX - r.left) / r.width - .5, -.5, .5);
      py = clamp((e.clientY - r.top) / r.height - .5, -.5, .5);
      plate.classList.add("is-tilting");
      if (!raf) raf = requestAnimationFrame(paint);
    });
    plate.addEventListener("pointerleave", function () {
      px = 0; py = -.5; plate.classList.remove("is-tilting");
      plate.style.setProperty("--rx", "0deg"); plate.style.setProperty("--ry", "0deg");
      plate.style.setProperty("--gx", "50%"); plate.style.setProperty("--gy", "0%");
    });
  }
})();
