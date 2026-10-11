/* v39: dot map of Kenya with Eliana marks that wander at random. Decorative: it does not show real branch positions. */
(function () {
  "use strict";
  var host = document.querySelector(".fm-map");
  if (!host) return;
  var cv = host.querySelector("canvas"), layer = host.querySelector(".fm-marks"), ctx = cv.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* rough outline of Kenya, [lon, lat], and Lake Turkana (left empty) */
  var KENYA = [[33.95,-1.0],[33.93,0.1],[34.1,0.5],[34.4,0.9],[34.55,1.15],[34.8,1.45],[34.9,1.9],[34.6,2.9],[34.4,3.5],[34.0,4.2],[34.5,4.55],[35.0,4.62],[35.9,4.6],[36.1,4.4],[36.9,4.45],[37.6,3.95],[38.1,3.6],[39.05,3.5],[40.0,4.1],[41.0,4.0],[41.9,3.98],[41.3,3.2],[40.95,2.8],[41.0,-0.8],[41.55,-1.65],[41.4,-1.9],[40.9,-2.3],[40.4,-2.8],[39.9,-3.4],[39.6,-4.0],[39.2,-4.65],[38.6,-4.05],[38.1,-3.75],[37.7,-3.4],[37.65,-3.05],[37.2,-3.0],[36.8,-2.55],[36.0,-2.0],[35.9,-1.85],[35.0,-1.15]];
  var TURKANA = [[35.8,4.2],[36.15,4.35],[36.3,3.6],[36.1,3.0],[35.85,3.4]];
  function nx(lon) { return (lon - 33.7) / 8.5; }
  function ny(lat) { return (4.8 - lat) / 9.7; }
  function inside(poly, x, y) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  var dots = [], STEP = 0.17;
  for (var lat = 4.7; lat > -4.8; lat -= STEP) {
    for (var lon = 33.8; lon < 42.1; lon += STEP) {
      if (inside(KENYA, lon, lat) && !inside(TURKANA, lon, lat)) dots.push({ x: nx(lon), y: ny(lat) });
    }
  }

  var W = 0, H = 0, dpr = 1, marks = [], COUNT = 5, raf = 0, visible = true;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function pickTarget(self) {
    for (var k = 0; k < 30; k++) {
      var d = dots[(Math.random() * dots.length) | 0], ok = true;
      for (var i = 0; i < marks.length; i++) {
        if (marks[i] === self) continue;
        var dx = (d.x - marks[i].tx) * W, dy = (d.y - marks[i].ty) * H;
        if (dx * dx + dy * dy < 80 * 80) { ok = false; break; }
      }
      if (ok) return d;
    }
    return dots[(Math.random() * dots.length) | 0];
  }
  function newLeg(m, now) {
    var t = pickTarget(m);
    m.fx = m.x; m.fy = m.y; m.tx = t.x; m.ty = t.y;
    m.t0 = now + rnd(300, 1800); m.dur = rnd(3200, 6200);
    m.pinged = false;
  }

  function size() {
    var r = host.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var base = Math.max(1.1, W / 330), R = W * 0.16, R2 = R * R;
    for (var i = 0; i < dots.length; i++) {
      var px = dots[i].x * W, py = dots[i].y * H, g = 0;
      for (var j = 0; j < marks.length; j++) {
        var dx = px - marks[j].x * W, dy = py - marks[j].y * H, d2 = dx * dx + dy * dy;
        if (d2 < R2) { var v = 1 - Math.sqrt(d2) / R; if (v > g) g = v; }
      }
      if (g > 0) {
        ctx.fillStyle = "rgba(" + Math.round(1 + 94 * g) + "," + Math.round(3 + 157 * g) + "," + Math.round(149 - 67 * g) + "," + (0.28 + 0.62 * g).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(px, py, base * (1 + g * 0.9), 0, 6.2832); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(1,3,149,.24)";
        ctx.beginPath(); ctx.arc(px, py, base, 0, 6.2832); ctx.fill();
      }
    }
  }
  function place() {
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      m.el.style.transform = "translate3d(" + (m.x * W).toFixed(1) + "px," + (m.y * H).toFixed(1) + "px,0)";
    }
  }
  function frame(now) {
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i], p = (now - m.t0) / m.dur;
      if (p < 0) continue;
      if (p >= 1) {
        m.x = m.tx; m.y = m.ty;
        if (!m.pinged) { m.pinged = true; m.el.classList.remove("is-ping"); void m.el.offsetWidth; m.el.classList.add("is-ping"); }
        newLeg(m, now); continue;
      }
      var e = ease(p); m.x = m.fx + (m.tx - m.fx) * e; m.y = m.fy + (m.ty - m.fy) * e;
    }
    draw(); place();
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }

  /* build marks at random dots */
  for (var i = 0; i < COUNT; i++) {
    var el = document.createElement("span");
    el.className = "fm-mark"; el.innerHTML = '<img src="assets/logo-mark-white.svg" alt="" width="22" height="22" decoding="async">';
    layer.appendChild(el);
    var d = pickTarget(null);
    marks.push({ el: el, x: d.x, y: d.y, fx: d.x, fy: d.y, tx: d.x, ty: d.y, t0: 0, dur: 1, pinged: true });
  }
  size();
  marks.forEach(function (m) { newLeg(m, performance.now()); });
  draw(); place();
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(); place(); }, 120); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(host);
  } else start();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
})();
