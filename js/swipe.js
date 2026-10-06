/* Eliana Capital: story carousels (home page photos and the stories page) on phones and narrow windows.
   Native touch swiping with scroll-snap, plus mouse drag, previous/next buttons, dots and a gentle 3D lean. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mq = window.matchMedia("(max-width:860px)");
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ARROW = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  Array.prototype.slice.call(document.querySelectorAll(".stories-grid, .photos")).forEach(function (track) {
    var sel = track.classList.contains("photos") ? ".photo" : ".story";
    var items = Array.prototype.filter.call(track.children, function (el) { return el.matches(sel); });
    if (items.length < 2) return;

    track.setAttribute("role", "region"); track.setAttribute("aria-roledescription", "carousel"); track.setAttribute("aria-label", "Customer stories");
    items.forEach(function (it) { it.classList.remove("rv"); it.style.removeProperty("--d"); it.style.opacity = ""; });

    var hint = document.createElement("p"); hint.className = "cf-hint"; hint.setAttribute("aria-hidden", "true"); hint.innerHTML = 'Swipe for more <span>&rarr;</span>';
    var nav = document.createElement("div"); nav.className = "cf-nav";
    nav.innerHTML = '<button type="button" class="cf-btn cf-prev" aria-label="Previous story">' + ARROW + '</button>' +
      '<div class="cf-dots" aria-hidden="true">' + items.map(function () { return "<i></i>"; }).join("") + '</div>' +
      '<button type="button" class="cf-btn cf-next" aria-label="Next story">' + ARROW + '</button>';
    track.parentNode.insertBefore(hint, track); track.parentNode.insertBefore(nav, track.nextSibling);
    var dots = Array.prototype.slice.call(nav.querySelectorAll(".cf-dots i")), prev = nav.querySelector(".cf-prev"), next = nav.querySelector(".cf-next");

    var cur = 0;
    function nearest() {
      var tb = track.getBoundingClientRect(), c = tb.left + tb.width / 2, best = 0, bd = 1e9;
      items.forEach(function (it, i) { var b = it.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - c); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function goTo(i) {
      i = clamp(i, 0, items.length - 1);
      var tb = track.getBoundingClientRect(), b = items[i].getBoundingClientRect();
      var left = track.scrollLeft + (b.left - tb.left) - (track.clientWidth - b.width) / 2;
      track.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
    }
    function update() {
      var on = mq.matches, tb = track.getBoundingClientRect(), c = tb.left + tb.width / 2;
      cur = nearest();
      items.forEach(function (it) {
        if (!on || reduce) { it.style.transform = ""; it.style.opacity = ""; return; }
        var b = it.getBoundingClientRect(), d = (b.left + b.width / 2 - c) / b.width, a = Math.min(1, Math.abs(d));
        it.style.transform = "rotateY(" + (-d * 24).toFixed(2) + "deg) scale(" + (1 - a * .08).toFixed(3) + ")";
        it.style.opacity = (1 - a * .35).toFixed(3);
      });
      dots.forEach(function (d, i) { d.classList.toggle("on", i === cur); });
      prev.disabled = cur === 0; next.disabled = cur === items.length - 1;
      if (on && track.scrollLeft > 20) hint.style.opacity = "0";
    }
    var raf = 0;
    track.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }, { passive: true });
    window.addEventListener("resize", update);
    if (mq.addEventListener) mq.addEventListener("change", update);
    prev.addEventListener("click", function () { goTo(cur - 1); });
    next.addEventListener("click", function () { goTo(cur + 1); });
    track.addEventListener("keydown", function (e) {
      if (!mq.matches) return;
      if (e.key === "ArrowRight") { goTo(cur + 1); e.preventDefault(); } else if (e.key === "ArrowLeft") { goTo(cur - 1); e.preventDefault(); }
    });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { goTo(i); }); });

    /* Mouse drag (for narrow desktop windows): touch and trackpads already scroll natively */
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener("pointerdown", function (e) {
      if (!mq.matches || e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; track.classList.add("is-drag");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); track.scrollLeft = sl - dx;
    });
    var up = function () { if (!down) return; down = false; track.classList.remove("is-drag"); goTo(nearest()); };
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    track.addEventListener("click", function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    update(); setTimeout(update, 600); window.addEventListener("load", update);
  });
})();
