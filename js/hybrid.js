/* Hybrid home page: the text motion for the borrowed "Who we are" and "Ready when you are" sections
   (headline word reveal, paragraph that lights up as you read, count-up numbers). Plain JavaScript. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function inView(els, fn, opt) {
    if (!("IntersectionObserver" in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }); }, opt || { threshold: .25 });
    els.forEach(function (el) { io.observe(el); });
  }
  $$("[data-split]").forEach(function (h) {
    var n = 0;
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = h.innerHTML.trim().replace(/(<\/em>)([.,;:!?]+)/g, "$2$1").split(/(<[^>]+>)/).map(function (t) {
      if (t.charAt(0) === "<") return t;
      return t.replace(/(\S+)/g, function (w) { return '<span class="w" aria-hidden="true"><span style="--i:' + (n++) + '">' + w + "</span></span>"; });
    }).join("");
  });
  if (reduce) $$("[data-split]").forEach(function (h) { h.classList.add("in"); });
  else inView($$("[data-split]"), function (h) { h.classList.add("in"); }, { threshold: .35 });

  var scrub = $$("[data-scrub]").map(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="sw">' + w + "</span>"; }).join(" ");
    return { el: p, w: $$(".sw", p) };
  });
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  $$("[data-count]").forEach(function (el) { el.setAttribute("data-final", el.textContent); });
  inView($$("[data-count]"), function (el) {
    var to = parseFloat(el.getAttribute("data-count")), t0 = performance.now(), d = 1400;
    if (reduce) return;
    (function step(now) { var k = clamp((now - t0) / d, 0, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute("data-final"); })(t0);
  }, { threshold: .6 });

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      scrub.forEach(function (o) {
        var r = o.el.getBoundingClientRect(), p = clamp((vh * .88 - r.top) / (r.height + vh * .3), 0, 1), n = o.w.length;
        for (var i = 0; i < n; i++) o.w[i].style.setProperty("--o", (.16 + .84 * clamp(p * (n + 6) - i, 0, 1)).toFixed(2));
      });
    });
  }
  if (!reduce) { window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); }
  onScroll();
})();
