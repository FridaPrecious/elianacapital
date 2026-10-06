/* Eliana Capital v14: the hero scene.
   A Nairobi dawn drawn in code, in the brand's blue and green: sky, sun and rays, three layers of skyline (with the
   KICC tower), an acacia tree and tall grass in the foreground. Every layer sits at its own depth and moves with the
   pointer and with scroll, so the hero has real parallax. Crisp at any size (it is vector), and it replaces the soft photo.
   Plain JavaScript. With reduced motion it is drawn once and stays still. */
(function () {
  "use strict";
  var photo = document.querySelector(".hero-photo");
  if (!photo) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 1600, H = 1000, SX = 640, SY = 520;   /* canvas, sun position */

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function n1(v) { return Math.round(v * 10) / 10; }

  /* a skyline as one path, plus a list of lit windows */
  function skyline(r, o) {
    var d = "", win = "", x = o.x0, tops = [];
    while (x < o.x1) {
      var w = o.minW + r() * (o.maxW - o.minW), h = o.minH + r() * (o.maxH - o.minH), top = o.y0 - h;
      if (r() < .3) { // stepped crown
        var sw = w * (.45 + r() * .2), sx = x + (w - sw) / 2, sh = h * (.12 + r() * .12);
        d += "M" + n1(x) + " " + o.y0 + "V" + n1(top) + "H" + n1(sx) + "V" + n1(top - sh) + "H" + n1(sx + sw) + "V" + n1(top) + "H" + n1(x + w) + "V" + o.y0 + "Z";
      } else if (r() < .18) { // slanted crown
        d += "M" + n1(x) + " " + o.y0 + "V" + n1(top + 26) + "L" + n1(x + w) + " " + n1(top) + "V" + o.y0 + "Z";
      } else d += "M" + n1(x) + " " + o.y0 + "V" + n1(top) + "H" + n1(x + w) + "V" + o.y0 + "Z";
      if (r() < .22) { var ax = x + w * (.3 + r() * .4); d += "M" + n1(ax) + " " + n1(top) + "V" + n1(top - 30 - r() * 40) + "h2V" + n1(top) + "Z"; }
      if (o.win) { // lit windows, a sparse grid
        for (var yy = top + 14; yy < o.y0 - 10; yy += 15) for (var xx = x + 8; xx < x + w - 8; xx += 11) if (r() < o.win) win += "M" + n1(xx) + " " + n1(yy) + "h4v6h-4Z";
      }
      tops.push([x, w, top]);
      x += w + o.gap * (.4 + r() * 1.2);
    }
    return { d: d, win: win };
  }

  /* KICC (the cylinder with the helipad) and a slim neighbour, drawn by hand */
  function landmarks(x) {
    var d = "";
    d += "M" + (x - 30) + " 800V588C" + (x - 30) + " 578," + (x - 20) + " 572," + x + " 572C" + (x + 20) + " 572," + (x + 30) + " 578," + (x + 30) + " 588V800Z";
    d += "M" + (x - 50) + " 580H" + (x + 50) + "V595H" + (x - 50) + "Z";            /* round gallery */
    d += "M" + (x - 16) + " 580V540H" + (x + 16) + "V580Z";                           /* upper drum */
    d += "M" + (x - 2.5) + " 540V506h5V540Z";                                         /* mast */
    var t = x + 120;
    d += "M" + (t - 32) + " 800V632L" + (t + 32) + " 606V800Z";                       /* slanted-top tower */
    var u = x - 135;
    d += "M" + (u - 26) + " 800V664H" + (u - 9) + "V646H" + (u + 9) + "V664H" + (u + 26) + "V800Z";
    return d;
  }

  /* acacia: flat umbrella crown, thin curved trunk */
  function acacia(r) {
    var crown = "", hi = "", dots = "";
    var rows = [[478, 110, 26], [500, 130, 24], [458, 90, 20], [520, 100, 20]];
    rows.forEach(function (row, ri) {
      var n = 9 + ri * 2;
      for (var i = 0; i < n; i++) {
        var cx = 70 + (i / (n - 1)) * 400 + (r() - .5) * 40, cy = row[0] + (r() - .5) * 18, rx = row[1] * (.6 + r() * .6) * .5, ry = row[2] * (.7 + r() * .5) * .5;
        crown += '<ellipse cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '"/>';
        if (ri < 2) hi += '<ellipse cx="' + n1(cx - 5) + '" cy="' + n1(cy - ry * .45) + '" rx="' + n1(rx * .8) + '" ry="' + n1(ry * .5) + '"/>';
      }
    });
    for (var k = 0; k < 90; k++) dots += '<ellipse cx="' + n1(20 + r() * 480) + '" cy="' + n1(440 + r() * 110) + '" rx="' + n1(10 + r() * 22) + '" ry="' + n1(3 + r() * 5) + '"/>';
    var trunk = '<path d="M205 1010C212 900 190 800 214 700C232 628 236 570 222 520L246 520C262 580 262 640 252 710C240 800 262 900 258 1010Z"/>' +
      '<path d="M222 560C180 540 140 520 96 500L100 490C150 508 196 528 232 546Z"/>' +
      '<path d="M244 580C290 556 340 534 400 514L396 504C334 522 282 544 238 566Z"/>' +
      '<path d="M236 620C250 580 262 548 268 520L258 520C252 548 244 580 230 612Z"/>';
    return { crown: crown, hi: hi, dots: dots, trunk: trunk };
  }

  /* tall grass and pampas plumes */
  function grass(r, x0, x1, hmin, hmax, plumes) {
    var blades = "", heads = "";
    var n = Math.round((x1 - x0) / 7);
    for (var i = 0; i < n; i++) {
      var bx = x0 + r() * (x1 - x0), h = hmin + r() * (hmax - hmin), lean = (r() - .62) * h * .5, base = 1012;
      var tx = bx + lean, ty = base - h, w = 5 + r() * 5;
      blades += '<path class="b' + (i % 3) + '" d="M' + n1(bx - w) + ' ' + base + 'Q' + n1(bx + lean * .1) + ' ' + n1(base - h * .55) + ' ' + n1(tx) + ' ' + n1(ty) + 'Q' + n1(bx + lean * .1 + 8) + ' ' + n1(base - h * .5) + ' ' + n1(bx + w) + ' ' + base + 'Z"/>';
      if (plumes && r() < plumes) {
        var a = (lean / h) * 60 - 8 + (r() - .5) * 14;
        heads += '<g transform="translate(' + n1(tx) + ' ' + n1(ty) + ') rotate(' + n1(a) + ')"><path d="M0 4C-12 -30 -10 -70 0 -118C10 -70 12 -30 0 4Z"/><path class="pl2" d="M0 4C-5 -30 -3 -70 0 -118C3 -70 5 -30 0 4Z"/></g>';
      }
    }
    return { blades: blades, heads: heads };
  }

  function build() {
    var r = rng(2026), svg = "";
    var far = skyline(r, { x0: -20, x1: W + 20, y0: 700, minW: 38, maxW: 90, minH: 50, maxH: 150, gap: 8 });
    var mid = skyline(r, { x0: -20, x1: W + 20, y0: 800, minW: 52, maxW: 120, minH: 70, maxH: 190, gap: 12, win: .1 });
    var near = skyline(r, { x0: -20, x1: W + 20, y0: 905, minW: 70, maxW: 150, minH: 40, maxH: 110, gap: 18, win: .08 });
    var lm = landmarks(1060);
    var ac = acacia(r), gR = grass(r, 1180, 1640, 150, 430, .22), gL = grass(r, 330, 760, 70, 190, .1), gE = grass(r, -40, 120, 120, 260, 0);
    var rays = "";
    for (var i = 0; i < 18; i++) { var a = i * 20 + r() * 8, wd = 14 + r() * 34; rays += '<path transform="rotate(' + n1(a) + ')" d="M0 0L' + n1(-wd) + ' -900L' + n1(wd) + ' -900Z" opacity="' + n1(.12 + r() * .22) + '"/>'; }
    var stars = ""; for (var s = 0; s < 40; s++) stars += '<circle cx="' + n1(r() * W) + '" cy="' + n1(r() * 280) + '" r="' + n1(.8 + r() * 1.4) + '" opacity="' + n1(.2 + r() * .4) + '"/>';

    svg += '<svg class="dscene" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9b8ec"/><stop offset=".30" stop-color="#cfd9f4"/><stop offset=".52" stop-color="#f7ebcf"/><stop offset=".66" stop-color="#ffd993"/><stop offset=".80" stop-color="#ffc977"/><stop offset="1" stop-color="#f6b365"/></linearGradient>' +
      '<radialGradient id="sg" cx="' + SX + '" cy="' + SY + '" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe6" stop-opacity="1"/><stop offset=".12" stop-color="#ffeaa8" stop-opacity=".95"/><stop offset=".4" stop-color="#ffcf80" stop-opacity=".5"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="gf" gradientUnits="userSpaceOnUse" x1="' + (SX - 760) + '" y1="0" x2="' + (SX + 760) + '" y2="0"><stop offset="0" stop-color="#7f93dc"/><stop offset=".5" stop-color="#d6d9ee"/><stop offset="1" stop-color="#8396de"/></linearGradient>' +
      '<linearGradient id="gm" gradientUnits="userSpaceOnUse" x1="' + (SX - 760) + '" y1="0" x2="' + (SX + 760) + '" y2="0"><stop offset="0" stop-color="#3748ad"/><stop offset=".5" stop-color="#8e8fc4"/><stop offset="1" stop-color="#3a4bb0"/></linearGradient>' +
      '<linearGradient id="gn" gradientUnits="userSpaceOnUse" x1="' + (SX - 760) + '" y1="0" x2="' + (SX + 760) + '" y2="0"><stop offset="0" stop-color="#0a1480"/><stop offset=".5" stop-color="#2b3796"/><stop offset="1" stop-color="#0a1480"/></linearGradient>' +
      '<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9bd" stop-opacity="0"/><stop offset="1" stop-color="#ffe9bd" stop-opacity=".62"/></linearGradient>' +
      '<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7a45"/><stop offset="1" stop-color="#0d3b2a"/></linearGradient>' +
      '<radialGradient id="rmg"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="rm" maskUnits="userSpaceOnUse" x="-900" y="-900" width="1800" height="1800"><circle r="880" fill="url(#rmg)"/></mask><filter id="bl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>' +
      '<filter id="bl2"><feGaussianBlur stdDeviation="1.1"/></filter></defs>';

    svg += '<g class="L" data-d="0"><rect width="' + W + '" height="' + H + '" fill="url(#sk)"/><g fill="#fff">' + stars + '</g></g>';
    svg += '<g class="L" data-d=".08"><circle cx="' + SX + '" cy="' + SY + '" r="520" fill="url(#sg)"/>' +
      '<g class="rays" mask="url(#rm)" transform="translate(' + SX + ' ' + SY + ')"><g class="spin" fill="#fff4cf">' + rays + '</g></g>' +
      '<circle cx="' + SX + '" cy="' + SY + '" r="46" fill="#fffdf2"/></g>';
    svg += '<g class="L clouds" data-d=".12" filter="url(#bl)" fill="#fff7e3"><ellipse class="c1" cx="360" cy="420" rx="260" ry="26" opacity=".55"/><ellipse class="c2" cx="1260" cy="360" rx="300" ry="22" opacity=".45"/><ellipse class="c3" cx="800" cy="500" rx="220" ry="16" opacity=".5"/></g>';
    svg += '<g class="L" data-d=".2"><path d="' + far.d + '" fill="url(#gf)" opacity=".72"/><rect y="560" width="' + W + '" height="260" fill="url(#mist)"/></g>';
    svg += '<g class="L" data-d=".34"><path d="' + mid.d + lm + '" fill="url(#gm)"/><path d="' + mid.win + '" fill="#ffe2a0" opacity=".85" class="win"/>' +
      '<rect y="640" width="' + W + '" height="260" fill="url(#mist)" opacity=".8"/></g>';
    svg += '<g class="L" data-d=".5"><path d="' + near.d + '" fill="url(#gn)"/><path d="' + near.win + '" fill="#ffe2a0" opacity=".7" class="win"/><rect y="830" width="' + W + '" height="200" fill="url(#mist)" opacity=".55"/></g>';
    svg += '<g class="L" data-d=".62"><path d="M-10 1010V935C260 910 520 930 800 950S1360 930 1620 944V1010Z" fill="url(#gr)"/></g>';
    svg += '<g class="L fgl" data-d=".95"><g class="sway s1"><g fill="#0d3b2a">' + ac.crown + ac.trunk + '</g><g fill="#2f7a45" opacity=".75">' + ac.hi + '</g><g fill="#14482f">' + ac.dots + '</g></g>' +
      '<g class="gr gl sway s2">' + gL.blades + '<g class="hd">' + gL.heads + '</g></g><g class="gr gl sway s3">' + gE.blades + '</g></g>';
    svg += '<g class="L fgr" data-d="1.1"><g class="gr sway s2">' + gR.blades + '<g class="hd">' + gR.heads + '</g></g></g>';
    svg += '</svg>';
    return svg;
  }

  var host = document.createElement("div");
  host.className = "scene-wrap";
  host.innerHTML = build();
  photo.appendChild(host);
  photo.classList.add("scene-on");

  var layers = Array.prototype.slice.call(host.querySelectorAll(".L"));
  var depth = layers.map(function (l) { return parseFloat(l.getAttribute("data-d")); });
  requestAnimationFrame(function () { setTimeout(function () { photo.classList.add("scene-in"); }, 350); });
  if (reduce) { photo.classList.add("scene-in"); return; }

  /* parallax: pointer sideways, scroll vertically */
  var px = 0, py = 0, tx = 0, ty = 0, sc = 0, vis = true, hero = photo.parentNode;
  window.addEventListener("pointermove", function (e) { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; }, { passive: true });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(hero);
  function frame() {
    requestAnimationFrame(frame);
    if (!vis) return;
    px += (tx - px) * .06; py += (ty - py) * .06;
    sc = window.pageYOffset || 0;
    for (var i = 0; i < layers.length; i++) {
      var d = depth[i];
      layers[i].style.transform = "translate3d(" + (-px * d * 46).toFixed(2) + "px," + (-py * d * 20 + sc * d * .16).toFixed(2) + "px,0)";
    }
  }
  requestAnimationFrame(frame);
})();
