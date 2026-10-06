/* Eliana Capital v9: stacking service cards.
   The cards are position:sticky in CSS. This adds the Naturals-style depth cue: as the next card slides over,
   the one beneath settles back a little (smaller and slightly dimmer). Off on phones and for reduced motion. */
(function () {
  "use strict";
  var cards = Array.prototype.slice.call(document.querySelectorAll(".stack-card"));
  if (cards.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var wide = window.matchMedia("(min-width:861px)");
  var ticking = false;

  function hdr() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr")) || 96; }

  function update() {
    ticking = false;
    var base = hdr();
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (!next || !wide.matches) { card.style.transform = ""; card.style.filter = ""; return; }
      var stickTop = base + i * 16, h = card.offsetHeight;
      var d = next.getBoundingClientRect().top - stickTop;          /* gap between this card's pinned edge and the next card */
      var k = Math.min(1, Math.max(0, 1 - d / h));                   /* 0 = next card far away, 1 = fully covering */
      card.style.transform = k > 0.002 ? "scale(" + (1 - k * 0.05).toFixed(4) + ")" : "";
      card.style.filter = k > 0.002 ? "brightness(" + (1 - k * 0.05).toFixed(3) + ")" : "";
    });
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  if (wide.addEventListener) wide.addEventListener("change", queue);
  update();
})();
