/* v32: menu decoration. Adds the art layer, the hover photo and the link fills. No dependencies. */
(function () {
  "use strict";
  var menu = document.getElementById("menu");
  if (!menu || menu.querySelector(".m-art")) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* 1. art layer (behind the links) */
  var art = document.createElement("div");
  art.className = "m-art";
  art.setAttribute("aria-hidden", "true");
  art.innerHTML =
    '<span class="m-bloom m-bloom--a"></span><span class="m-bloom m-bloom--b"></span><span class="m-dots"></span>' +
    '<svg class="m-vine" viewBox="0 0 600 900" preserveAspectRatio="xMaxYMid slice" focusable="false">' +
    '<path d="M590 880 C 470 800, 560 690, 430 620 S 300 470, 420 390 S 540 250, 430 150 S 380 40, 440 -10"/>' +
    '<path d="M600 800 C 520 740, 580 640, 500 560 S 440 420, 530 340 S 590 200, 540 120"/>' +
    '<circle cx="430" cy="620" r="7"/><circle cx="420" cy="390" r="9"/><circle cx="430" cy="150" r="7"/><circle cx="530" cy="340" r="6"/></svg>' +
    '<span class="m-st m-st--a"><img src="assets/stickers/kitenge.webp" alt="" loading="lazy" decoding="async"></span>' +
    '<span class="m-st m-st--b"><img src="assets/stickers/trader.webp" alt="" loading="lazy" decoding="async"></span>' +
    '<span class="m-st m-st--c"><img src="assets/stickers/couple.webp" alt="" loading="lazy" decoding="async"></span>' +
    '<span class="m-st m-st--d"><img src="assets/stickers/sugarcane.webp" alt="" loading="lazy" decoding="async"></span>' +
    '<span class="m-st m-st--e"><img src="assets/stickers/nairobi.webp" alt="" loading="lazy" decoding="async"></span>' +
    '<p class="m-word">We grow <b>together</b></p>';
  menu.insertBefore(art, menu.firstChild);

  /* 2. sliding fill inside each main link */
  var links = Array.prototype.slice.call(menu.querySelectorAll(":scope > ul a"));
  links.forEach(function (a) {
    var s = document.createElement("span");
    s.className = "m-fill";
    s.setAttribute("aria-hidden", "true");
    a.appendChild(s);
  });

  /* 3. photo that follows the pointer */
  var PICS = {
    "index.html": "assets/hero-nairobi.jpg",
    "about.html": "assets/ayoti.jpeg",
    "services.html": "assets/offer-1.jpg",
    "how-it-works.html": "assets/how-lift.jpg",
    "customer-stories.html": "assets/couple.jpg",
    "faqs.html": "assets/how-respect.jpg",
    "branches.html": "assets/shop.jpg",
    "contact.html": "assets/offer-4.jpg"
  };
  if (fine && !reduce) {
    var peek = document.createElement("div");
    peek.className = "m-peek";
    peek.setAttribute("aria-hidden", "true");
    var imgs = {};
    Object.keys(PICS).forEach(function (k) {
      var im = new Image();
      im.alt = ""; im.decoding = "async"; im.loading = "lazy"; im.dataset.src = PICS[k];
      peek.appendChild(im); imgs[k] = im;
    });
    menu.appendChild(peek);
    var loaded = false;
    function loadAll() { if (loaded) return; loaded = true; Object.keys(imgs).forEach(function (k) { imgs[k].src = imgs[k].dataset.src; }); }

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = null;
    function tick() {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      var rot = Math.max(-8, Math.min(8, (tx - cx) * 0.08)) - 3;
      peek.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0) scale(1) rotate(" + rot.toFixed(2) + "deg)";
      raf = (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) ? requestAnimationFrame(tick) : 0;
    }
    function move(e) {
      var w = peek.offsetWidth, h = peek.offsetHeight;
      tx = Math.min(window.innerWidth - w - 16, e.clientX + 36);
      ty = Math.max(16, Math.min(window.innerHeight - h - 16, e.clientY - h * 0.5));
      if (!active) { cx = tx; cy = ty; }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function show(a, e) {
      loadAll();
      var key = (a.getAttribute("href") || "").split("#")[0];
      var im = imgs[key];
      if (!im) return;
      Object.keys(imgs).forEach(function (k) { imgs[k].classList.toggle("is-on", k === key); });
      active = a; peek.classList.add("is-on");
      if (e) move(e);
    }
    function hide() { active = null; peek.classList.remove("is-on"); }

    links.forEach(function (a) {
      a.addEventListener("mouseenter", function (e) { show(a, e); });
      a.addEventListener("mousemove", move);
      a.addEventListener("mouseleave", hide);
      a.addEventListener("focus", function () {
        var r = a.getBoundingClientRect();
        show(a, { clientX: Math.min(r.right - 120, window.innerWidth * 0.5), clientY: r.top + r.height / 2 });
      });
      a.addEventListener("blur", hide);
    });
    new MutationObserver(function () { if (!document.body.classList.contains("menu-open")) hide(); })
      .observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  /* 4. gentle parallax on the stickers */
  if (fine && !reduce) {
    var sts = Array.prototype.slice.call(art.querySelectorAll(".m-st"));
    var depth = [14, -18, 22, -12, 16];
    menu.addEventListener("mousemove", function (e) {
      var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      sts.forEach(function (s, i) {
        s.style.setProperty("--px", (nx * depth[i] * 2).toFixed(1) + "px");
        s.style.setProperty("--py", (ny * depth[i] * 2).toFixed(1) + "px");
      });
    }, { passive: true });
  }
})();
