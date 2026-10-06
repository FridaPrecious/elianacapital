/* Eliana Capital: touch-native motion. Phones have no hover, so the effects that hover drives on a desktop are driven here
   by scrolling, swiping and tapping instead. Skipped when the visitor asks for reduced motion. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var coarse = window.matchMedia("(hover:none), (pointer:coarse)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var vh = window.innerHeight, ticking = false, fns = [];
  window.addEventListener("resize", function () { vh = window.innerHeight; queue(); });
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; fns.forEach(function (f) { f(); }); }); } }
  window.addEventListener("scroll", queue, { passive: true });

  /* 1. Cards tip up into place as they scroll in (3D, driven by scroll, replaces hover tilt on touch screens) */
  if (coarse) {
    var cards = $$(".trust li, .person, .spec > div, .contact-card, .facts > div, .stat, .story-nav a, .receipt, .step").map(function (el, i) { el.classList.add("spr"); return { el: el, i: i }; });
    fns.push(function () {
      cards.forEach(function (o) {
        var r = o.el.getBoundingClientRect(); if (r.bottom < -120 || r.top > vh + 120) return;
        var e = clamp((r.top - vh * .6) / (vh * .4), 0, 1), x = clamp((vh * .14 - r.bottom) / (vh * .3), 0, 1);
        var rx = e * 20 - x * 8, ry = e * (o.i % 2 ? -8 : 8), ty = e * 46, s = 1 - e * .06;
        o.el.style.transformOrigin = "50% 100%";
        o.el.style.transform = e + x < .002 ? "" : "perspective(900px) translate3d(0," + ty.toFixed(1) + "px,0) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
      });
    });
  }

  /* 2. Spotlight on tap */
  $$(".spot").forEach(function (el) {
    var t; el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      var b = el.getBoundingClientRect(); el.style.setProperty("--sx", (e.clientX - b.left) + "px"); el.style.setProperty("--sy", (e.clientY - b.top) + "px");
      el.classList.add("lit"); clearTimeout(t); t = setTimeout(function () { el.classList.remove("lit"); }, 800);
    });
  });

  /* 3. How we work: the box for the part of the page you are on opens by itself. Tapping a box still works and pauses this. */
  var panels = $$(".panel"), wrap = $(".panels"), manual = 0;
  if (panels.length && wrap) {
    panels.forEach(function (p) { p.addEventListener("click", function () { manual = Date.now() + 5000; }); });
    fns.push(function () {
      if (window.innerWidth > 820 || Date.now() < manual) return;
      var r = wrap.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var idx = Math.floor(clamp((vh * .66 - r.top) / 150, 0, panels.length - .01)), p = panels[idx];
      if (!p.classList.contains("is-open")) panels.forEach(function (x) { var on = x === p; x.classList.toggle("is-open", on); x.setAttribute("aria-expanded", on); });
    });
  }

  /* 4. Services: the animated scene follows the service you are reading */
  var svcs = $$(".svc"), scenes = $$(".scene"), stage = $(".stage");
  if (svcs.length && stage) {
    var cur = 0;
    fns.push(function () {
      if (window.innerWidth > 860) return;
      var sb = stage.getBoundingClientRect().bottom, y = sb + (vh - sb) * .35, best = 0, bd = 1e9;
      svcs.forEach(function (s, i) { var r = s.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - y); if (d < bd) { bd = d; best = i; } });
      if (best !== cur) { cur = best; svcs.forEach(function (s, k) { s.classList.toggle("is-active", k === best); }); scenes.forEach(function (s, k) { s.classList.toggle("is-on", k === best); }); }
    });
  }

  /* 6. Story index: the row in the middle of the screen lights up and its photo grows (replaces the hover preview) */
  var list = $(".story-list"), rows = list ? $$("li", list) : [];
  if (rows.length) fns.push(function () {
    if (window.innerWidth > 860 && !coarse) return;
    var lb = list.getBoundingClientRect(); if (lb.bottom < 0 || lb.top > vh) { list.classList.remove("has-hover"); rows.forEach(function (r) { r.classList.remove("is-hot"); }); return; }
    var mid = vh * .55, best = 0, bd = 1e9;
    rows.forEach(function (r, i) { var b = r.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid); if (d < bd) { bd = d; best = i; } });
    list.classList.add("has-hover"); rows.forEach(function (r, i) { r.classList.toggle("is-hot", i === best); });
  });

  queue();
})();
