/* Eliana Capital v10: the hands come alive.
   1) The travelling mark (.mk): four hands that assemble on load, keep reaching, then travel down the page from
      one "station" to the next. A station is a reserved spot in the layout (.hero-slot, or any [data-mk-stop]) that sits
      beside the text it belongs to, so the mark always lands next to the words, like the cup on mylk-co.com.
      Between stations it opens up and turns a quarter turn; colours follow each station's data-mk-theme (light, dark, green).
      Where two stations are far apart (the stacking service cards) it stays with the station it left and the next one picks it up.
   2) Pointer lean for the hero chips. 3) Slowly turning hand marks behind the dark and call-to-action bands.
   Plain JavaScript, no libraries. With reduced motion the mark is still and simply sits at the nearest station. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var backOut = function (t) { t = clamp(t, 0, 1); var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  var pointer = { x: .5, y: .5, px: -1, py: -1 };

  /* ---- scroll value for the turning decorations (CSS reads --sy) ---- */
  var sy = 0;
  function readScroll() { sy = window.pageYOffset || 0; root.style.setProperty("--sy", sy.toFixed(0)); }

  /* ---- decorations behind dark bands ---- */
  if (!reduce) {
    var NS = "http://www.w3.org/2000/svg";
    Array.prototype.forEach.call(document.querySelectorAll(".sec--night, .cta"), function (host) {
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "deco-mark");
      svg.setAttribute("viewBox", "-1.05 -1.05 2.1 2.1");
      svg.setAttribute("aria-hidden", "true");
      var use = document.createElementNS(NS, "use");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#hands");
      use.setAttribute("href", "#hands");
      svg.appendChild(use);
      host.insertBefore(svg, host.firstChild);
    });
    window.addEventListener("scroll", readScroll, { passive: true });
    readScroll();
  }

  /* ---- pointer ---- */
  window.addEventListener("pointermove", function (e) {
    pointer.px = e.clientX; pointer.py = e.clientY;
    pointer.x = e.clientX / window.innerWidth; pointer.y = e.clientY / window.innerHeight;
  }, { passive: true });

  /* ---- the travelling mark ---- */
  var mk = document.querySelector(".mk");
  var slot = document.querySelector(".hero-slot");
  if (!mk || !slot) return;
  var rot = mk.querySelector(".mk-rot");
  var hands = Array.prototype.slice.call(mk.querySelectorAll(".mk-h"));
  /* outward direction of each hand from the centre of the mark (measured from the artwork) */
  var DIR = [[-0.97, -0.24], [0.29, -0.96], [0.97, 0.26], [-0.19, 0.98]];
  var START = [[-1.7, -0.5], [0.6, -1.7], [1.7, 0.5], [-0.4, 1.7]];   /* where each hand flies in from */
  var SPIN = [-70, 60, -60, 70];

  var stops = [slot].concat(Array.prototype.slice.call(document.querySelectorAll("[data-mk-stop]")));
  var FLY_MAX = 1.9;     /* stations closer than this many screens apart get a flight between them */
  var HOLD = .3;         /* share of the gap the mark stays put with a station before it sets off, and after it lands */
  var t0 = performance.now() + 500;          /* wait for the page curtain to lift */
  var lastTheme = "";
  var vw = window.innerWidth, vh = window.innerHeight;
  window.addEventListener("resize", function () { vw = window.innerWidth; vh = window.innerHeight; });

  function themeOf(el) { return el.getAttribute("data-mk-theme") || "light"; }

  function frame(now) {
    var T = (now - t0) / 1000;
    sy = window.pageYOffset || 0;
    var n = stops.length, i, P = [];
    for (i = 0; i < n; i++) {
      var r = stops[i].getBoundingClientRect();
      var cy = r.top + r.height / 2;
      P.push({ x: r.left + r.width / 2, y: cy, s: Math.min(r.width, r.height), a: sy + cy - vh / 2 });
    }

    /* which pair of stations are we between, and how far along the flight are we */
    var seg = 0;
    while (seg < n - 1 && sy >= P[seg + 1].a) seg++;
    var from = P[seg], to = P[Math.min(seg + 1, n - 1)], t = 0, cur = seg, nxt = Math.min(seg + 1, n - 1);
    if (seg < n - 1) {
      var G = to.a - from.a;
      if (G > 0 && G <= vh * FLY_MAX && !reduce) {
        t = smooth((sy - (from.a + HOLD * G)) / (G * (1 - 2 * HOLD)));
      } else {
        t = sy >= (from.a + to.a) / 2 ? 1 : 0;   /* far apart: the next station picks it up while both are off screen */
      }
    }
    var cx = lerp(from.x, to.x, t), cy2 = lerp(from.y, to.y, t), size = lerp(from.s, to.s, t);
    var lean = (cur === 0 ? 1 - t : 0) + (nxt === 0 ? t : 0);
    cx += (pointer.x - .5) * 16 * lean; cy2 += (pointer.y - .5) * 10 * lean;

    /* hands open when the pointer comes near */
    var near = 0;
    if (pointer.px >= 0 && !reduce) {
      var dx = pointer.px - cx, dy = pointer.py - cy2;
      near = clamp(1 - Math.sqrt(dx * dx + dy * dy) / (size * .95), 0, 1);
    }

    /* a quarter turn per station: the artwork has four hands, so it lands looking the same, having turned on the way */
    var pos = cur + t;
    var sway = reduce ? 0 : Math.sin(T * .7) * 7;
    var angle = (reduce ? Math.round(pos) : pos) * 90 + sway;

    for (i = 0; i < 4; i++) {
      var p = reduce ? 1 : backOut((T - i * .14) / 1.15);
      var inv = 1 - p;
      var reach = reduce ? 0 : Math.sin(T * 1.6 + i * 1.57) * .035;
      var spread = Math.sin(t * Math.PI) * .22 + near * .16 + reach;
      var x = START[i][0] * inv + DIR[i][0] * spread;
      var y = START[i][1] * inv + DIR[i][1] * spread;
      var a = SPIN[i] * inv + (reduce ? 0 : Math.sin(T * 1.1 + i * 2) * 3.5);
      hands[i].style.transform = "translate(" + x.toFixed(4) + "px," + y.toFixed(4) + "px) rotate(" + a.toFixed(2) + "deg)";
      hands[i].style.opacity = reduce ? 1 : clamp((T - i * .14) / .35, 0, 1).toFixed(3);
    }
    rot.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
    rot.style.transformOrigin = "0px 0px";   /* SVG user-space origin = centre of the artwork */
    mk.style.transform = "translate3d(" + (cx - size / 2).toFixed(1) + "px," + (cy2 - size / 2).toFixed(1) + "px,0) scale(" + (size / 100).toFixed(4) + ")";
    if (!mk.classList.contains("is-ready")) mk.classList.add("is-ready");

    /* colours follow the station we are leaving until the halfway point, then the one we are heading to */
    var th = themeOf(stops[t < .5 ? cur : nxt]);
    if (th !== lastTheme) {
      mk.classList.toggle("on-dark", th === "dark");
      mk.classList.toggle("on-green", th === "green");
      lastTheme = th;
    }

    slot.style.setProperty("--px", ((pointer.x - .5) * 2).toFixed(3));
    slot.style.setProperty("--py", ((pointer.y - .5) * 2).toFixed(3));
    requestAnimationFrame(frame);
  }
  sy = window.pageYOffset || 0;
  requestAnimationFrame(frame);
})();
