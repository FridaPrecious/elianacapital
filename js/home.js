/* Eliana Capital v15: home page motion.
   Patterns borrowed from reactbits (SplitText, ScrollReveal, CountUp, Magnet, TiltedCard) and motion.dev (inView, scroll-linked
   values, springs), plus a Lenis-style smooth scroll. Plain JavaScript, no libraries.
   Reduced motion: text is simply shown, nothing glides, tilts or follows the cursor. */
(function () {
  "use strict";
  var root = document.documentElement, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function inView(els, fn, opt) {
    if (!("IntersectionObserver" in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }); }, opt || { threshold: .25 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- headline reveal: words rise out of a mask ---------- */
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

  /* ---------- paragraph that lights up as you read ---------- */
  var scrub = $$("[data-scrub]").map(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="sw">' + w + "</span>"; }).join(" ");
    return { el: p, w: $$(".sw", p) };
  });

  /* ---------- count-up numbers ---------- */
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  $$("[data-count]").forEach(function (el) { el.setAttribute("data-final", el.textContent); });
  inView($$("[data-count]"), function (el) {
    var to = parseFloat(el.getAttribute("data-count")), t0 = performance.now(), d = 1400;
    if (reduce) return;
    (function step(now) { var k = clamp((now - t0) / d, 0, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute("data-final"); })(t0);
  }, { threshold: .6 });

  /* ---------- callouts around the phone: appear when the stage is in view ---------- */
  inView($$(".h-stage"), function (s) { s.classList.add("in"); }, { threshold: .25 });
  if (reduce) $$(".h-stage").forEach(function (s) { s.classList.add("in"); });

  /* ---------- scroll-linked values ---------- */
  var steps = $$(".h-steps-list")[0], stepItems = steps ? $$("li", steps) : [], feat = $$(".h-feature")[0];
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight, sy = window.pageYOffset;
      root.style.setProperty("--hs", clamp(sy / (vh * .9), 0, 1).toFixed(3));
      scrub.forEach(function (o) {
        var r = o.el.getBoundingClientRect(), p = clamp((vh * .88 - r.top) / (r.height + vh * .3), 0, 1), n = o.w.length;
        for (var i = 0; i < n; i++) o.w[i].style.setProperty("--o", (.16 + .84 * clamp(p * (n + 6) - i, 0, 1)).toFixed(2));
      });
      if (feat) { var fr = feat.getBoundingClientRect(); feat.style.setProperty("--fy", ((fr.top + fr.height / 2 - vh / 2) * -.12).toFixed(1)); }
      if (steps) {
        var sr = steps.getBoundingClientRect(), p2 = clamp((vh * .78 - sr.top) / (sr.height + vh * .1), 0, 1);
        steps.style.setProperty("--p", p2.toFixed(3));
        stepItems.forEach(function (li, i) { li.classList.toggle("on", p2 > (i + .4) / stepItems.length * .95); });
      }
    });
  }
  if (!reduce) { window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); }
  onScroll();

  /* ---------- tilted story cards (spotlight follows the pointer) ---------- */
  if (fine && !reduce) {
    $$(".h-story").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--ry", ((x - .5) * 9).toFixed(2) + "deg"); c.style.setProperty("--rx", ((.5 - y) * 9).toFixed(2) + "deg");
        c.style.setProperty("--mx", (x * 100).toFixed(0) + "%"); c.style.setProperty("--my", (y * 100).toFixed(0) + "%");
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    /* magnetic buttons */
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + "px"; });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
  }

  /* ---------- smooth scroll (mouse wheel only; touch and keyboard stay native) ---------- */
  var cur = window.pageYOffset, target = cur, anim = false, last = 0, speed = 8;
  function maxY() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function scrollable(el) {
    while (el && el !== document.body && el !== root) { var oy = getComputedStyle(el).overflowY; if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) return true; el = el.parentElement; }
    return false;
  }
  function loop(now) {
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    cur += (target - cur) * (1 - Math.exp(-dt * speed));
    if (Math.abs(target - cur) < .4) { cur = target; anim = false; }
    window.scrollTo(0, cur);
    if (anim) requestAnimationFrame(loop);
  }
  function go(y, sp) { target = clamp(y, 0, maxY()); speed = sp || 8; if (!anim) { anim = true; cur = window.pageYOffset; last = performance.now(); requestAnimationFrame(loop); } }
  if (!reduce) {
    root.classList.add("smooth");
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented || document.body.classList.contains("menu-open") || scrollable(e.target)) return;
      e.preventDefault();
      var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!anim) target = window.pageYOffset;
      go(target + d * 1.05, 7.5);
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!anim) cur = target = window.pageYOffset; }, { passive: true });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2 || e.defaultPrevented) return;
      var el = document.getElementById(a.getAttribute("href").slice(1)); if (!el) return;
      e.preventDefault(); go(el.getBoundingClientRect().top + window.pageYOffset - 84, 5);
    });
  }

  /* ---------- cursor ring ---------- */
  if (fine && !reduce) {
    var ring = document.createElement("div"), lab = document.createElement("span"); ring.className = "cur"; ring.setAttribute("aria-hidden", "true"); ring.appendChild(lab); document.body.appendChild(ring);
    var x = -100, y = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY; if (!shown) { shown = true; rx = x; ry = y; }
      var t = e.target.closest ? e.target.closest("a,button,.btn,[data-cursor],input,textarea,summary") : null, st = "", tx = "";
      if (t) { if (t.matches("[data-cursor=view]")) { st = "view"; tx = "View"; } else st = "link"; }
      ring.className = "cur on" + (st ? " is-" + st : ""); lab.textContent = tx;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { ring.classList.remove("on"); });
    (function tick() { rx += (x - rx) * .2; ry += (y - ry) * .2; ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)"; requestAnimationFrame(tick); })();
  }
})();
