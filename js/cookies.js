/* Eliana Capital cookie choice.
   Three buttons: Accept all, Reject all, Accept only necessary.
   The site itself only needs strictly necessary storage. The choice is remembered for 12 months in a first-party cookie
   (with localStorage as a back-up). Anything optional you add later (analytics, maps, embeds) should wait for consent:

     window.elianaConsent.get()            -> {necessary:true, analytics:bool, marketing:bool, choice:"all"|"rejected"|"necessary"} or null
     document.addEventListener("eliana:consent", e => { if (e.detail.analytics) { load your analytics here } })

   A "Cookie settings" link anywhere on a page (any element with data-cookie-settings) re-opens the banner. */
(function () {
  "use strict";
  var KEY = "eliana_cookie_consent", DAYS = 365, VERSION = 1;

  function readCookie() {
    var m = document.cookie.match(new RegExp("(?:^|; )" + KEY + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function read() {
    var raw = readCookie();
    if (!raw) { try { raw = localStorage.getItem(KEY); } catch (e) {} }
    if (!raw) return null;
    try { var v = JSON.parse(raw); return v && v.v === VERSION ? v : null; } catch (e) { return null; }
  }
  function write(v) {
    var raw = JSON.stringify(v);
    document.cookie = KEY + "=" + encodeURIComponent(raw) + "; max-age=" + DAYS * 86400 + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    try { localStorage.setItem(KEY, raw); } catch (e) {}
  }
  function state(choice) {
    return { v: VERSION, choice: choice, necessary: true, analytics: choice === "all", marketing: choice === "all", ts: new Date().toISOString() };
  }
  function announce(v) { try { document.dispatchEvent(new CustomEvent("eliana:consent", { detail: v })); } catch (e) {} }

  window.elianaConsent = { get: read, open: function () { show(true); } };

  var box, lastFocus;
  function build() {
    box = document.createElement("div");
    box.className = "ck";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "false");
    box.setAttribute("aria-labelledby", "ck-title");
    box.setAttribute("aria-describedby", "ck-text");
    box.innerHTML =
      '<div class="ck-in">' +
        '<div class="ck-copy">' +
          '<h2 id="ck-title">Cookies on this site</h2>' +
          '<p id="ck-text">We use necessary cookies to keep the site working and to remember this choice. With your permission we may also use optional cookies to understand how the site is used and to improve it. You decide, and you can change your mind at any time. See our <a href="privacy.html#cookies">privacy notice</a>.</p>' +
        '</div>' +
        '<div class="ck-btns">' +
          '<button type="button" class="ck-btn ck-btn--primary" data-ck="all">Accept all</button>' +
          '<button type="button" class="ck-btn" data-ck="necessary">Accept only necessary</button>' +
          '<button type="button" class="ck-btn ck-btn--ghost" data-ck="rejected">Reject all</button>' +
        '</div>' +
      '</div>';
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ck]"); if (!b) return;
      var v = state(b.getAttribute("data-ck")); write(v); hide(); announce(v);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box && box.classList.contains("is-on")) { hide(); }
    });
    document.body.appendChild(box);
  }
  function show(focus) {
    if (!box) build();
    lastFocus = document.activeElement;
    requestAnimationFrame(function () { box.classList.add("is-on"); });
    if (focus) { var f = box.querySelector("[data-ck]"); if (f) setTimeout(function () { f.focus(); }, 60); }
  }
  function hide() {
    if (!box) return;
    box.classList.remove("is-on");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function init() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cookie-settings]"); if (!t) return;
      e.preventDefault(); show(true);
    });
    var saved = read();
    if (saved) { announce(saved); return; }
    setTimeout(function () { show(false); }, 900);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
