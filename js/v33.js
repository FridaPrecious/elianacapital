/* v33: flowing menu. Needs assets/vendor/motion.min.js (Motion, MIT). Falls back to the plain list without it. */
(function () {
  "use strict";
  var menu = document.getElementById("menu");
  var M = window.Motion;
  if (!menu || menu.getAttribute("data-v33") || !M || !M.animate) return;
  menu.setAttribute("data-v33", "1");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  var PICS = {
    "index.html": "assets/tailor.jpg", "about.html": "assets/ayoti.jpeg", "services.html": "assets/offer-1.jpg",
    "how-it-works.html": "assets/how-lift.jpg", "customer-stories.html": "assets/couple.jpg", "faqs.html": "assets/how-respect.jpg",
    "branches.html": "assets/shop.jpg", "contact.html": "assets/offer-4.jpg"
  };
  var HINTS = {
    "index.html": ["Start here", "Start here"], "about.html": ["Who we are", "Who we are"],
    "services.html": ["Loans for your business", "Our loans"], "how-it-works.html": ["Apply, repay, grow", "Step by step"],
    "customer-stories.html": ["Real stories", "Clients"], "faqs.html": ["Quick answers", "Quick answers"],
    "branches.html": ["Find us near you", "Near you"], "contact.html": ["Talk to us", "Talk to us"]
  };
  var EASE = [0.16, 1, 0.3, 1];
  var touchAt = 0;
  function recentTouch() { return Date.now() - touchAt < 900; }
  var kb = false; /* ribbon on focus only for keyboard users */
  document.addEventListener("keydown", function (e) { if (e.key === "Tab" || e.key.indexOf("Arrow") === 0) kb = true; }, true);
  document.addEventListener("pointerdown", function () { kb = false; }, true);
  var links = Array.prototype.slice.call(menu.querySelectorAll(":scope > ul a"));

  links.forEach(function (a) {
    var key = (a.getAttribute("href") || "").split("#")[0];
    var label = a.textContent.trim();
    var pic = PICS[key];

    a.textContent = "";
    var lab = document.createElement("span"); lab.className = "m-label"; lab.textContent = label; a.appendChild(lab);
    if (HINTS[key]) {
      var h = document.createElement("span"); h.className = "m-hint";
      h.innerHTML = '<span class="m-hl"></span><span class="m-hs"></span>';
      h.firstChild.textContent = HINTS[key][0]; h.lastChild.textContent = HINTS[key][1];
      a.appendChild(h);
    }
    var one = '<span class="m-item"><b></b><i style="background-image:url(' + (pic || "") + ')"></i><s></s></span>';
    var half = new Array(7).join(one);
    var rib = document.createElement("span"); rib.className = "m-rib"; rib.setAttribute("aria-hidden", "true");
    var inn = document.createElement("span"); inn.className = "m-rib-in";
    var track = document.createElement("span"); track.className = "m-track"; track.innerHTML = half + half;
    Array.prototype.forEach.call(track.querySelectorAll("b"), function (b) { b.textContent = label; });
    inn.appendChild(track); rib.appendChild(inn); a.appendChild(rib);
    a._rib = rib; a._inn = inn; a._busy = false; a._shown = false;

    function edgeOf(e) {
      var r = a.getBoundingClientRect(), y = e.clientY - r.top;
      return y < r.height / 2 ? "top" : "bottom";
    }
    function go(show, edge) {
      var off = edge === "top" ? -101 : 101;
      var ry = show ? 0 : off, iy = show ? 0 : -off;
      var opts = { duration: reduce ? 0.01 : 0.6, ease: EASE };
      var fresh = show && !a._busy && !a._shown;
      a._busy = true; a._shown = show;
      var r1 = fresh ? { transform: ["translateY(" + off + "%)", "translateY(0%)"] } : { transform: "translateY(" + ry + "%)" };
      var r2 = fresh ? { transform: ["translateY(" + (-off) + "%)", "translateY(0%)"] } : { transform: "translateY(" + iy + "%)" };
      var c1 = M.animate(rib, r1, opts), c2 = M.animate(inn, r2, opts);
      var done = function () { if (a._shown === show) a._busy = false; };
      if (c2 && c2.finished) c2.finished.then(done, done); else done();
    }
    a.addEventListener("mouseenter", function (e) { if (!recentTouch()) go(true, edgeOf(e)); });
    a.addEventListener("mouseleave", function (e) { if (!recentTouch()) go(false, edgeOf(e)); });
    a.addEventListener("focus", function () { if (kb) go(true, "top"); });
    a.addEventListener("blur", function () { if (a._shown) go(false, "bottom"); });

    /* touch: the ribbon flows in under the finger, then the page opens */
    a.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      touchAt = Date.now(); a._down = true; go(true, edgeOf(e));
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      a.addEventListener(ev, function (e) {
        if (e.pointerType !== "touch") return;
        touchAt = Date.now();
        if (ev === "pointercancel") { a._down = false; go(false, "bottom"); }
      });
    });
  });

  /* touch tap: let the ribbon finish before leaving (capture phase, so the menu's own close handler waits) */
  menu.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || !a._down || e.ctrlKey || e.metaKey || e.shiftKey) return;
    a._down = false;
    if (reduce) return;
    e.preventDefault(); e.stopPropagation();
    var href = a.href;
    setTimeout(function () { window.location.href = href; }, 450);
  }, true);

  /* opening: the rows spring up one after another, from the middle outwards */
  var lis = Array.prototype.slice.call(menu.querySelectorAll(":scope > ul > li"));
  var isOpen = false;
  function intro() {
    if (reduce) return;
    lis.forEach(function (li) { li.style.opacity = "0"; });
    M.animate(lis, { opacity: [0, 1], y: [56, 0] },
      { delay: M.stagger(0.06, { startDelay: 0.22, from: "center" }), type: "spring", stiffness: 130, damping: 17 });
  }
  function reset() { lis.forEach(function (li) { li.removeAttribute("style"); }); links.forEach(function (a) { if (a._rib) { a._rib.removeAttribute("style"); a._inn.removeAttribute("style"); a._busy = false; a._shown = false; } }); }
  new MutationObserver(function () {
    var now = document.body.classList.contains("menu-open");
    if (now === isOpen) return;
    isOpen = now;
    if (now) intro(); else reset();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();

/* Phone quick-actions bar (Apply now / WhatsApp): add a close button; stay closed for the rest of the visit */
(function () {
  "use strict";
  var KEY = "ecl-mbar-closed";
  var root = document.documentElement;
  try { if (sessionStorage.getItem(KEY) === "1") root.classList.add("bar-off"); } catch (e) {}
  var bar = document.querySelector(".m-bar");
  if (!bar || bar.querySelector(".m-bar-x")) return;
  var x = document.createElement("button");
  x.type = "button"; x.className = "m-bar-x"; x.setAttribute("aria-label", "Close quick actions");
  x.innerHTML = '<span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>';
  x.addEventListener("click", function () {
    root.classList.add("bar-off");
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  });
  bar.appendChild(x);
})();
