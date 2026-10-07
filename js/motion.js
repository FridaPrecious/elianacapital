/* Eliana Capital: motion engine.
   A small, dependency-free layer that borrows the ideas of Motion (motion.dev: spring physics, scroll-linked animation,
   in-view, stagger, press/hover gestures) and of React Bits / OriginKit (rolling text buttons, scroll-velocity marquee,
   scroll word reveal, text scramble) and the "footer reveal" pattern. Everything here is skipped when the visitor asks for reduced motion. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- engine: one shared frame loop and a spring, like Motion's spring() ---------- */
  var jobs = [], last = 0, running = false;
  function loop(now) {
    var dt = Math.min(.034, (now - last) / 1000); last = now;
    jobs = jobs.filter(function (f) { return f(dt, now) !== false; });
    if (jobs.length) requestAnimationFrame(loop); else running = false;
  }
  function run(fn) { jobs.push(fn); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
  function Spring(x, k, c) {
    return {
      x: x, v: 0, t: x, k: k, c: c,
      step: function (dt) { var n = Math.max(1, Math.ceil(dt / .008)), h = dt / n; for (var i = 0; i < n; i++) { this.v += (this.k * (this.t - this.x) - this.c * this.v) * h; this.x += this.v * h; } return this.x; },
      rest: function () { return Math.abs(this.v) < .02 && Math.abs(this.t - this.x) < .02; }
    };
  }

  /* ---------- scroll state shared by every scroll-linked effect ---------- */
  var sy = window.scrollY, vel = 0, dir = 1, subs = [];
  function onScroll() { var y = window.scrollY; var d = y - sy; sy = y; vel = vel * .6 + d * .4 * 60; if (Math.abs(d) > .5) dir = d > 0 ? 1 : -1; }
  window.addEventListener("scroll", onScroll, { passive: true });
  var velSmooth = 0;
  run(function (dt) { vel *= .9; velSmooth += (vel - velSmooth) * Math.min(1, dt * 8); subs.forEach(function (f) { f(dt); }); return true; });

  /* ---------- 1. Spring magnet on buttons, spring tilt on cards, spring press ---------- */
  function springy(el, mode) {
    el.classList.add("spr");
    var X = Spring(0, 260, 18), Y = Spring(0, 260, 18), RX = Spring(0, 160, 15), RY = Spring(0, 160, 15), S = Spring(1, 320, 20), L = Spring(0, 200, 17);
    var on = false, hot = false;
    function step(dt) {
      X.step(dt); Y.step(dt); RX.step(dt); RY.step(dt); S.step(dt); L.step(dt);
      el.style.transform = mode === "tilt"
        ? "perspective(900px) translateY(" + L.x.toFixed(2) + "px) rotateX(" + RX.x.toFixed(2) + "deg) rotateY(" + RY.x.toFixed(2) + "deg) scale(" + S.x.toFixed(3) + ")"
        : "translate(" + X.x.toFixed(2) + "px," + Y.x.toFixed(2) + "px) scale(" + S.x.toFixed(3) + ")";
      if (!hot && [X, Y, RX, RY, S, L].every(function (s) { return s.rest(); })) { el.style.transform = ""; on = false; return false; }
    }
    function wake() { if (!on) { on = true; run(step); } }
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hot = true; if (mode === "tilt") L.t = -4; wake(); } });
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var b = el.getBoundingClientRect(), nx = (e.clientX - b.left) / b.width - .5, ny = (e.clientY - b.top) / b.height - .5;
      if (mode === "tilt") { RY.t = nx * 9; RX.t = -ny * 7; } else { X.t = nx * b.width * .28; Y.t = ny * b.height * .38; }
      hot = true; wake();
    });
    el.addEventListener("pointerleave", function () { hot = false; X.t = Y.t = RX.t = RY.t = L.t = 0; S.t = 1; wake(); });
    el.addEventListener("pointerdown", function () { S.t = mode === "tilt" ? .985 : .93; wake(); });
    var rel = function () { if (S.t !== 1) { S.t = 1; wake(); } };
    window.addEventListener("pointerup", rel); window.addEventListener("pointercancel", rel);
  }
  $$(".btn, .menu-btn").forEach(function (b) { springy(b, "mag"); });   /* press squash works for touch too */
  if (fine) $$(".trust li, .person, .facts > div, .spec > div, .story-nav a").forEach(function (c) { springy(c, "tilt"); });   /* touch screens tilt on scroll instead (touch.js) */

  /* ---------- 2. Rolling text buttons (OriginKit / Motion UI): label rolls up on hover ---------- */
  $$(".btn").forEach(function (b) {
    if (b.children.length || !b.textContent.trim() || b.textContent.length > 40) return;
    var t = b.textContent.trim();
    b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  });

  /* ---------- 3. Scroll word reveal (Motion UI): words light up as you scroll through a paragraph ---------- */
  var wordEls = [];
  $$(".sec .lead, .cta p, .sec-head p").forEach(function (el) {
    if (el.children.length || el.closest(".phero, .hero, [data-lit], .prose, form")) return;
    var text = el.textContent.trim(), words = text.split(/\s+/);
    if (words.length < 8 || words.length > 50) return;
    el.classList.remove("rv", "in"); el.style.removeProperty("--d"); el.classList.add("wr");
    el.innerHTML = '<span class="sr">' + text + '</span><span aria-hidden="true">' + words.map(function (w) { return '<span class="wd">' + w + "</span>"; }).join(" ") + "</span>";
    wordEls.push({ el: el, w: $$(".wd", el), on: false });
  });
  if ("IntersectionObserver" in window) {
    var wio = new IntersectionObserver(function (en) { en.forEach(function (e) { var o = wordEls.filter(function (x) { return x.el === e.target; })[0]; if (o) o.on = e.isIntersecting; }); }, { rootMargin: "20% 0px" });
    wordEls.forEach(function (o) { wio.observe(o.el); });
  } else wordEls.forEach(function (o) { o.on = true; });
  var vh = window.innerHeight; window.addEventListener("resize", function () { vh = window.innerHeight; });
  function words() {
    wordEls.forEach(function (o) {
      if (!o.on) return;
      var r = o.el.getBoundingClientRect(), p = clamp((vh * .92 - r.top) / (vh * .42 + r.height * .5), 0, 1), n = o.w.length;
      o.w.forEach(function (w, i) { var a = clamp((p * (n + 5) - i) / 5, 0, 1); w.style.opacity = (.16 + .84 * a).toFixed(3); });
    });
  }
  subs.push(words); words();

  /* ---------- 4. Scroll-linked parallax (Motion scroll()): hero copy drifts and fades, footer word rises ---------- */
  var heroC = $(".phero > .container"), heroS = $(".phero"), fw = $(".foot-word");
  subs.push(function () {
    if (heroC && heroS) { var p = clamp(window.scrollY / (heroS.offsetHeight * .9), 0, 1); if (p < 1 || heroC.style.transform) { heroC.style.transform = "translate3d(0," + (p * 70).toFixed(1) + "px,0)"; heroC.style.opacity = (1 - p * 1.25).toFixed(3); } }
    if (fw) { var r = fw.getBoundingClientRect(), q = clamp(1 - (r.top - vh * .55) / (vh * .45), 0, 1); fw.style.transform = "translate3d(0," + ((1 - q) * 60).toFixed(1) + "px,0)"; }
  });

  /* ---------- 5. Scroll-velocity marquee (React Bits "ScrollVelocity"): speed and direction follow your scroll ---------- */
  var rows = [];
  $$(".vel-row").forEach(function (row) {
    var track = $(".vel-track", row), group = $(".vel-group", row); if (!track || !group) return;
    var o = { row: row, track: track, group: group, x: 0, w: 1, base: +row.getAttribute("data-dir") || -1, on: false, skew: 0 };
    function fill() {
      o.w = group.offsetWidth || 1; var need = Math.ceil((window.innerWidth * 2) / o.w) + 1;
      $$(".vel-clone", track).forEach(function (c) { c.remove(); });
      for (var i = 0; i < need; i++) { var c = group.cloneNode(true); c.className = "vel-group vel-clone"; c.setAttribute("aria-hidden", "true"); track.appendChild(c); }
    }
    fill(); window.addEventListener("resize", fill); rows.push(o);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { o.on = en[0].isIntersecting; }, { rootMargin: "10% 0px" }).observe(row); else o.on = true;
  });
  if (rows.length) subs.push(function (dt) {
    rows.forEach(function (o) {
      if (!o.on) return;
      var speed = 70 + Math.abs(velSmooth) * .55, d = o.base * dir;
      o.x += d * speed * dt; if (o.x <= -o.w) o.x += o.w; if (o.x >= 0) o.x -= o.w;
      o.skew += (clamp(-velSmooth * .012, -9, 9) * o.base - o.skew) * .12;
      o.track.style.transform = "translate3d(" + o.x.toFixed(1) + "px,0,0) skewX(" + o.skew.toFixed(2) + "deg)";
    });
  });

  /* ---------- 6. Text scramble on page labels (React Bits "DecryptedText") ---------- */
  var chars = "abcdefghijklmnopqrstuvwxyz";
  $$(".phero .label").forEach(function (el) {
    var txt = el.textContent, w = el.offsetWidth; el.setAttribute("aria-label", txt); el.style.minWidth = w + "px";
    setTimeout(function () {
      var t0 = performance.now(), dur = 750;
      run(function () {
        var k = clamp((performance.now() - t0) / dur, 0, 1), n = Math.floor(k * txt.length);
        el.textContent = txt.split("").map(function (ch, i) { return i < n || ch === " " ? ch : chars[Math.floor(Math.random() * chars.length)]; }).join("");
        if (k >= 1) { el.textContent = txt; el.style.minWidth = ""; return false; }
      });
    }, 1100);
  });

  /* ---------- 7. Footer: normal scroll (the sticky reveal was removed) ---------- */
  var foot = $(".foot");
  function footMode() { /* the sticky footer reveal was removed: it pinned the footer under the page before you reached it */ document.documentElement.classList.remove("foot-reveal"); }
  footMode(); window.addEventListener("resize", footMode); window.addEventListener("load", footMode);
})();
