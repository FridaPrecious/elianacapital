/* Eliana Capital v11: the living background.
   Drives the fixed .ambient layer that sits behind every page (see css/v11.css):
   1) scroll progress  -> --p (orbs slide and change tone, dot grid drifts)
   2) pointer          -> --tx/--ty (parallax), --mx/--my (lit dot grid), --gx/--gy (soft glow)
   3) canvas "seeds"   -> tiny hand marks that float upward, sway, and step away from the pointer
   Plain JavaScript, no libraries. Pauses when the tab is hidden. With reduced motion it draws one still frame. */
(function () {
  "use strict";
  var amb = document.querySelector(".ambient");
  if (!amb) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1) scroll progress, eased so the orbs glide instead of jump ---------- */
  var target = 0, shown = 0;
  function readScroll() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    target = clamp((window.pageYOffset || 0) / max, 0, 1);
  }

  /* ---------- photo crossfade: photo i is fully visible when scroll progress lands on it ---------- */
  var photos = Array.prototype.slice.call(amb.querySelectorAll(".am-ph"));
  function fadePhotos(p) {
    var n = photos.length; if (!n) return;
    var u = p * (n - 1);
    for (var i = 0; i < n; i++) {
      var d = Math.abs(u - i), o = d >= 1 ? 0 : (1 - d);
      o = o * o * (3 - 2 * o);                       /* smoothstep, so the swap feels soft */
      photos[i].style.opacity = o.toFixed(3);
      photos[i].classList.toggle("is-on", o > 0.01);
    }
  }

  /* ---------- 2) pointer ---------- */
  var ptr = { x: -9999, y: -9999, nx: 0, ny: 0, tx: 0, ty: 0, on: false };
  if (!coarse && !reduce) {
    window.addEventListener("pointermove", function (e) {
      ptr.x = e.clientX; ptr.y = e.clientY;
      ptr.tx = (e.clientX / window.innerWidth - .5) * 2;
      ptr.ty = (e.clientY / window.innerHeight - .5) * 2;
      if (!ptr.on) { ptr.on = true; amb.classList.add("has-pointer"); }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { ptr.on = false; ptr.x = ptr.y = -9999; amb.classList.remove("has-pointer"); });
  }

  /* ---------- 3) seeds: the hand mark, tiny, drifting up ---------- */
  var cv = amb.querySelector(".am-seeds");
  var ctx = cv && cv.getContext ? cv.getContext("2d") : null;
  var W = 0, H = 0, dpr = 1, seeds = [];
  var paths = [];
  [1, 2, 3, 4].forEach(function (n) {
    var el = document.getElementById("hand" + n);
    if (el && window.Path2D) { try { paths.push(new Path2D(el.getAttribute("d"))); } catch (e) {} }
  });
  var COLORS = ["1,3,149", "95,160,82", "95,160,82", "166,221,153", "1,3,149"];

  function makeSeed(fresh) {
    var z = Math.random();                          /* depth: 0 far, 1 near */
    return {
      x: Math.random() * W,
      y: fresh ? Math.random() * H : H + 30 + Math.random() * 80,
      z: z,
      s: 7 + z * 15,                                /* size in px */
      vy: -(.12 + z * .42),                         /* upward speed */
      ph: Math.random() * 6.283,
      sw: 10 + Math.random() * 26,                  /* sway width */
      rot: Math.random() * 6.283,
      vr: (Math.random() - .5) * .012,
      a: .10 + z * .22,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      p: paths.length ? paths[(Math.random() * paths.length) | 0] : null,
      ox: 0, oy: 0                                  /* push away from the pointer */
    };
  }

  function size() {
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var n = W < 760 ? 12 : (W < 1200 ? 22 : 32);
    if (reduce) n = Math.min(n, 14);
    while (seeds.length < n) seeds.push(makeSeed(true));
    if (seeds.length > n) seeds.length = n;
  }

  function drawSeed(s) {
    ctx.save();
    ctx.translate(s.x + s.ox, s.y + s.oy);
    ctx.rotate(s.rot);
    ctx.globalAlpha = s.a;
    ctx.fillStyle = "rgb(" + s.c + ")";
    if (s.p) { var k = s.s; ctx.scale(k, k); ctx.fill(s.p); }
    else { ctx.beginPath(); ctx.arc(0, 0, s.s * .35, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }

  var last = 0, t = 0;
  function frame(now) {
    var dt = Math.min(48, now - (last || now)); last = now; t += dt;

    /* ease scroll and pointer values, publish them to CSS */
    shown += (target - shown) * .06;
    amb.style.setProperty("--p", shown.toFixed(4));
    fadePhotos(shown);
    if (!coarse) {
      ptr.nx += (ptr.tx - ptr.nx) * .06; ptr.ny += (ptr.ty - ptr.ny) * .06;
      amb.style.setProperty("--tx", ptr.nx.toFixed(3));
      amb.style.setProperty("--ty", ptr.ny.toFixed(3));
      if (ptr.on) {
        amb.style.setProperty("--mx", ptr.x + "px"); amb.style.setProperty("--my", ptr.y + "px");
        amb.style.setProperty("--gx", ptr.x + "px"); amb.style.setProperty("--gy", ptr.y + "px");
      }
    }

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < seeds.length; i++) {
        var s = seeds[i];
        s.y += s.vy * (dt / 16.7);
        s.rot += s.vr * (dt / 16.7);
        s.x += Math.sin(t / 1800 + s.ph) * .18 * (dt / 16.7);
        /* a little parallax with the scroll position */
        var drawY = s.y - shown * 260 * (.3 + s.z);
        /* step away from the pointer */
        var dx = (s.x + s.ox) - ptr.x, dy = (drawY + s.oy) - ptr.y, d2 = dx * dx + dy * dy, R = 150;
        if (ptr.on && d2 < R * R) {
          var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.4;
          s.ox += dx / d * f; s.oy += dy / d * f;
        }
        s.ox *= .94; s.oy *= .94;
        var keepY = s.y; s.y = drawY; drawSeed(s); s.y = keepY;
        if (drawY < -60) {                           /* off the top: start a new seed below the bottom edge */
          var n = makeSeed(false);
          n.y = H + 30 + Math.random() * 80 + shown * 260 * (.3 + n.z);
          seeds[i] = n;
        }
        if (s.x < -40) s.x = W + 40; else if (s.x > W + 40) s.x = -40;
      }
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  }

  var raf = 0;
  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", function () { size(); readScroll(); });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  size(); readScroll(); shown = target; fadePhotos(shown);
  if (reduce) { frame(16); } else { start(); }
})();
