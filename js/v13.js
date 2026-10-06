/* Eliana Capital v13: editorial finish.
   1. golden-hour pollen + sun glow in the home hero
   2. botanical line art that draws itself in and drifts with scroll
   3. giant scroll-linked type band with a kitenge-inspired pattern strip
   Plain JavaScript, no libraries. Everything is skipped for visitors who ask for reduced motion (art still shows, still). */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* small seeded random so every sprig is the same on each visit */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- botanical drawings (viewBox 0 0 200 400) ---------- */
  function bez(t, p) { var u = 1 - t; return [
    u*u*u*p[0] + 3*u*u*t*p[2] + 3*u*t*t*p[4] + t*t*t*p[6],
    u*u*u*p[1] + 3*u*u*t*p[3] + 3*u*t*t*p[5] + t*t*t*p[7]]; }
  function bezAng(t, p) { var a = bez(Math.max(0, t - .01), p), b = bez(Math.min(1, t + .01), p); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; }
  function leaf(len, wid) { // pointed leaf with a midrib, drawn along +x
    return '<path class="fl dr" pathLength="1" d="M0 0 C ' + f(len*.25) + ' ' + f(-wid) + ', ' + f(len*.75) + ' ' + f(-wid*.9) + ', ' + f(len) + ' 0 C ' + f(len*.75) + ' ' + f(wid*.9) + ', ' + f(len*.25) + ' ' + f(wid) + ', 0 0Z"/>' +
           '<path class="dr" pathLength="1" d="M0 0 L ' + f(len*.88) + ' 0" opacity=".7"/>'; }

  function fern(r) {
    var p = [100, 392, 70 + r()*30, 280, 130 - r()*30, 160, 100 + (r()-.5)*30, 24], out = '<path class="dr" pathLength="1" d="M' + p[0] + ' ' + p[1] + ' C ' + p.slice(2).join(' ') + '"/>';
    var n = 15;
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1), c = bez(t, p), a = bezAng(t, p), s = 1 - t * .55, side = i % 2 ? 1 : -1;
      out += '<g transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') rotate(' + f(a + side * (58 - t * 12)) + ') scale(' + f(s) + ')">' + leaf(62 + r()*14, 11 + r()*4) + '</g>';
    }
    return out;
  }
  function acacia(r) { // thin stem, rows of tiny paired leaflets, like acacia and tamarind
    var p = [96, 394, 120, 300, 70, 190, 110, 30], out = '<path class="dr" pathLength="1" d="M' + p[0] + ' ' + p[1] + ' C ' + p.slice(2).join(' ') + '"/>';
    for (var i = 1; i <= 9; i++) {
      var t = i / 11, c = bez(t, p), a = bezAng(t, p), side = i % 2 ? 1 : -1, L = 64 * (1 - t * .5), rach = a + side * 64;
      out += '<g transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') rotate(' + f(rach) + ')"><path class="dr" pathLength="1" d="M0 0 L ' + f(L) + ' 0"/>';
      for (var k = 1; k <= 7; k++) { var x = L * k / 7.4, h = 9 * (1 - k / 11); out += '<path class="fl dr" pathLength="1" d="M' + f(x) + ' 0 q ' + f(h*.4) + ' ' + f(-h*1.6) + ' ' + f(h*1.3) + ' ' + f(-h*1.2) + ' q ' + f(-h*.2) + ' ' + f(h*1.2) + ' ' + f(-h*1.3) + ' ' + f(h*1.2) + '"/><path class="fl dr" pathLength="1" d="M' + f(x) + ' 0 q ' + f(h*.4) + ' ' + f(h*1.6) + ' ' + f(h*1.3) + ' ' + f(h*1.2) + ' q ' + f(-h*.2) + ' ' + f(-h*1.2) + ' ' + f(-h*1.3) + ' ' + f(-h*1.2) + '"/>'; }
      out += '</g>';
    }
    return out + '<circle class="dr" pathLength="1" cx="' + p[6] + '" cy="' + (p[7] - 6) + '" r="5"/>';
  }
  function aloe(r) { // rosette of thick pointed blades, with a flowering spike
    var out = '', n = 11;
    for (var i = 0; i < n; i++) {
      var a = -90 + (i - (n - 1) / 2) * 15 + (r() - .5) * 5, len = 150 + r() * 60 - Math.abs(i - (n - 1) / 2) * 7;
      out += '<g transform="translate(100 385) rotate(' + f(a) + ')"><path class="fl dr" pathLength="1" d="M0 0 C ' + f(len*.3) + ' -17, ' + f(len*.7) + ' -12, ' + f(len) + ' 0 C ' + f(len*.7) + ' 12, ' + f(len*.3) + ' 17, 0 0Z"/><path class="dr" pathLength="1" d="M' + f(len*.12) + ' 0 L ' + f(len*.9) + ' 0" opacity=".6"/></g>';
    }
    out += '<path class="dr" pathLength="1" d="M100 385 C 96 280, 108 200, 102 120"/>';
    for (var j = 0; j < 7; j++) { var y = 130 + j * 17, x = 102 + (j % 2 ? 7 : -7); out += '<path class="fl dr" pathLength="1" d="M' + x + ' ' + y + ' q ' + (j % 2 ? 9 : -9) + ' 10 0 22 q ' + (j % 2 ? -8 : 8) + ' -11 0 -22"/>'; }
    return out;
  }
  function grass(r) { // sugarcane / maize blades, long arcs
    var out = '';
    for (var i = 0; i < 6; i++) {
      var x0 = 70 + i * 12 + r()*6, bend = (i - 2.5) * 22 + (r() - .5) * 20, top = 40 + r() * 120;
      out += '<path class="dr" pathLength="1" d="M' + f(x0) + ' 396 C ' + f(x0 + bend*.2) + ' 300, ' + f(x0 + bend*.8) + ' ' + f(top + 120) + ', ' + f(x0 + bend*1.4) + ' ' + f(top) + '"/>';
      out += '<path class="dr" pathLength="1" d="M' + f(x0 + 4) + ' 396 C ' + f(x0 + bend*.2 + 5) + ' 300, ' + f(x0 + bend*.8 + 7) + ' ' + f(top + 124) + ', ' + f(x0 + bend*1.4) + ' ' + f(top) + '" opacity=".6"/>';
    }
    return out;
  }
  function bloom(r) { // layered round flower on a stem
    var out = '<path class="dr" pathLength="1" d="M100 396 C 90 330, 112 270, 100 190"/>', cx = 100, cy = 150;
    for (var ring = 3; ring >= 1; ring--) {
      var n = 5 + ring * 3, R = 28 + ring * 22;
      for (var i = 0; i < n; i++) { var a = i * 360 / n + ring * 11; out += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + f(a) + ')"><path class="fl dr" pathLength="1" d="M8 0 C ' + f(R*.4) + ' ' + f(-R*.34) + ', ' + f(R*.85) + ' ' + f(-R*.2) + ', ' + f(R) + ' 0 C ' + f(R*.85) + ' ' + f(R*.2) + ', ' + f(R*.4) + ' ' + f(R*.34) + ', 8 0Z"/></g>'; }
    }
    out += '<circle class="dr" pathLength="1" cx="' + cx + '" cy="' + cy + '" r="9"/>';
    out += '<g transform="translate(100 300) rotate(-35)">' + leaf(70, 14) + '</g><g transform="translate(103 260) rotate(215) scale(-1 1)">' + leaf(58, 12) + '</g>';
    return out;
  }
  var KINDS = { fern: fern, acacia: acacia, aloe: aloe, grass: grass, bloom: bloom };
  var seedN = 11;
  function makeBotan(kind, opts) {
    var el = document.createElement("div");
    el.className = "botan" + (opts.blue ? " is-blue" : "") + (opts.hideS ? " hide-s" : "");
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--bw", opts.w + "px");
    if (opts.rot != null) el.style.rotate = opts.rot + "deg";
    var pos = opts.pos || {};
    for (var k in pos) el.style[k] = pos[k];
    el.dataset.speed = opts.speed == null ? .08 : opts.speed;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 400"); svg.setAttribute("preserveAspectRatio", "xMidYMax meet");
    svg.innerHTML = KINDS[kind](rng(seedN += 7));
    if (opts.flip) svg.style.scale = "-1 1";
    el.appendChild(svg);
    return el;
  }

  /* where the plants go: [selector, kind, options] (home page; other pages use the first match only) */
  var PLAN = [
    ["#care",     "fern",   { w: 230, pos: { left: "-40px", top: "28px" }, rot: 8 }],
    ["#care",     "acacia", { w: 200, pos: { right: "-30px", bottom: "-10px" }, flip: true, blue: true, hideS: true }],
    ["#offer",    "bloom",  { w: 190, pos: { right: "-20px", top: "-60px" }, rot: -8, hideS: true }],
    ["#price",  "grass",  { w: 220, pos: { left: "-30px", bottom: "-20px" }, rot: 4 }],
    ["#branches", "aloe",   { w: 250, pos: { right: "-40px", bottom: "-6px" }, blue: true }],
    ["#faq",  "fern",   { w: 220, pos: { left: "-50px", top: "10px" }, flip: true, rot: -6 }],
    [".cta",      "bloom",  { w: 200, pos: { left: "-30px", bottom: "-10px" }, blue: false, hideS: true }]
  ];
  var plants = [];
  PLAN.forEach(function (row) {
    var host = document.querySelector(row[0]);
    if (!host) return;
    host.classList.add("has-botan");
    var b = makeBotan(row[1], row[2]);
    host.insertBefore(b, host.firstChild);
    plants.push({ el: b, host: host, speed: parseFloat(b.dataset.speed) });
  });
  function showAll() { plants.forEach(function (p) { p.el.classList.add("in"); }); }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .15 });
    plants.forEach(function (p) { io.observe(p.el); });
  } else showAll();

  /* ---------- scroll drift ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      plants.forEach(function (p) {
        var r = p.host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        p.el.style.setProperty("--py", f((r.top + r.height / 2 - vh / 2) * -p.speed) + "px");
      });
      if (band) { var br = band.getBoundingClientRect(); if (br.bottom > -50 && br.top < vh + 50) track.style.transform = "translate3d(" + f(-(br.top - vh) * .45 - off) + "px,0,0)"; }
    });
  }

  /* ---------- giant type band ---------- */
  function kenteURI() {
    // a kitenge-inspired tile: rings, diamonds and dots in brand blue, green and cream
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48" viewBox="0 0 120 48">' +
      '<rect width="120" height="48" fill="#010395"/>' +
      '<g fill="none" stroke-width="2">' +
      '<circle cx="24" cy="24" r="18" stroke="#fefef1" opacity=".9"/><circle cx="24" cy="24" r="12" stroke="#5fa052"/><circle cx="24" cy="24" r="6" fill="#a6dd99" stroke="none"/>' +
      '<path d="M60 4 L78 24 L60 44 L42 24Z" stroke="#a6dd99"/><path d="M60 14 L68 24 L60 34 L52 24Z" fill="#5fa052" stroke="none"/>' +
      '<circle cx="96" cy="24" r="18" stroke="#fefef1" opacity=".9"/><circle cx="96" cy="24" r="12" stroke="#5fa052"/><circle cx="96" cy="24" r="6" fill="#a6dd99" stroke="none"/>' +
      '</g><g fill="#fefef1"><circle cx="60" cy="4" r="2"/><circle cx="60" cy="44" r="2"/><circle cx="2" cy="24" r="2"/><circle cx="118" cy="24" r="2"/></g></svg>';
    return "url(\"data:image/svg+xml," + encodeURIComponent(s) + "\")";
  }
  var band = null, track = null, off = 0;
  var anchor = document.querySelector("#branches");
  if (anchor && document.body.contains(anchor)) {
    band = document.createElement("section");
    band.className = "giant"; band.setAttribute("aria-hidden", "true");
    var words = ["Market traders", "Tailors", "Salon owners", "Food vendors", "Shopkeepers", "Farmers"];
    var one = words.map(function (w) { return "<span>" + w + "</span><i></i>"; }).join("");
    band.innerHTML = '<div class="kente" style="background-image:' + kenteURI().replace(/"/g, "'") + '"></div><div class="giant-track">' + one + one + '</div><div class="kente" style="background-image:' + kenteURI().replace(/"/g, "'") + '"></div>';
    anchor.parentNode.insertBefore(band, anchor);
    track = band.querySelector(".giant-track");
    off = track.scrollWidth / 4;
    if (reduce) track.style.transform = "translate3d(" + f(-off) + "px,0,0)";
  }
  if (!reduce) { window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", function () { if (track) off = track.scrollWidth / 4; onScroll(); }); onScroll(); }

  /* ---------- hero: sun glow + pollen ---------- */
  var photo = document.querySelector(".hero-photo");
  if (photo) {
    var sun = document.createElement("div"); sun.className = "hero-sun"; sun.setAttribute("aria-hidden", "true");
    photo.appendChild(sun);
    if (!reduce) {
      var hero = photo.parentNode, cv = document.createElement("canvas");
      cv.className = "hero-dust"; cv.setAttribute("aria-hidden", "true");
      hero.insertBefore(cv, photo.nextSibling);
      var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), P = [], vis = true, last = 0;
      var rr = rng(99);
      function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      function seed(p, init) {
        p.x = rr() * W; p.y = init ? rr() * H : H + 10; p.r = .6 + rr() * 2.2; p.v = 6 + rr() * 16; p.dx = (rr() - .35) * 8;
        p.ph = rr() * 6.28; p.sp = .5 + rr() * 1.4; p.a = .25 + rr() * .6; return p;
      }
      function init() { size(); P = []; var n = Math.round(Math.min(90, W / 16)); for (var i = 0; i < n; i++) P.push(seed({}, true)); }
      function tick(t) {
        requestAnimationFrame(tick);
        if (!vis) return;
        var dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < P.length; i++) {
          var p = P[i];
          p.y -= p.v * dt; p.x += (p.dx + Math.sin(t / 1000 * p.sp + p.ph) * 10) * dt;
          if (p.y < -10 || p.x < -10 || p.x > W + 10) seed(p, false);
          var tw = .55 + .45 * Math.sin(t / 1000 * p.sp * 2 + p.ph), a = p.a * tw, g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, "rgba(255,236,170," + a + ")"); g.addColorStop(.4, "rgba(255,200,100," + a * .35 + ")"); g.addColorStop(1, "rgba(255,200,100,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
        }
      }
      init(); window.addEventListener("resize", init);
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(hero);
      requestAnimationFrame(tick);
    }
  }
})();
