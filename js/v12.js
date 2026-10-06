/* Eliana Capital v12: gooey buttons.
   Every .btn gets four "blob" drops (css/v12.css) for the gooey hover fill. A hidden SVG goo filter is added once.
   Plain JavaScript. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- gooey buttons ---------- */
  if (!document.getElementById("goo")) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "goo-defs"); svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>' +
      '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="g"/>' +
      '<feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></defs>';
    document.body.appendChild(svg);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".btn"), function (b) {
    if (b.querySelector(".btn-blob")) return;
    var w = document.createElement("span");
    w.className = "btn-blob"; w.setAttribute("aria-hidden", "true");
    w.innerHTML = "<span><i></i><i></i><i></i><i></i></span>";
    b.insertBefore(w, b.firstChild);
  });

})();
