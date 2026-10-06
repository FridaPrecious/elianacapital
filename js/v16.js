/* Eliana Capital v16: the sunrise and the editorial type motion (home page only).
   - Drives --sr (0 to 1) on .h-hero: the sun climbs out of the skyline, blue hour warms to gold, logo turns from white to colour.
   - Light dust drifting through the sunlight (canvas, pauses when the hero is off screen).
   - Clock in the hero follows the sun. Index-label hairlines draw in. A small section chip tracks where you are.
   Reduced motion: the scene is simply shown in its final, sunlit state. */
(function () {
  "use strict";
  var root = document.documentElement, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hero = document.querySelector(".h-hero");

  /* ---------- the sunrise ---------- */
  var clock = document.querySelector("[data-clock]");
  function setClock(e) {
    if (!clock) return;
    var m = Math.round(331 + e * 54), h = Math.floor(m / 60), mm = m % 60;
    clock.textContent = (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }
  if (hero) {
    var fixed = /[?&]sr=([\d.]+)/.exec(location.search);   /* preview a stage: index.html?sr=0.2 */
    if (fixed) { hero.style.setProperty("--sr", fixed[1]); setClock(parseFloat(fixed[1])); }
    else if (reduce) { hero.style.setProperty("--sr", "1"); setClock(1); }
    else {
      var D = 6800, T0 = performance.now() + 300;
      (function rise(now) {
        var k = clamp((now - T0) / D, 0, 1), e = 1 - Math.pow(1 - k, 2.2);
        hero.style.setProperty("--sr", e.toFixed(4)); setClock(e);
        if (k < 1) requestAnimationFrame(rise);
      })(performance.now());
    }
  }

  /* ---------- dust in the light ---------- */
  var cv = document.querySelector(".sk-dust");
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), P = [], on = true, N = 54;
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; }
    function spawn(i, anywhere) {
      return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10, r: .5 + Math.random() * 1.7, v: .08 + Math.random() * .3, dx: (Math.random() - .5) * .18, ph: Math.random() * 6.28, a: .25 + Math.random() * .6 };
    }
    size(); for (var i = 0; i < N; i++) P.push(spawn(i, true));
    window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(hero);
    (function draw(now) {
      requestAnimationFrame(draw);
      if (!on) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) {
        var p = P[i]; p.y -= p.v; p.x += p.dx + Math.sin(now / 1800 + p.ph) * .12;
        if (p.y < -10) P[i] = p = spawn(i, false);
        var tw = .55 + .45 * Math.sin(now / 700 + p.ph), g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(255,236,176," + (p.a * tw).toFixed(2) + ")"); g.addColorStop(1, "rgba(255,200,110,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
      }
    })(performance.now());
  }

  /* ---------- index labels: the hairline draws in ---------- */
  var labels = $$(".label");
  if (!("IntersectionObserver" in window) || reduce) labels.forEach(function (l) { l.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .6 });
    labels.forEach(function (l) { io.observe(l); });
  }

  /* ---------- section chip and the sun under the call to action ---------- */
  var secs = $$("[data-rail]").filter(function (s) { return s.id !== "top"; });
  var chip = document.createElement("div"); chip.className = "v-prog"; chip.setAttribute("aria-hidden", "true");
  chip.innerHTML = '<span class="n"></span><i></i><b></b>'; document.body.appendChild(chip);
  var cn = chip.querySelector(".n"), cb = chip.querySelector("b"), cta = document.querySelector(".h-cta"), last = -1, tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight, sy = window.pageYOffset, cur = -1, i, r;
    for (i = 0; i < secs.length; i++) { r = secs[i].getBoundingClientRect(); if (r.top < vh * .5 && r.bottom > vh * .5) { cur = i; break; } }
    if (cur !== last) {
      last = cur; chip.classList.toggle("on", cur > -1 && sy > vh * .6);
      if (cur > -1) { cn.textContent = (cur + 1 < 10 ? "0" : "") + (cur + 1) + "/" + (secs.length < 10 ? "0" : "") + secs.length; cb.textContent = secs[cur].getAttribute("data-rail"); }
    }
    if (cur > -1) { r = secs[cur].getBoundingClientRect(); chip.style.setProperty("--pp", clamp((vh * .5 - r.top) / r.height, 0, 1).toFixed(3)); }
    chip.classList.toggle("on", cur > -1 && sy > vh * .6);
    if (cta) { r = cta.getBoundingClientRect(); cta.style.setProperty("--cs", clamp((vh - r.top) / (vh * .9), 0, 1).toFixed(3)); }
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); frame();
})();
