/* Eliana Capital: page feel. Inertia scrolling, curtain page transitions, a cursor follower and the story index preview. */
(function () {
  "use strict";
  var SMOOTH = true;   /* set to false to use the browser's normal scrolling */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Curtain: it is already in the page (covering from first paint). Here it only slides back in before we leave. */
  var cur = $(".curtain");
  if (cur && !reduce) document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target) return;
    var h = a.getAttribute("href"); if (!h || /^(#|mailto:|tel:|https?:)/.test(h) || h.indexOf(".html") < 0) return;
    if (h.split("#")[0] === location.pathname.split("/").pop()) return;
    e.preventDefault();
    cur.getAnimations().forEach(function (an) { an.cancel(); }); cur.style.visibility = "visible";
    var go = cur.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], { duration: 480, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    var done = false, nav = function () { if (!done) { done = true; location.href = a.href; } };
    go.onfinish = nav; setTimeout(nav, 700);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted && cur) { cur.getAnimations().forEach(function (an) { an.cancel(); }); cur.style.visibility = "hidden"; cur.style.transform = "translateY(-101%)"; } });

  /* Inertia scrolling: the native scroll position is eased toward the wheel target, so anchors, sticky and the keyboard all keep working */
  if (SMOOTH && fine && !reduce) {
    var target = 0, pos = 0, on = false, root = document.documentElement;
    var maxY = function () { return root.scrollHeight - window.innerHeight; };
    var tick = function () {
      pos += (target - pos) * .105;
      if (Math.abs(target - pos) < .4) { pos = target; on = false; root.classList.remove("is-smooth"); }
      window.scrollTo(0, pos); if (on) requestAnimationFrame(tick);
    };
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented || document.body.classList.contains("menu-open")) return;
      for (var el = e.target; el && el !== document.body; el = el.parentElement) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) return;
      }
      e.preventDefault();
      if (!on) { pos = target = window.scrollY; }
      target = clamp(target + (e.deltaMode === 1 ? e.deltaY * 34 : e.deltaY), 0, maxY());
      if (!on) { on = true; root.classList.add("is-smooth"); requestAnimationFrame(tick); }
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!on) { pos = target = window.scrollY; } }, { passive: true });
  }

  /* Cursor follower */
  if (fine && !reduce) {
    var c = document.createElement("div"); c.className = "cursor"; c.setAttribute("aria-hidden", "true"); c.innerHTML = "<span></span>"; document.body.appendChild(c);
    var tx = -100, ty = -100, x = -100, y = -100, lbl = c.firstChild;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; c.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerleave", function () { c.classList.remove("on"); });
    (function loop() { x += (tx - x) * .2; y += (ty - y) * .2; c.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", function (e) {
      var t = e.target, view = t.closest && t.closest(".story, .feat-a, .photo-link, .story-list a");
      var link = t.closest && t.closest("a, button, summary, input, select, textarea, label");
      c.classList.toggle("is-hidden", !!(t.closest && t.closest(".panels")));
      c.classList.toggle("is-view", !!view); c.classList.toggle("is-link", !!link && !view);
      if (view) lbl.textContent = view.matches(".story-list a") ? "Open" : "Read";
    });
  }

  /* Story index: a floating preview follows the cursor and tilts with its speed */
  var list = $(".story-list"), pv = $(".story-preview");
  if (list && pv && fine && !reduce) {
    var imgs = $$("img", pv), px = 0, py = 0, qx = 0, qy = 0, tilt = 0, shown = false;
    $$("a", list).forEach(function (a, i) {
      a.addEventListener("pointerenter", function () { imgs.forEach(function (m, k) { m.classList.toggle("is-on", k === i); }); list.classList.add("has-hover"); a.parentNode.classList.add("is-hot"); pv.classList.add("on"); });
      a.addEventListener("pointerleave", function () { list.classList.remove("has-hover"); a.parentNode.classList.remove("is-hot"); pv.classList.remove("on"); });
    });
    window.addEventListener("pointermove", function (e) { qx = e.clientX; qy = e.clientY; if (!shown) { px = qx; py = qy; shown = true; } }, { passive: true });
    (function loop() {
      var dx = qx - px; px += dx * .14; py += (qy - py) * .14; tilt += (clamp(dx * .35, -14, 14) - tilt) * .15;
      pv.style.transform = "translate(" + (px + 28).toFixed(1) + "px," + (py - 150).toFixed(1) + "px) rotate(" + tilt.toFixed(2) + "deg)"; requestAnimationFrame(loop);
    })();
  }
})();
