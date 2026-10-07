/* Eliana Capital v14: the 3D phone.
   Replaces the flat hands mark as the travelling hero object (the .mk element that js/v10.js flies from section to
   section). It is a real three.js model: glossy blue frame, glass screen showing the loan, branded back. Between
   stations it turns a full circle, so it lands facing you. The hands remain the logo in the header and footer.
   If WebGL is not available the hands mark stays exactly as before. */
(function () {
  "use strict";
  var T = window.THREE, mk = document.querySelector(".mk");
  if (!T || !mk) return;
  var rot = mk.querySelector(".mk-rot");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = 720, canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S; canvas.className = "mk-phone"; canvas.setAttribute("aria-hidden", "true");
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
  renderer.setPixelRatio(1); renderer.setSize(S, S, false); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  var scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, .1, 50); cam.position.set(0, 0, 4.5);

  /* ---------- reflections: a small sky of the brand, made in a canvas ---------- */
  (function env() {
    var c = document.createElement("canvas"); c.width = 512; c.height = 256; var g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#c9d6ff"); gr.addColorStop(.38, "#fff0cf"); gr.addColorStop(.5, "#ffe3a3"); gr.addColorStop(.56, "#ffffff"); gr.addColorStop(.7, "#4a5fcf"); gr.addColorStop(1, "#1f5a35");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(90, 40, 70, 110); g.fillRect(330, 60, 120, 40);   /* soft boxes */
    g.fillStyle = "rgba(1,3,149,.55)"; g.fillRect(230, 30, 30, 140);
    var t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping; t.colorSpace = T.SRGBColorSpace;
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture; pm.dispose();
  })();
  scene.add(new T.AmbientLight(0xffffff, .5));
  var key = new T.DirectionalLight(0xffe2a8, 2.6); key.position.set(2.5, 3, 3.5); scene.add(key);
  var rim = new T.DirectionalLight(0x8fa4ff, 1.8); rim.position.set(-3, 1, -2.5); scene.add(rim);

  /* ---------- shapes ---------- */
  function rr(w, h, r) { var s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s; }
  function flat(w, h, r) { var g = new T.ShapeGeometry(rr(w, h, r), 20), p = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5); return g; }

  var phone = new T.Group(); scene.add(phone);
  var body = new T.Mesh(new T.ExtrudeGeometry(rr(1, 2.04, .17), { depth: .09, bevelEnabled: true, bevelThickness: .028, bevelSize: .028, bevelSegments: 8, curveSegments: 28 }),
    new T.MeshPhysicalMaterial({ color: 0x1a22a8, metalness: .9, roughness: .26, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.5 }));
  body.geometry.center(); phone.add(body);
  var FZ = .045 + .028;   /* front face z */

  /* screen texture */
  var SW = 1024, SH = 2088, sc = document.createElement("canvas"); sc.width = SW; sc.height = SH; var g = sc.getContext("2d");
  var logo = new Image(), logoOk = false;
  logo.onload = function () { logoOk = true; drawBack(); drawScreen(0, true); backTex.needsUpdate = true; };
  logo.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIxMCAyMiAxNzIgMTcyIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkVsaWFuYSBDYXBpdGFsLCB3ZSBncm93IHRvZ2V0aGVyIj48ZyBmaWxsPSIjZmZmZmZmIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSw1MS42MTk0LDQwLjc3Nzk1NikiIGQ9Ik0wIDBDMi4zMjYgMi41MjkgNC44NTMgNC44NSA3LjQ5IDcuMDQ5IDMuNDk4IDUuMTc2LS4zODYgMi45MjktNC4xMTUgLjMwMS0yNi4yNzEtMTUuMzE1LTM3LjU2Ny00MC41OTktMzYuMzE3LTY1LjgwOC0zNi4wNjktNjkuMjc5LTM1LjY3Ny03Mi44NTItMzUuMTE0LTc2LjUxNS0zMy44OTItODQuNDgxLTMxLjg2Ni05Mi44NzMtMjguNzc4LTEwMS41NjctMjguMzEzLTEwMi44NzYtMjcuNjE4LTEwMy44NjQtMjYuNDI2LTEwMy43MzMtMjQuOTQ3LTEwMy41NzEtMjQuNDcyLTEwMi4wNjgtMjQuNzExLTEwMC44ODQtMjYuMzg5LTkyLjU1NS0yNi4xOTEtODYuOTk5LTI0LjMyOS04Ni4yNDktMjMuMjUtODUuODE0LTIyLjE3Mi04Ni4yMjMtMjEuMzYzLTkwLjM5Ni0yMC4xNTUtOTYuNjI2LTE4Ljk4NS0xMDUuMDM2LTE2Ljk4Mi0xMTEuNDItMTYuNTYxLTExMi43NjMtMTUuMjMtMTE0LjIwNS0xMy4yNS0xMTMuNTY0LTExLjk0Mi0xMTMuMTQxLTExLjIzMS0xMTEuNDkxLTExLjc4Mi0xMDkuMzgzLTEzLjYwNS0xMDIuMzk3LTE1LjA0Ni05NC45NTctMTQuNDQ5LTg4LjMzOS0xNC4zMDUtODYuNzM4LTEzLjQ2NS04Ni4wNy0xMi41OTEtODYuMDcyLTExLjU4LTg2LjA3NC0xMC44NzUtODYuNjY1LTEwLjAwMy04OS4wNTUtNy4zNjUtOTYuMjgzLTIuODY1LTEwOS43MTYgLjkyNS0xMTMuOTI4IDEuNzUyLTExNC44NDcgMi44MTMtMTE0Ljk1NiAzLjgyMi0xMTQuMzU0IDQuODI4LTExMy43NTQgNS4yMDktMTEyLjE5OCA0LjYxMi0xMTAuNTMzIDIuNjkyLTEwNS4xODEtMi40NzktOTMuMzk1LTQuNDQ2LTgzLjA1Mi00LjYyOC04Mi4wOTUtMy42MTktODAuNjgyLTIuMzktODEuMDg5LS4zNjYtODEuNzU5IDkuMTg3LTk3LjUzMyAxNC4yNTYtMTAyLjk4MSAxNy4zNjYtMTA2LjMyMyAyMC40MzctMTA0LjQ5NCAxOC44NDItMTAwLjkyMiAxNy40NTgtOTcuODIzIDEzLjQzMi05Mi42NjYgMTAuMDU1LTg2LjkwOCA0LjIzMS03Ni45NzktMS4zMTItNjUuNjIgLjA2Ni02Mi41MDUgMi4zMjktNTcuMzg4IDEwLjUyNi01OC45MDYgMTUuNzktNjEuNjE5IDE5Ljg1NS02My43MTQgMjMuNTgzLTY2LjcyNCAyNi40MTEtNjQuMTk1IDI5LjA1Ny02MS44MjkgMjUuNDQzLTU4LjQyOCAyMC4xNTktNTQuOTY2IDE1LjM0OS01MS44MTYgNy44NDktNDguNDkzIC43MjktNDQuNzU1LTcuNTEyLTQwLjQyOS0xMi4zNTktMzEuNDc4LTExLjI0Ni0yMi4yMzctMTEuMjIxLTIyLjAzMy0xMS4xOTUtMjEuODMxLTExLjE2Ni0yMS42MjgtOS45OTctMTMuNDc0LTUuNTc2LTYuMDYzIDAgMCIvPjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDE2My4yMTA5LDYyLjM1OTg2NSkiIGQ9Ik0wIDBDMi4zODktMi4yOTEgNC41NzMtNC43NzIgNi42MzctNy4zNTYgNC45MTQtMy40NzQgMi44MjkgLjMxMiAuMzczIDMuOTU3LTE0LjIyIDI1LjYxMS0zOC4zNDMgMzctNjIuNjQ2IDM2LjMwNi02NS45OTQgMzYuMTM3LTY5LjQ0MyAzNS44MzEtNzIuOTgzIDM1LjM2NC04MC42OCAzNC4zNDctODguODAzIDMyLjU2NS05Ny4yMzkgMjkuNzY3LTk4LjUwOSAyOS4zNDYtOTkuNDc0IDI4LjY5Ni05OS4zNzIgMjcuNTQ2LTk5LjI0NiAyNi4xMTgtOTcuODA4IDI1LjYzLTk2LjY2MyAyNS44MzYtODguNjA3IDI3LjI4NC04My4yNiAyNi45ODEtODIuNTc1IDI1LjE3My04Mi4xNzkgMjQuMTI1LTgyLjU5NCAyMy4wOTQtODYuNjI5IDIyLjQtOTIuNjUzIDIxLjM2My0xMDAuNzc3IDIwLjQwNi0xMDYuOTY2IDE4LjYwNS0xMDguMjY4IDE4LjIyNi0xMDkuNjg0IDE2Ljk3NC0xMDkuMTA2IDE1LjA1NC0xMDguNzI1IDEzLjc4Ni0xMDcuMTUxIDEzLjA2OC0xMDUuMTA5IDEzLjU1Ni05OC4zNDQgMTUuMTcxLTkxLjE0OSAxNi40MDgtODQuNzg4IDE1LjctODMuMjQ5IDE1LjUyOS04Mi42MjIgMTQuNzA2LTgyLjY0MiAxMy44NjQtODIuNjY0IDEyLjg5LTgzLjI0NyAxMi4yMjQtODUuNTY3IDExLjQzMi05Mi41ODEgOS4wMzctMTA1LjYxIDQuOTc1LTEwOS43NDMgMS40MDktMTEwLjY0NCAuNjMxLTExMC43NzEtLjM4OC0xMTAuMjEyLTEuMzczLTEwOS42NTQtMi4zNTMtMTA4LjE2NC0yLjc1MS0xMDYuNTQ4LTIuMjEtMTAxLjM1NC0uNDY5LTg5Ljg5OCA0LjI3My03OS44OTcgNS45NTktNzguOTczIDYuMTE1LTc3LjYzMiA1LjExNS03OC4wNDkgMy45MzktNzguNzM1IDIuMDAzLTk0LjEyLTYuODc5LTk5LjQ2OS0xMS42NTEtMTAyLjc1MS0xNC41NzktMTAxLjA1MS0xNy41NzMtOTcuNTc5LTE2LjEwOS05NC41NjYtMTQuODM5LTg5LjUxOC0xMS4wNjYtODMuOTA0LTcuOTI5LTc0LjIyNS0yLjUyMS02My4xNzIgMi41ODktNjAuMiAxLjE5OS01NS4zMTctMS4wODQtNTYuOTQ1LTguOTQ4LTU5LjY2NC0xMy45NjQtNjEuNzY0LTE3LjgzNi02NC43MzgtMjEuMzY2LTYyLjM2LTI0LjE0LTYwLjEzNC0yNi43MzctNTYuNzg2LTIzLjMyNS01My4zNDUtMTguMzA2LTUwLjIxNC0xMy43MzctNDYuODYyLTYuNTgtNDMuMTE5IC4yMDItMzguNzg2IDguMDUyLTMwLjA2NyAxMi41MzktMjEuMTg5IDExLjI4LTIwLjk5NCAxMS4yNTItMjAuNzk5IDExLjIyMi0yMC42MDUgMTEuMTktMTIuNzc1IDkuOS01LjcyNyA1LjQ5MyAwIDAiLz48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwxMzguMjAwMSwxNzEuNzY5NTMpIiBkPSJNMCAwQy0yLjM5Mi0yLjEyMS00Ljk1MS00LjAzMS03LjYwMS01LjgxNy0zLjcyOC00LjQ2MSAuMDgtMi43NDggMy43ODEtLjY2NyAyNS43NjggMTEuNjk1IDM4LjYxNiAzNC4wMzQgMzkuODQxIDU3LjQ4OSAzOS45NCA2MC43MjYgMzkuOTE1IDY0LjA3MSAzOS43NCA2Ny41MTUgMzkuMzYxIDc1LjAwNSAzOC4yNzkgODIuOTY1IDM2LjI0MiA5MS4zMDYgMzUuOTM2IDkyLjU2MiAzNS4zODYgOTMuNTQyIDM0LjI3IDkzLjUzNCAzMi44ODUgOTMuNTIzIDMyLjMwMyA5Mi4xNzcgMzIuNDEyIDkxLjA1OCAzMy4xNzkgODMuMTg5IDMyLjQ3IDc4LjA2NCAzMC42NzYgNzcuNTQ2IDI5LjYzNiA3Ny4yNDUgMjguNjc2IDc3LjcyNiAyOC4zMjIgODEuNjY1IDI3Ljc5MyA4Ny41NDcgMjcuNTA0IDk1LjQ0MyAyNi4yNTQgMTAxLjU0MiAyNS45OSAxMDIuODI2IDI0Ljg5NSAxMDQuMjg2IDIzLjAwMSAxMDMuODggMjEuNzUxIDEwMy42MTIgMjAuOTM2IDEwMi4xNTIgMjEuMjQ3IDEwMC4xNDkgMjIuMjc0IDkzLjUwOSAyMi45MDQgODYuNDg1IDIxLjcyNyA4MC40MTUgMjEuNDQyIDc4Ljk0NiAyMC42MDEgNzguNDA3IDE5Ljc5MiA3OC40OTEgMTguODU2IDc4LjU4OSAxOC4yNiA3OS4yMDMgMTcuNjc4IDgxLjQ5NyAxNS45MTkgODguNDM4IDEzLjAyMyAxMDEuMyA5LjkxMiAxMDUuNTU3IDkuMjM0IDEwNi40ODYgOC4yNjIgMTA2LjY4NyA3LjI3MSAxMDYuMjI1IDYuMjgzIDEwNS43NjUgNS43ODQgMTA0LjM2MSA2LjE3OSAxMDIuNzYzIDcuNDUgOTcuNjI2IDExLjEyMyA4Ni4yMjYgMTEuOTY3IDc2LjQ2NSAxMi4wNDUgNzUuNTYzIDEwLjk3NyA3NC4zNSA5Ljg3NyA3NC44NDMgOC4wNjcgNzUuNjU1IC43MTQgOTEuMTYtMy40NjQgOTYuNjgzLTYuMDI3IDEwMC4wNzEtOS4wNDMgOTguNjY4LTcuOTA0IDk1LjIxMS02LjkxNSA5Mi4yMTEtMy42NzYgODcuMDU2LTEuMDkzIDgxLjQwNiAzLjM2IDcxLjY2NCA3LjQxNyA2MC42MjQgNS44NDggNTcuODcgMy4yNjkgNTMuMzQ3LTQuMTc2IDU1LjUyNy04Ljc5MyA1OC41MzctMTIuMzU5IDYwLjg2MS0xNS41MjUgNjMuOTk5LTE4LjM4MiA2MS45MjYtMjEuMDU2IDU5Ljk4NS0xOC4wMzEgNTYuNDk1LTEzLjQ2NyA1Mi43OTEtOS4zMTIgNDkuNDItMi42ODIgNDUuNjM1IDMuNTU2IDQxLjUwMiAxMC43NzYgMzYuNzE4IDE0LjQxNyAyNy45NzMgMTIuNTEzIDE5LjUyMyAxMi40NzEgMTkuMzM3IDEyLjQyNyAxOS4xNTIgMTIuMzgxIDE4Ljk2NyAxMC41MjggMTEuNTI4IDUuNzM2IDUuMDg2IDAgMCIvPjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDQwLjQ0Nzk5OSwxNjIuOTE4ODMpIiBkPSJNMCAwQy0yLjQ2NCAxLjU5LTQuNzgxIDMuMzc5LTcuMDEyIDUuMjc4LTQuODU5IDIuMTkzLTIuNDA4LS43NDkgLjM0My0zLjUwNCAxNi42ODQtMTkuODc1IDM5LjU4Mi0yNS43MTMgNjAuNjAxLTIxLjAxMSA2My40ODQtMjAuMyA2Ni40MzItMTkuNDUzIDY5LjQzMS0xOC40NDkgNzUuOTUzLTE2LjI2NyA4Mi43MTctMTMuMzQ5IDg5LjU4MS05LjQ5MyA5MC42MTUtOC45MTIgOTEuMzQ1LTguMTg1IDkxLjA2Mi03LjIwMiA5MC43MTItNS45ODEgODkuMzc5LTUuNzk5IDg4LjQxOC02LjE3MSA4MS42NTctOC43ODkgNzYuOTU1LTkuNDI3IDc2LjA1NS03Ljk3IDc1LjUzMy03LjEyNSA3NS43MjEtNi4xNTkgNzkuMTEzLTQuODc1IDg0LjE3Ny0yLjk1NyA5MS4wODEtLjc1NSA5Ni4xNTkgMS44NTQgOTcuMjI4IDIuNDAzIDk4LjI0NyAzLjczIDk3LjQyMiA1LjMwMyA5Ni44NzYgNi4zNDEgOTUuMzg2IDYuNyA5My42OTMgNS45MzIgODguMDgyIDMuMzg3IDgyLjAzNCAxLjA5OSA3Ni4zODIgLjY0MSA3NS4wMTUgLjUzMSA3NC4zMzEgMS4xNDEgNzQuMjA2IDEuODc2IDc0LjA2MSAyLjcyNyA3NC40NTYgMy40MDUgNzYuMzQgNC40ODQgODIuMDM2IDcuNzUgOTIuNjgyIDEzLjQ3OSA5NS42NzUgMTcuMjc3IDk2LjMyOCAxOC4xMDUgOTYuMjY2IDE5LjAxMyA5NS42MTMgMTkuNzc1IDk0Ljk2MyAyMC41MzMgOTMuNiAyMC42MjggOTIuMjg2IDE5Ljg4NSA4OC4wNjMgMTcuNDk2IDc4LjkgMTEuNDQgNzAuNDg3IDguMjg4IDY5LjcwOSA3Ljk5NyA2OC4zNzUgOC42NCA2OC41MzkgOS43MzMgNjguODA5IDExLjUzMiA4MC42OTEgMjEuODUgODQuNTM4IDI2LjkwMiA4Ni44OTggMzAuMDAxIDg0LjkxNSAzMi4zMTkgODIuMTQzIDMwLjQ2MSA3OS43MzcgMjguODQ4IDc1Ljk4MyAyNC43MTUgNzEuNjMgMjEuMDQxIDY0LjEyNCAxNC43MDYgNTUuMzczIDguMzk5IDUyLjU1NCA5LjEwNyA0Ny45MjQgMTAuMjY5IDQ4LjAxMyAxNy4zODIgNDkuNTMyIDIyLjIwMiA1MC43MDYgMjUuOTI0IDUyLjY5NyAyOS40OTUgNTAuMTYxIDMxLjUwNyA0Ny43ODggMzMuMzkgNDUuNDUxIDI5Ljg1OCA0My4zMDUgMjQuOTEzIDQxLjM1MiAyMC40MTIgMzkuNjQ0IDEzLjYyMyAzNy41MzIgNy4wOTQgMzUuMDg3LS40NjMgMjguMjYxLTUuODM1IDIwLjMyOS02LjIzNyAyMC4xNTQtNi4yNDYgMTkuOTgtNi4yNTMgMTkuODA1LTYuMjU4IDEyLjc3OC02LjQ1NiA1LjkwNy0zLjgxMSAwIDAiLz48L2c+PC9zdmc+";
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  var lastP = -1;
  function drawScreen(p, force) {
    p = Math.round(p * 40) / 40; if (!force && p === lastP) return; lastP = p;
    var F = '"Sofia Pro","Outfit","Segoe UI",system-ui,sans-serif';
    var bg = g.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#0b12b0"); bg.addColorStop(.55, "#02049a"); bg.addColorStop(1, "#00014f");
    g.fillStyle = bg; g.fillRect(0, 0, SW, SH);
    var gl = g.createRadialGradient(900, 1500, 10, 900, 1500, 760); gl.addColorStop(0, "rgba(95,160,82,.55)"); gl.addColorStop(1, "rgba(95,160,82,0)"); g.fillStyle = gl; g.fillRect(0, 0, SW, SH);
    g.fillStyle = "#fff"; g.font = "600 40px " + F; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("9:41", 84, 92);
    g.fillStyle = "#000"; rrect(g, 362, 56, 300, 74, 37); g.fill();
    g.fillStyle = "#fff"; rrect(g, 850, 80, 70, 26, 8); g.fill(); g.fillRect(924, 87, 6, 12);
    if (logoOk) g.drawImage(logo, 72, 190, 96, 96);
    g.fillStyle = "#fff"; g.font = "500 54px " + F; g.fillText("Eliana", 186, 226); g.fillStyle = "#a6dd99"; g.font = "400 34px " + F; g.fillText("we grow together", 186, 270);
    g.fillStyle = "#a6dd99"; g.font = "500 44px " + F; g.fillText("Imaarika working-capital loan", 72, 400);
    g.fillStyle = "#fff"; g.font = "500 188px " + F; g.fillText("KES 15,000", 62, 548);
    g.fillStyle = "rgba(255,255,255,.72)"; g.font = "400 44px " + F; g.fillText("Repay over 30 days, a little each day", 72, 672);
    /* card with the daily ring */
    g.fillStyle = "rgba(255,255,255,.11)"; rrect(g, 56, 750, 912, 560, 56); g.fill();
    var cx = 280, cy = 1030, R = 150;
    g.lineWidth = 34; g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    g.strokeStyle = "#7fd06e"; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (.12 + p * .76) * Math.PI * 2); g.stroke();
    g.textAlign = "center"; g.fillStyle = "#fff"; g.font = "500 68px " + F; g.fillText("KES 500", cx, cy - 12); g.fillStyle = "rgba(255,255,255,.7)"; g.font = "400 36px " + F; g.fillText("paid today", cx, cy + 46);
    g.textAlign = "left";
    var rows = [["Fee", "KES 500"], ["Interest", "27%"], ["Penalties", "Shown first"], ["Hidden charges", "None"]];
    rows.forEach(function (rw, i) { var y = 880 + i * 112; g.fillStyle = "rgba(255,255,255,.65)"; g.font = "400 36px " + F; g.fillText(rw[0], 520, y); g.fillStyle = i === 3 ? "#a6dd99" : "#fff"; g.font = "500 42px " + F; g.fillText(rw[1], 520, y + 50); });
    /* repayments */
    var lines = [["Day 1", "Paid by mobile money"], ["Day 2", "Paid by mobile money"], ["Day 3", "Due tonight"]];
    lines.forEach(function (ln, i) {
      var y = 1400 + i * 124, done = i < 2;
      g.fillStyle = "rgba(255,255,255,.09)"; rrect(g, 56, y - 48, 912, 100, 36); g.fill();
      g.fillStyle = done ? "#7fd06e" : "rgba(255,255,255,.25)"; g.beginPath(); g.arc(122, y + 2, 30, 0, 7); g.fill();
      if (done) { g.strokeStyle = "#00014f"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(108, y + 3); g.lineTo(120, y + 16); g.lineTo(140, y - 12); g.stroke(); }
      g.fillStyle = "#fff"; g.font = "500 42px " + F; g.fillText(ln[0], 182, y - 8); g.fillStyle = "rgba(255,255,255,.65)"; g.font = "400 32px " + F; g.fillText(ln[1], 182, y + 30);
      g.textAlign = "right"; g.fillStyle = "#fff"; g.font = "500 42px " + F; g.fillText("KES 500", 930, y + 2); g.textAlign = "left";
    });
    g.fillStyle = "#5fa052"; rrect(g, 56, 1810, 912, 150, 75); g.fill();
    g.fillStyle = "#00014f"; g.font = "600 56px " + F; g.textAlign = "center"; g.fillText("Apply now", 512, 1886); g.textAlign = "left";
    g.fillStyle = "rgba(255,255,255,.85)"; rrect(g, 352, 2020, 320, 12, 6); g.fill();
    screenTex.needsUpdate = true;
  }
  var screenTex = new T.CanvasTexture(sc); screenTex.colorSpace = T.SRGBColorSpace; screenTex.anisotropy = 8;
  var screen = new T.Mesh(flat(.93, 1.97, .125), new T.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.z = FZ + .002; phone.add(screen);
  var glass = new T.Mesh(flat(.93, 1.97, .125), new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .07, roughness: .04, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.4 }));
  glass.position.z = FZ + .004; phone.add(glass);

  /* back panel */
  var bc = document.createElement("canvas"); bc.width = 1024; bc.height = 2088; var bg2 = bc.getContext("2d");
  function drawBack() {
    var gr = bg2.createLinearGradient(0, 0, 1024, 2088); gr.addColorStop(0, "#0a12b8"); gr.addColorStop(.55, "#1b4aa8"); gr.addColorStop(1, "#2f7a45");
    bg2.fillStyle = gr; bg2.fillRect(0, 0, 1024, 2088);
    var rg = bg2.createRadialGradient(512, 1000, 20, 512, 1000, 620); rg.addColorStop(0, "rgba(255,255,255,.22)"); rg.addColorStop(1, "rgba(255,255,255,0)"); bg2.fillStyle = rg; bg2.fillRect(0, 0, 1024, 2088);
    if (logoOk) { bg2.globalAlpha = .96; bg2.drawImage(logo, 232, 740, 560, 560); bg2.globalAlpha = 1; }
    bg2.fillStyle = "rgba(255,255,255,.9)"; bg2.font = '500 64px "Sofia Pro","Outfit","Segoe UI",sans-serif'; bg2.textAlign = "center"; bg2.fillText("Eliana Capital", 512, 1480);
    bg2.fillStyle = "#a6dd99"; bg2.font = '400 40px "Sofia Pro","Outfit","Segoe UI",sans-serif'; bg2.fillText("we grow together", 512, 1546);
  }
  drawBack();
  var backTex = new T.CanvasTexture(bc); backTex.colorSpace = T.SRGBColorSpace; backTex.anisotropy = 8;
  var back = new T.Mesh(flat(.95, 2.0, .14), new T.MeshPhysicalMaterial({ map: backTex, roughness: .22, metalness: .1, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.2 }));
  back.rotation.y = Math.PI; back.position.z = -FZ - .002; phone.add(back);
  /* camera bump (seen from the back, top left) */
  var bump = new T.Mesh(new T.ExtrudeGeometry(rr(.42, .42, .1), { depth: .018, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 3 }), new T.MeshPhysicalMaterial({ color: 0x0b0f5e, metalness: .8, roughness: .3, clearcoat: 1 }));
  bump.position.set(.24, .78, -FZ - .022); bump.rotation.y = Math.PI; phone.add(bump);
  [[.1, .1], [.1, -.1], [-.1, 0]].forEach(function (p) {
    var l = new T.Mesh(new T.CylinderGeometry(.075, .075, .02, 28), new T.MeshPhysicalMaterial({ color: 0x03030f, metalness: .6, roughness: .08, clearcoat: 1 }));
    l.rotation.x = Math.PI / 2; l.position.set(.24 + p[0], .78 + p[1] * .98, -FZ - .045); phone.add(l);
  });
  /* side buttons */
  var bm = new T.MeshPhysicalMaterial({ color: 0x2a33c4, metalness: .95, roughness: .22, clearcoat: 1 });
  [[.512, .35, .3], [-.512, .5, .16], [-.512, .26, .16]].forEach(function (b) { var m = new T.Mesh(new T.BoxGeometry(.03, b[2], .05), bm); m.position.set(b[0], b[1], 0); phone.add(m); });

  phone.scale.setScalar(1.0);
  drawScreen(0, true);

  /* ---------- drive it from the travelling mark ---------- */
  mk.classList.add("has-3d"); mk.appendChild(canvas);
  var t0 = performance.now() + 700, ang = 0, rect = null, px = -9999, py = -9999, lx = 0, ly = 0;
  window.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
  var re = /rotate\((-?[\d.]+)deg\)/;
  function ease(t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); }
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    var T0 = (now - t0) / 1000, m = rot && re.exec(rot.style.transform || "");
    if (m) ang = parseFloat(m[1]);
    var yaw = reduce ? Math.round(ang / 90) * Math.PI * 2 : (ang / 90) * Math.PI * 2;
    var intro = reduce ? 1 : ease(T0 / 1.7);
    var spinIn = (1 - intro) * Math.PI * 3.2, drop = (1 - intro) * 1.9;
    /* pointer: tilt toward it when it is near */
    var tx = 0, ty = 0;
    if (!reduce && px > -9000) {
      rect = mk.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2, sz = Math.max(60, rect.width);
      var dx = (px - cx) / sz, dy = (py - cy) / sz, near = Math.max(0, 1 - Math.hypot(dx, dy) / 1.5);
      tx = dx * near * .55; ty = dy * near * .35;
    }
    lx += (tx - lx) * .08; ly += (ty - ly) * .08;
    var bob = reduce ? 0 : Math.sin(now / 1000 * 1.3) * .035;
    phone.rotation.set(.1 + ly + (reduce ? 0 : Math.sin(now / 1900) * .035), -.32 + yaw + lx + spinIn, -.1 + (reduce ? 0 : Math.sin(now / 2300) * .02));
    phone.position.y = bob + drop; phone.position.x = (1 - intro) * -.4;
    phone.visible = T0 > -.05;
    /* the ring on the screen fills as it travels and spins */
    drawScreen(reduce ? .5 : (.5 + .5 * Math.sin(ang / 90 * 2.2 + T0 * .4)), false);
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
})();
