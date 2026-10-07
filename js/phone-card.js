/* Services page phone: same behaviour as the home-page phone.
   It springs in the first time it scrolls into view, then floats (CSS), turns a little toward the pointer,
   and leans with the scroll speed. Reduced motion: no movement, the phone is simply shown. */
(function () {
  "use strict";
  var box = document.querySelector(".phone-feature"); if (!box) return;
  var rig = box.querySelector(".phone-rig"); if (!rig) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { box.classList.add("is-in"); return; }

  var io = new IntersectionObserver(function (en) {
    if (en[0].isIntersecting) { box.classList.add("is-in"); io.disconnect(); }
  }, { threshold: .25 });
  io.observe(box);

  /* turn toward the pointer (soft, small angles) */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine) {
    box.addEventListener("pointermove", function (e) {
      var r = box.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      rig.style.setProperty("--py", (x * 16).toFixed(2) + "deg");
      rig.style.setProperty("--px", (-y * 10).toFixed(2) + "deg");
    });
    box.addEventListener("pointerleave", function () {
      rig.style.setProperty("--py", "0deg"); rig.style.setProperty("--px", "0deg");
    });
  }

  /* lean a touch with the scroll speed, then settle */
  var last = window.scrollY, t;
  window.addEventListener("scroll", function () {
    var d = Math.max(-40, Math.min(40, window.scrollY - last)); last = window.scrollY;
    rig.style.setProperty("--spin", (d * .18).toFixed(2) + "deg");
    clearTimeout(t); t = setTimeout(function () { rig.style.setProperty("--spin", "0deg"); }, 140);
  }, { passive: true });
})();
