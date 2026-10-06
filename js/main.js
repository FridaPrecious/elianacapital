/* Eliana Capital — prototype interactions (no dependencies) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Header turns solid after the hero */
  var hdr = $(".hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("is-solid", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Full-screen menu */
  var btn = $(".menu-btn"), menu = $("#menu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    btn.setAttribute("aria-expanded", open);
    btn.firstElementChild.textContent = open ? "Close" : "Menu";
    menu.setAttribute("aria-hidden", !open);
    if (open) { var f = $("a", menu); f && setTimeout(function () { f.focus(); }, 300); }
  }
  if (btn && menu) {
    btn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); btn.focus(); } });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    menu.setAttribute("aria-hidden", "true");
  }

  /* Hero flow-field: a quiet field of lines, pushed aside by the cursor */
  var cv = $("canvas[data-flow]");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), w = 0, h = 0, parts = [], mx = -999, my = -999, t = 0, raf = 0, visible = true;
    var spawn = function () { return { x: Math.random() * w, y: Math.random() * h, life: 80 + Math.random() * 220, g: Math.random() < 0.33 }; };
    var size = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(850, (w * h) / 2400));
      parts = []; for (var i = 0; i < n; i++) parts.push(spawn());
    };
    var ang = function (x, y) { return (Math.sin(x * 0.0021 + t * 0.25) + Math.cos(y * 0.0028 - t * 0.2) + Math.sin((x + y) * 0.0013 + t * 0.15)) * 1.4; };
    var step = function () {
      ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,.06)"; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], a = ang(p.x, p.y), vx = Math.cos(a) * 1.1, vy = Math.sin(a) * 1.1;
        var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
        if (d < 20000) { var k = (1 - d / 20000) * 2.6, m = Math.sqrt(d) + 1; vx += (dx / m) * k; vy += (dy / m) * k; }
        ctx.strokeStyle = p.g ? "rgba(95,160,82,.8)" : "rgba(190,196,255,.34)";
        ctx.lineWidth = p.g ? 1.3 : 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); p.x += vx; p.y += vy; ctx.lineTo(p.x, p.y); ctx.stroke();
        if (--p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) { var s = spawn(); p.x = s.x; p.y = s.y; p.life = s.life; }
      }
      t += 0.01;
    };
    var loop = function () { if (visible) step(); raf = requestAnimationFrame(loop); };
    size();
    if (reduce) { for (var i = 0; i < 260; i++) step(); }
    else {
      loop();
      cv.parentNode.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      cv.parentNode.addEventListener("pointerleave", function () { mx = my = -999; });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  }

  /* Statement that lights up word by word as you read */
  $$("[data-lit]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/); el.textContent = "";
    var spans = words.map(function (wd) { var s = document.createElement("span"); s.textContent = wd + " "; el.appendChild(s); return s; });
    var upd = function () {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      var n = reduce ? spans.length : Math.round(p * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle("on", i < n); });
    };
    upd(); window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
  });

  /* Services: hover or focus swaps the illustration */
  var svcs = $$(".svc"), scenes = $$(".scene");
  function showSvc(i) {
    svcs.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
    scenes.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
  }
  if (svcs.length) {
    svcs.forEach(function (s, i) {
      s.addEventListener("mouseenter", function () { showSvc(i); });
      s.addEventListener("focusin", function () { showSvc(i); });
    });
    showSvc(0);
  }

  /* Expanding value panels */
  var panels = $$(".panel");
  function openPanel(p) {
    panels.forEach(function (x) { var on = x === p; x.classList.toggle("is-open", on); x.setAttribute("aria-expanded", on); });
  }
  var hoverOK = window.matchMedia("(hover:hover) and (min-width:821px)");
  panels.forEach(function (p) {
    p.addEventListener("click", function () { openPanel(p); });
    p.addEventListener("focusin", function () { openPanel(p); });
    p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPanel(p); } });
  });
  /* Hover opens a panel by itself. A short intent delay stops the boxes flickering while they slide under the pointer. */
  var wrap = panels.length ? panels[0].parentNode : null, wait = 0;
  if (wrap) {
    wrap.addEventListener("pointermove", function (e) {
      if (!hoverOK.matches || e.pointerType === "touch") return;
      var p = e.target.closest && e.target.closest(".panel");
      clearTimeout(wait);
      if (!p || p.classList.contains("is-open")) return;
      wait = setTimeout(function () { openPanel(p); }, 70);
    });
    wrap.addEventListener("pointerleave", function () { clearTimeout(wait); });
  }
  if (panels.length) openPanel(panels[0]);

  /* Side rail: where am I on the page */
  var secs = $$("[data-rail]");
  if (secs.length > 1) {
    var rail = document.createElement("nav"); rail.className = "rail"; rail.setAttribute("aria-label", "Sections");
    secs.forEach(function (s, i) {
      if (!s.id) s.id = "sec-" + i;
      var a = document.createElement("a"); a.href = "#" + s.id; a.innerHTML = "<span>" + s.getAttribute("data-rail") + "</span><i></i>"; rail.appendChild(a);
    });
    document.body.appendChild(rail);
    var links = $$("a", rail);
    var spy = function () {
      var mid = window.innerHeight * 0.45, cur = -1;
      secs.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) cur = i; });
      links.forEach(function (l, i) { l.classList.toggle("is-on", i === cur); });
      rail.classList.toggle("on-dark", cur > -1 && /sec--night|(^|\s)hero(\s|$)/.test(secs[cur].className));
    };
    spy(); window.addEventListener("scroll", spy, { passive: true });
  }

  /* Contact tabs, driven by the URL hash */
  var tabs = $$('[role="tab"]');
  function pickTab(id) {
    var any = false;
    tabs.forEach(function (t) { var on = t.getAttribute("aria-controls") === id; t.setAttribute("aria-selected", on); if (on) any = true; });
    $$(".form").forEach(function (f) { f.classList.toggle("is-on", f.id === id); });
    return any;
  }
  if (tabs.length) {
    tabs.forEach(function (t) { t.addEventListener("click", function () { history.replaceState(null, "", "#" + t.getAttribute("aria-controls")); pickTab(t.getAttribute("aria-controls")); }); });
    var fromHash = function () { var id = location.hash.slice(1); if (!pickTab(id)) pickTab(tabs[0].getAttribute("aria-controls")); };
    fromHash(); window.addEventListener("hashchange", fromHash);
  }

  /* Forms: validated in the browser. In the build phase these post to Supabase first, then notify staff. */
  $$("form[data-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var name = (f.elements.name && f.elements.name.value || "").split(" ")[0];
      var ok = $(".form-ok", f);
      ok.querySelector("[data-name]").textContent = name || "there";
      ok.classList.add("is-on"); ok.setAttribute("tabindex", "-1"); ok.focus();
      f.reset();
    });
  });


  /* 3D tilt on photos, the receipt and the services stage (pointer devices only) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".photo[data-tilt], .receipt, .stage").forEach(function (el) {
      var base = el.classList.contains("receipt") ? " rotate(1.2deg)" : "";
      var glare = document.createElement("span"); glare.className = "glare"; glare.setAttribute("aria-hidden", "true"); el.appendChild(glare);
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        el.classList.add("tilt-on"); el.classList.remove("tilt-off");
        el.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 9).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 11).toFixed(2) + "deg) translateZ(8px)" + base;
        glare.style.setProperty("--gx", (x * 100) + "%"); glare.style.setProperty("--gy", (y * 100) + "%");
      });
      el.addEventListener("pointerleave", function () { el.classList.remove("tilt-on"); el.classList.add("tilt-off"); el.style.transform = base ? base.trim() : ""; });
    });
  }

  var yr = $("[data-year]"); if (yr) yr.textContent = new Date().getFullYear();
})();
