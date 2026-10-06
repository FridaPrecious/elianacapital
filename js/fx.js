/* Eliana Capital: motion layer. Vanilla versions of effects popular in React Bits / Animos style libraries:
   split-text blur reveal, spotlight cards, count-up, magnetic buttons, scroll progress, page transitions, filters. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover:hover)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var io = function (fn, opt) { return "IntersectionObserver" in window ? new IntersectionObserver(fn, opt || { threshold: .15 }) : null; };

  /* Scroll progress bar */
  var bar = document.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  var prog = function () { var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")"; };
  prog(); window.addEventListener("scroll", prog, { passive: true });

  /* Split-text reveal on page titles and section headings (word by word, blur to sharp) */
  if (!reduce) $$(".phero h1, .sec-head h2, .cta h2, .sec h2:not(.faq h2)").forEach(function (h) {
    if (h.closest(".hero") || h.querySelector("a,span,em,b") || h.closest(".prose")) return;
    var words = h.textContent.trim().split(/\s+/); h.setAttribute("aria-label", h.textContent.trim()); h.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span"); s.className = "sw"; s.setAttribute("aria-hidden", "true"); s.style.setProperty("--i", i); s.textContent = w;
      h.appendChild(s); h.appendChild(document.createTextNode(" "));
    });
    var obs = io(function (en) { en.forEach(function (e) { if (e.isIntersecting) { h.classList.add("sw-in"); obs.unobserve(h); } }); }, { threshold: .2 });
    obs ? obs.observe(h) : h.classList.add("sw-in");
  });

  /* Scroll reveal for blocks */
  var rv = $$(".phero .label, .phero .lead, .lead, .trust li, .spec > div, .step, .person, .story, .contact-card, .tabs, .form, .faq details, .photo--banner, .photo--wide, .photo--tall, .stat, .facts > div, .story-nav a, .prose > *, .chips, .faq-search");
  if (!reduce) {
    var ro = io(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }); }, { threshold: .08, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el, i) {
      if (el.closest(".hero")) return;
      el.classList.add("rv"); var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0; el.style.setProperty("--d", (Math.min(sib, 6) * 70) + "ms");
      ro ? ro.observe(el) : el.classList.add("in");
    });
  }

  /* Spotlight cards: a soft light that follows the cursor (React Bits "SpotlightCard") */
  var spots = $$(".trust li, .spec > div, .stat, .contact-card, .person, .facts > div, .story-nav a, .faq details");
  spots.forEach(function (el) {
    el.classList.add("spot");
    if (!fine) return;
    el.addEventListener("pointermove", function (e) { var b = el.getBoundingClientRect(); el.style.setProperty("--sx", (e.clientX - b.left) + "px"); el.style.setProperty("--sy", (e.clientY - b.top) + "px"); });
  });

  /* Count-up numbers */
  $$(".stat .v").forEach(function (el) {
    var m = el.textContent.match(/^(\d+)(.*)$/); if (!m || reduce) return;
    var end = +m[1], suf = m[2], done = false;
    var obs = io(function (en) { if (!en[0].isIntersecting || done) return; done = true; obs.unobserve(el);
      var t0 = performance.now(), dur = 1300;
      (function tick(now) { var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    el.textContent = "0" + suf; obs && obs.observe(el);
  });

  /* How-it-works: steps light up as you scroll, with a growing line */
  var steps = $$(".step");
  if (steps.length) {
    var list = $(".steps"); var fill = document.createElement("i"); fill.className = "steps-fill"; list.appendChild(fill);
    var upd = function () {
      var vh = window.innerHeight, lr = list.getBoundingClientRect(), mid = vh * .55, cur = -1;
      steps.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top < mid) cur = i; s.classList.toggle("is-on", r.top < mid && r.bottom > vh * .1); });
      fill.style.height = Math.max(0, Math.min(lr.height, mid - lr.top)) + "px";
    };
    upd(); window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
  }

  /* Story filters */
  var chips = $$(".chip");
  chips.forEach(function (c) { c.addEventListener("click", function () {
    var f = c.getAttribute("data-filter");
    chips.forEach(function (x) { x.classList.toggle("is-on", x === c); });
    $$(".story").forEach(function (s) { var show = f === "all" || s.getAttribute("data-cat") === f; s.hidden = !show; });
  }); });

  /* FAQ search */
  var q = $(".faq-search");
  if (q) q.addEventListener("input", function () {
    var v = q.value.trim().toLowerCase(), n = 0;
    $$(".faq details").forEach(function (d) { var hit = !v || d.textContent.toLowerCase().indexOf(v) > -1; d.hidden = !hit; if (hit) n++; if (v && hit) d.open = true; });
    var none = $(".faq-none"); if (none) none.hidden = n > 0;
  });

})();
