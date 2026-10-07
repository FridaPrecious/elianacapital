/* Eliana Capital v15: the phone that pops out of the photo.
   One full-window three.js canvas. The camera is set so one world unit equals one screen pixel, which lets the phone sit
   exactly on top of any element marked data-phone (an invisible "anchor" box in the layout) and fly between them as you scroll.
   - On load it springs out of the hero photo: rises, grows, spins and settles (like a drei <Float> with a spring).
   - Between anchors it turns a full circle; the screen content swaps while the back faces you, so you never see the cut.
   - It leans with the scroll speed and tilts toward the pointer. A soft contact shadow is drawn on the page behind it.
   - The screens use your real customer photos (js/imgdata.js holds them as data so WebGL can read them from a plain folder).
   Plain JavaScript. If WebGL is missing the page simply has no phone. Reduced motion: no spring, no flight, no bob. */
(function () {
  "use strict";
  var T = window.THREE, anchors = Array.prototype.slice.call(document.querySelectorAll("[data-phone]"));
  if (!T || !anchors.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var canvas = document.createElement("canvas"); canvas.className = "h-phone"; canvas.setAttribute("aria-hidden", "true");
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
  document.body.appendChild(canvas);
  var DPR = Math.min(1.5, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;

  var scene = new T.Scene(), FOV = 24, cam = new T.PerspectiveCamera(FOV, 1, 10, 20000), vw = 0, vh = 0, dh = 0;
  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    dh = Math.min(vh, Math.max(640, vw * .625));   /* design height: keeps desktop proportions on tall, scaled-down phone screens */
    renderer.setSize(vw, vh, false);
    cam.aspect = vw / vh; cam.position.set(0, 0, (vh / 2) / Math.tan(FOV * Math.PI / 360)); cam.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  /* ---------- light: a small sky of the brand, made in a canvas, for the reflections ---------- */
  (function () {
    var c = document.createElement("canvas"); c.width = 512; c.height = 256; var g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#cfdcff"); gr.addColorStop(.36, "#fff3d6"); gr.addColorStop(.5, "#ffd98f"); gr.addColorStop(.56, "#ffffff"); gr.addColorStop(.72, "#3f56c8"); gr.addColorStop(1, "#1d5a35");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "rgba(255,255,255,.96)"; g.fillRect(80, 36, 80, 120); g.fillRect(330, 56, 130, 44);
    g.fillStyle = "rgba(1,3,149,.5)"; g.fillRect(236, 26, 30, 140);
    var t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping; t.colorSpace = T.SRGBColorSpace;
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture; pm.dispose();
  })();
  scene.add(new T.AmbientLight(0xffffff, .55));
  var key = new T.DirectionalLight(0xffe4b0, 2.7); key.position.set(.6, .9, 1); scene.add(key);
  var rim = new T.DirectionalLight(0x93a8ff, 1.9); rim.position.set(-1, .3, -.8); scene.add(rim);

  /* ---------- the model, built at height 2.1 and scaled to the anchor's pixel height ---------- */
  function rr(w, h, r) { var s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s; }
  function flat(w, h, r) { var g = new T.ShapeGeometry(rr(w, h, r), 22), p = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5); return g; }
  var HEIGHT = 2.04 + .056;
  var phone = new T.Group(); scene.add(phone);
  var body = new T.Mesh(new T.ExtrudeGeometry(rr(1, 2.04, .17), { depth: .09, bevelEnabled: true, bevelThickness: .028, bevelSize: .028, bevelSegments: 8, curveSegments: 30 }),
    new T.MeshPhysicalMaterial({ color: 0x070b5c, metalness: .92, roughness: .34, clearcoat: 1, clearcoatRoughness: .18, envMapIntensity: 1.25 }));
  body.geometry.center(); phone.add(body);
  var FZ = .045 + .028;
  var bezel = new T.Mesh(flat(.955, 1.99, .14), new T.MeshBasicMaterial({ color: 0x02030c })); bezel.position.z = FZ + .001; phone.add(bezel);
  var screenMat = new T.MeshBasicMaterial({ toneMapped: false });
  var screen = new T.Mesh(flat(.93, 1.965, .125), screenMat); screen.position.z = FZ + .003; phone.add(screen);
  var glass = new T.Mesh(flat(.93, 1.965, .125), new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .06, roughness: .04, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.6, depthWrite: false }));
  glass.position.z = FZ + .005; phone.add(glass);

  var SW = 1024, SH = 2088, F = '"Sofia Pro","Outfit","Segoe UI",system-ui,sans-serif';
  function mk() { var c = document.createElement("canvas"); c.width = SW; c.height = SH; return c; }
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function cover(g, img, x, y, w, h, r) {
    if (!img || !img.complete || !img.naturalWidth) { g.fillStyle = "#1c2a8a"; rrect(g, x, y, w, h, r); g.fill(); return; }
    g.save(); rrect(g, x, y, w, h, r); g.clip();
    var s = Math.max(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * s, ih = img.naturalHeight * s;
    g.drawImage(img, x + (w - iw) * .5, y + (h - ih) * .38, iw, ih); g.restore();
  }
  function frameBg(g) {
    var bg = g.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#0b12b0"); bg.addColorStop(.55, "#02049a"); bg.addColorStop(1, "#00014f"); g.fillStyle = bg; g.fillRect(0, 0, SW, SH);
    var gl = g.createRadialGradient(900, 1650, 10, 900, 1650, 760); gl.addColorStop(0, "rgba(95,160,82,.5)"); gl.addColorStop(1, "rgba(95,160,82,0)"); g.fillStyle = gl; g.fillRect(0, 0, SW, SH);
    g.textBaseline = "middle"; g.textAlign = "left";
    g.fillStyle = "#000"; rrect(g, 362, 56, 300, 74, 37); g.fill();
    g.fillStyle = "rgba(255,255,255,.85)"; rrect(g, 352, 2024, 320, 12, 6); g.fill();
  }
  var img = {}, logo = new Image();
  function load(k) { var d = window.ELIANA_IMGS && window.ELIANA_IMGS[k]; if (!d) return; var i = new Image(); i.onload = redraw; i.src = d[0]; img[k] = i; }
  load("tailor.jpg"); load("shop.jpg"); load("farmers.jpg");
  logo.onload = redraw;
  logo.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIxMCAyMiAxNzIgMTcyIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkVsaWFuYSBDYXBpdGFsLCB3ZSBncm93IHRvZ2V0aGVyIj48ZyBmaWxsPSIjZmZmZmZmIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSw1MS42MTk0LDQwLjc3Nzk1NikiIGQ9Ik0wIDBDMi4zMjYgMi41MjkgNC44NTMgNC44NSA3LjQ5IDcuMDQ5IDMuNDk4IDUuMTc2LS4zODYgMi45MjktNC4xMTUgLjMwMS0yNi4yNzEtMTUuMzE1LTM3LjU2Ny00MC41OTktMzYuMzE3LTY1LjgwOC0zNi4wNjktNjkuMjc5LTM1LjY3Ny03Mi44NTItMzUuMTE0LTc2LjUxNS0zMy44OTItODQuNDgxLTMxLjg2Ni05Mi44NzMtMjguNzc4LTEwMS41NjctMjguMzEzLTEwMi44NzYtMjcuNjE4LTEwMy44NjQtMjYuNDI2LTEwMy43MzMtMjQuOTQ3LTEwMy41NzEtMjQuNDcyLTEwMi4wNjgtMjQuNzExLTEwMC44ODQtMjYuMzg5LTkyLjU1NS0yNi4xOTEtODYuOTk5LTI0LjMyOS04Ni4yNDktMjMuMjUtODUuODE0LTIyLjE3Mi04Ni4yMjMtMjEuMzYzLTkwLjM5Ni0yMC4xNTUtOTYuNjI2LTE4Ljk4NS0xMDUuMDM2LTE2Ljk4Mi0xMTEuNDItMTYuNTYxLTExMi43NjMtMTUuMjMtMTE0LjIwNS0xMy4yNS0xMTMuNTY0LTExLjk0Mi0xMTMuMTQxLTExLjIzMS0xMTEuNDkxLTExLjc4Mi0xMDkuMzgzLTEzLjYwNS0xMDIuMzk3LTE1LjA0Ni05NC45NTctMTQuNDQ5LTg4LjMzOS0xNC4zMDUtODYuNzM4LTEzLjQ2NS04Ni4wNy0xMi41OTEtODYuMDcyLTExLjU4LTg2LjA3NC0xMC44NzUtODYuNjY1LTEwLjAwMy04OS4wNTUtNy4zNjUtOTYuMjgzLTIuODY1LTEwOS43MTYgLjkyNS0xMTMuOTI4IDEuNzUyLTExNC44NDcgMi44MTMtMTE0Ljk1NiAzLjgyMi0xMTQuMzU0IDQuODI4LTExMy43NTQgNS4yMDktMTEyLjE5OCA0LjYxMi0xMTAuNTMzIDIuNjkyLTEwNS4xODEtMi40NzktOTMuMzk1LTQuNDQ2LTgzLjA1Mi00LjYyOC04Mi4wOTUtMy42MTktODAuNjgyLTIuMzktODEuMDg5LS4zNjYtODEuNzU5IDkuMTg3LTk3LjUzMyAxNC4yNTYtMTAyLjk4MSAxNy4zNjYtMTA2LjMyMyAyMC40MzctMTA0LjQ5NCAxOC44NDItMTAwLjkyMiAxNy40NTgtOTcuODIzIDEzLjQzMi05Mi42NjYgMTAuMDU1LTg2LjkwOCA0LjIzMS03Ni45NzktMS4zMTItNjUuNjIgLjA2Ni02Mi41MDUgMi4zMjktNTcuMzg4IDEwLjUyNi01OC45MDYgMTUuNzktNjEuNjE5IDE5Ljg1NS02My43MTQgMjMuNTgzLTY2LjcyNCAyNi40MTEtNjQuMTk1IDI5LjA1Ny02MS44MjkgMjUuNDQzLTU4LjQyOCAyMC4xNTktNTQuOTY2IDE1LjM0OS01MS44MTYgNy44NDktNDguNDkzIC43MjktNDQuNzU1LTcuNTEyLTQwLjQyOS0xMi4zNTktMzEuNDc4LTExLjI0Ni0yMi4yMzctMTEuMjIxLTIyLjAzMy0xMS4xOTUtMjEuODMxLTExLjE2Ni0yMS42MjgtOS45OTctMTMuNDc0LTUuNTc2LTYuMDYzIDAgMCIvPjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDE2My4yMTA5LDYyLjM1OTg2NSkiIGQ9Ik0wIDBDMi4zODktMi4yOTEgNC41NzMtNC43NzIgNi42MzctNy4zNTYgNC45MTQtMy40NzQgMi44MjkgLjMxMiAuMzczIDMuOTU3LTE0LjIyIDI1LjYxMS0zOC4zNDMgMzctNjIuNjQ2IDM2LjMwNi02NS45OTQgMzYuMTM3LTY5LjQ0MyAzNS44MzEtNzIuOTgzIDM1LjM2NC04MC42OCAzNC4zNDctODguODAzIDMyLjU2NS05Ny4yMzkgMjkuNzY3LTk4LjUwOSAyOS4zNDYtOTkuNDc0IDI4LjY5Ni05OS4zNzIgMjcuNTQ2LTk5LjI0NiAyNi4xMTgtOTcuODA4IDI1LjYzLTk2LjY2MyAyNS44MzYtODguNjA3IDI3LjI4NC04My4yNiAyNi45ODEtODIuNTc1IDI1LjE3My04Mi4xNzkgMjQuMTI1LTgyLjU5NCAyMy4wOTQtODYuNjI5IDIyLjQtOTIuNjUzIDIxLjM2My0xMDAuNzc3IDIwLjQwNi0xMDYuOTY2IDE4LjYwNS0xMDguMjY4IDE4LjIyNi0xMDkuNjg0IDE2Ljk3NC0xMDkuMTA2IDE1LjA1NC0xMDguNzI1IDEzLjc4Ni0xMDcuMTUxIDEzLjA2OC0xMDUuMTA5IDEzLjU1Ni05OC4zNDQgMTUuMTcxLTkxLjE0OSAxNi40MDgtODQuNzg4IDE1LjctODMuMjQ5IDE1LjUyOS04Mi42MjIgMTQuNzA2LTgyLjY0MiAxMy44NjQtODIuNjY0IDEyLjg5LTgzLjI0NyAxMi4yMjQtODUuNTY3IDExLjQzMi05Mi41ODEgOS4wMzctMTA1LjYxIDQuOTc1LTEwOS43NDMgMS40MDktMTEwLjY0NCAuNjMxLTExMC43NzEtLjM4OC0xMTAuMjEyLTEuMzczLTEwOS42NTQtMi4zNTMtMTA4LjE2NC0yLjc1MS0xMDYuNTQ4LTIuMjEtMTAxLjM1NC0uNDY5LTg5Ljg5OCA0LjI3My03OS44OTcgNS45NTktNzguOTczIDYuMTE1LTc3LjYzMiA1LjExNS03OC4wNDkgMy45MzktNzguNzM1IDIuMDAzLTk0LjEyLTYuODc5LTk5LjQ2OS0xMS42NTEtMTAyLjc1MS0xNC41NzktMTAxLjA1MS0xNy41NzMtOTcuNTc5LTE2LjEwOS05NC41NjYtMTQuODM5LTg5LjUxOC0xMS4wNjYtODMuOTA0LTcuOTI5LTc0LjIyNS0yLjUyMS02My4xNzIgMi41ODktNjAuMiAxLjE5OS01NS4zMTctMS4wODQtNTYuOTQ1LTguOTQ4LTU5LjY2NC0xMy45NjQtNjEuNzY0LTE3LjgzNi02NC43MzgtMjEuMzY2LTYyLjM2LTI0LjE0LTYwLjEzNC0yNi43MzctNTYuNzg2LTIzLjMyNS01My4zNDUtMTguMzA2LTUwLjIxNC0xMy43MzctNDYuODYyLTYuNTgtNDMuMTE5IC4yMDItMzguNzg2IDguMDUyLTMwLjA2NyAxMi41MzktMjEuMTg5IDExLjI4LTIwLjk5NCAxMS4yNTItMjAuNzk5IDExLjIyMi0yMC42MDUgMTEuMTktMTIuNzc1IDkuOS01LjcyNyA1LjQ5MyAwIDAiLz48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwxMzguMjAwMSwxNzEuNzY5NTMpIiBkPSJNMCAwQy0yLjM5Mi0yLjEyMS00Ljk1MS00LjAzMS03LjYwMS01LjgxNy0zLjcyOC00LjQ2MSAuMDgtMi43NDggMy43ODEtLjY2NyAyNS43NjggMTEuNjk1IDM4LjYxNiAzNC4wMzQgMzkuODQxIDU3LjQ4OSAzOS45NCA2MC43MjYgMzkuOTE1IDY0LjA3MSAzOS43NCA2Ny41MTUgMzkuMzYxIDc1LjAwNSAzOC4yNzkgODIuOTY1IDM2LjI0MiA5MS4zMDYgMzUuOTM2IDkyLjU2MiAzNS4zODYgOTMuNTQyIDM0LjI3IDkzLjUzNCAzMi44ODUgOTMuNTIzIDMyLjMwMyA5Mi4xNzcgMzIuNDEyIDkxLjA1OCAzMy4xNzkgODMuMTg5IDMyLjQ3IDc4LjA2NCAzMC42NzYgNzcuNTQ2IDI5LjYzNiA3Ny4yNDUgMjguNjc2IDc3LjcyNiAyOC4zMjIgODEuNjY1IDI3Ljc5MyA4Ny41NDcgMjcuNTA0IDk1LjQ0MyAyNi4yNTQgMTAxLjU0MiAyNS45OSAxMDIuODI2IDI0Ljg5NSAxMDQuMjg2IDIzLjAwMSAxMDMuODggMjEuNzUxIDEwMy42MTIgMjAuOTM2IDEwMi4xNTIgMjEuMjQ3IDEwMC4xNDkgMjIuMjc0IDkzLjUwOSAyMi45MDQgODYuNDg1IDIxLjcyNyA4MC40MTUgMjEuNDQyIDc4Ljk0NiAyMC42MDEgNzguNDA3IDE5Ljc5MiA3OC40OTEgMTguODU2IDc4LjU4OSAxOC4yNiA3OS4yMDMgMTcuNjc4IDgxLjQ5NyAxNS45MTkgODguNDM4IDEzLjAyMyAxMDEuMyA5LjkxMiAxMDUuNTU3IDkuMjM0IDEwNi40ODYgOC4yNjIgMTA2LjY4NyA3LjI3MSAxMDYuMjI1IDYuMjgzIDEwNS43NjUgNS43ODQgMTA0LjM2MSA2LjE3OSAxMDIuNzYzIDcuNDUgOTcuNjI2IDExLjEyMyA4Ni4yMjYgMTEuOTY3IDc2LjQ2NSAxMi4wNDUgNzUuNTYzIDEwLjk3NyA3NC4zNSA5Ljg3NyA3NC44NDMgOC4wNjcgNzUuNjU1IC43MTQgOTEuMTYtMy40NjQgOTYuNjgzLTYuMDI3IDEwMC4wNzEtOS4wNDMgOTguNjY4LTcuOTA0IDk1LjIxMS02LjkxNSA5Mi4yMTEtMy42NzYgODcuMDU2LTEuMDkzIDgxLjQwNiAzLjM2IDcxLjY2NCA3LjQxNyA2MC42MjQgNS44NDggNTcuODcgMy4yNjkgNTMuMzQ3LTQuMTc2IDU1LjUyNy04Ljc5MyA1OC41MzctMTIuMzU5IDYwLjg2MS0xNS41MjUgNjMuOTk5LTE4LjM4MiA2MS45MjYtMjEuMDU2IDU5Ljk4NS0xOC4wMzEgNTYuNDk1LTEzLjQ2NyA1Mi43OTEtOS4zMTIgNDkuNDItMi42ODIgNDUuNjM1IDMuNTU2IDQxLjUwMiAxMC43NzYgMzYuNzE4IDE0LjQxNyAyNy45NzMgMTIuNTEzIDE5LjUyMyAxMi40NzEgMTkuMzM3IDEyLjQyNyAxOS4xNTIgMTIuMzgxIDE4Ljk2NyAxMC41MjggMTEuNTI4IDUuNzM2IDUuMDg2IDAgMCIvPjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDQwLjQ0Nzk5OSwxNjIuOTE4ODMpIiBkPSJNMCAwQy0yLjQ2NCAxLjU5LTQuNzgxIDMuMzc5LTcuMDEyIDUuMjc4LTQuODU5IDIuMTkzLTIuNDA4LS43NDkgLjM0My0zLjUwNCAxNi42ODQtMTkuODc1IDM5LjU4Mi0yNS43MTMgNjAuNjAxLTIxLjAxMSA2My40ODQtMjAuMyA2Ni40MzItMTkuNDUzIDY5LjQzMS0xOC40NDkgNzUuOTUzLTE2LjI2NyA4Mi43MTctMTMuMzQ5IDg5LjU4MS05LjQ5MyA5MC42MTUtOC45MTIgOTEuMzQ1LTguMTg1IDkxLjA2Mi03LjIwMiA5MC43MTItNS45ODEgODkuMzc5LTUuNzk5IDg4LjQxOC02LjE3MSA4MS42NTctOC43ODkgNzYuOTU1LTkuNDI3IDc2LjA1NS03Ljk3IDc1LjUzMy03LjEyNSA3NS43MjEtNi4xNTkgNzkuMTEzLTQuODc1IDg0LjE3Ny0yLjk1NyA5MS4wODEtLjc1NSA5Ni4xNTkgMS44NTQgOTcuMjI4IDIuNDAzIDk4LjI0NyAzLjczIDk3LjQyMiA1LjMwMyA5Ni44NzYgNi4zNDEgOTUuMzg2IDYuNyA5My42OTMgNS45MzIgODguMDgyIDMuMzg3IDgyLjAzNCAxLjA5OSA3Ni4zODIgLjY0MSA3NS4wMTUgLjUzMSA3NC4zMzEgMS4xNDEgNzQuMjA2IDEuODc2IDc0LjA2MSAyLjcyNyA3NC40NTYgMy40MDUgNzYuMzQgNC40ODQgODIuMDM2IDcuNzUgOTIuNjgyIDEzLjQ3OSA5NS42NzUgMTcuMjc3IDk2LjMyOCAxOC4xMDUgOTYuMjY2IDE5LjAxMyA5NS42MTMgMTkuNzc1IDk0Ljk2MyAyMC41MzMgOTMuNiAyMC42MjggOTIuMjg2IDE5Ljg4NSA4OC4wNjMgMTcuNDk2IDc4LjkgMTEuNDQgNzAuNDg3IDguMjg4IDY5LjcwOSA3Ljk5NyA2OC4zNzUgOC42NCA2OC41MzkgOS43MzMgNjguODA5IDExLjUzMiA4MC42OTEgMjEuODUgODQuNTM4IDI2LjkwMiA4Ni44OTggMzAuMDAxIDg0LjkxNSAzMi4zMTkgODIuMTQzIDMwLjQ2MSA3OS43MzcgMjguODQ4IDc1Ljk4MyAyNC43MTUgNzEuNjMgMjEuMDQxIDY0LjEyNCAxNC43MDYgNTUuMzczIDguMzk5IDUyLjU1NCA5LjEwNyA0Ny45MjQgMTAuMjY5IDQ4LjAxMyAxNy4zODIgNDkuNTMyIDIyLjIwMiA1MC43MDYgMjUuOTI0IDUyLjY5NyAyOS40OTUgNTAuMTYxIDMxLjUwNyA0Ny43ODggMzMuMzkgNDUuNDUxIDI5Ljg1OCA0My4zMDUgMjQuOTEzIDQxLjM1MiAyMC40MTIgMzkuNjQ0IDEzLjYyMyAzNy41MzIgNy4wOTQgMzUuMDg3LS40NjMgMjguMjYxLTUuODM1IDIwLjMyOS02LjIzNyAyMC4xNTQtNi4yNDYgMTkuOTgtNi4yNTMgMTkuODA1LTYuMjU4IDEyLjc3OC02LjQ1NiA1LjkwNy0zLjgxMSAwIDAiLz48L2c+PC9zdmc+";

  var cvs = [mk(), mk(), mk()], tex = cvs.map(function (c) { var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; });
  function head(g, title) { if (logo.complete && logo.naturalWidth) g.drawImage(logo, 72, 184, 84, 84); g.fillStyle = "#fff"; g.font = "500 52px " + F; g.fillText(title, 176, 226); }
  function check(g, x, y, done) { g.fillStyle = done ? "#7fd06e" : "rgba(255,255,255,.25)"; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); if (done) { g.strokeStyle = "#00014f"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(x - 14, y + 1); g.lineTo(x - 2, y + 14); g.lineTo(x + 18, y - 14); g.stroke(); } }
  function drawA() { /* home, with a real customer photo */
    var g = cvs[0].getContext("2d"); frameBg(g); head(g, "Eliana");
    cover(g, img["tailor.jpg"], 56, 330, 912, 760, 60);
    var sh = g.createLinearGradient(0, 640, 0, 1090); sh.addColorStop(0, "rgba(0,1,79,0)"); sh.addColorStop(.6, "rgba(0,1,79,.7)"); sh.addColorStop(1, "rgba(0,1,79,.94)"); g.fillStyle = sh; rrect(g, 56, 330, 912, 760, 60); g.fill();
    g.fillStyle = "#a6dd99"; g.font = "500 40px " + F; g.fillText("Imaarika working-capital loan", 100, 960);
    g.fillStyle = "#fff"; g.font = "500 116px " + F; g.fillText("KES 15,000", 94, 1042);
    g.fillStyle = "rgba(255,255,255,.78)"; g.font = "400 44px " + F; g.fillText("Repay a little each day, over up to 30 days", 72, 1190);
    var chips = ["No hidden charges", "Paid by mobile money"], x = 56;
    chips.forEach(function (c) { g.font = "500 38px " + F; var w = g.measureText(c).width + 90; g.fillStyle = "rgba(255,255,255,.12)"; rrect(g, x, 1262, w, 96, 48); g.fill(); g.fillStyle = "#7fd06e"; g.beginPath(); g.arc(x + 42, 1310, 11, 0, 7); g.fill(); g.fillStyle = "#fff"; g.fillText(c, x + 66, 1311); x += w + 18; });
    g.fillStyle = "rgba(255,255,255,.09)"; rrect(g, 56, 1420, 912, 250, 48); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.font = "400 38px " + F; g.fillText("Decision target", 100, 1494); g.fillStyle = "#fff"; g.font = "500 64px " + F; g.fillText("2 hours", 100, 1576); g.fillStyle = "rgba(255,255,255,.7)"; g.font = "400 34px " + F; g.fillText("on a complete application", 100, 1636);
    g.fillStyle = "#5fa052"; rrect(g, 56, 1780, 912, 150, 75); g.fill(); g.fillStyle = "#00014f"; g.font = "600 56px " + F; g.textAlign = "center"; g.fillText("Apply for support", 512, 1856); g.textAlign = "left";
    tex[0].needsUpdate = true;
  }
  function drawB() { /* the price, before you accept */
    var g = cvs[1].getContext("2d"); frameBg(g); head(g, "Before you accept");
    g.fillStyle = "#a6dd99"; g.font = "500 44px " + F; g.fillText("Your Imaarika loan", 72, 380);
    g.fillStyle = "#fff"; g.font = "500 150px " + F; g.fillText("KES 15,000", 62, 520);
    g.fillStyle = "rgba(255,255,255,.11)"; rrect(g, 56, 650, 912, 800, 56); g.fill();
    var rows = [["Processing fee", "KES 500"], ["Interest", "27%"], ["Penalties", "Stated first"], ["Repay over", "30 days, daily"], ["Hidden charges", "None"]];
    rows.forEach(function (r, i) { var y = 740 + i * 140; g.fillStyle = "rgba(255,255,255,.7)"; g.font = "400 42px " + F; g.fillText(r[0], 100, y); g.textAlign = "right"; g.fillStyle = i === 4 ? "#7fd06e" : "#fff"; g.font = "500 50px " + F; g.fillText(r[1], 924, y); g.textAlign = "left"; if (i < 4) { g.fillStyle = "rgba(255,255,255,.14)"; g.fillRect(100, y + 62, 824, 2); } });
    g.fillStyle = "#fff"; g.font = "500 58px " + F; g.fillText("You decide.", 72, 1560); g.fillStyle = "rgba(255,255,255,.72)"; g.font = "400 42px " + F; g.fillText("If it does not feel right, say no.", 72, 1634);
    g.fillStyle = "#5fa052"; rrect(g, 56, 1740, 912, 150, 75); g.fill(); g.fillStyle = "#00014f"; g.font = "600 56px " + F; g.textAlign = "center"; g.fillText("Accept the loan", 512, 1816); g.textAlign = "left";
    tex[1].needsUpdate = true;
  }
  function drawC() { /* paid, and repayments */
    var g = cvs[2].getContext("2d"); frameBg(g); head(g, "Your loan");
    cover(g, img["shop.jpg"], 56, 330, 912, 420, 56);
    var sh = g.createLinearGradient(0, 520, 0, 750); sh.addColorStop(0, "rgba(0,1,79,0)"); sh.addColorStop(1, "rgba(0,1,79,.8)"); g.fillStyle = sh; rrect(g, 56, 330, 912, 420, 56); g.fill();
    g.fillStyle = "#7fd06e"; g.beginPath(); g.arc(120, 664, 34, 0, 7); g.fill(); g.strokeStyle = "#00014f"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(104, 664); g.lineTo(116, 678); g.lineTo(138, 648); g.stroke();
    g.fillStyle = "#fff"; g.font = "500 50px " + F; g.fillText("KES 15,000 sent", 178, 650); g.fillStyle = "rgba(255,255,255,.8)"; g.font = "400 36px " + F; g.fillText("by mobile money", 178, 700);
    var cx = 280, cy = 1010, R = 150;
    g.fillStyle = "rgba(255,255,255,.11)"; rrect(g, 56, 810, 912, 470, 56); g.fill();
    g.lineWidth = 34; g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.strokeStyle = "#7fd06e"; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + .42 * Math.PI * 2); g.stroke();
    g.textAlign = "center"; g.fillStyle = "#fff"; g.font = "500 64px " + F; g.fillText("KES 500", cx, cy - 10); g.fillStyle = "rgba(255,255,255,.7)"; g.font = "400 36px " + F; g.fillText("paid today", cx, cy + 44); g.textAlign = "left";
    g.fillStyle = "rgba(255,255,255,.65)"; g.font = "400 38px " + F; g.fillText("Repaying early?", 520, 930); g.fillStyle = "#fff"; g.font = "500 46px " + F; g.fillText("No punitive", 520, 990); g.fillText("charge.", 520, 1048); g.fillStyle = "#a6dd99"; g.font = "400 36px " + F; g.fillText("Faster access next time", 520, 1130);
    [["Day 1", "Paid"], ["Day 2", "Paid"], ["Day 3", "Due tonight"]].forEach(function (l, i) { var y = 1420 + i * 128, done = i < 2; g.fillStyle = "rgba(255,255,255,.09)"; rrect(g, 56, y - 50, 912, 104, 38); g.fill(); check(g, 122, y + 2, done); g.fillStyle = "#fff"; g.font = "500 44px " + F; g.fillText(l[0], 182, y - 8); g.fillStyle = "rgba(255,255,255,.65)"; g.font = "400 32px " + F; g.fillText(l[1], 182, y + 30); g.textAlign = "right"; g.fillStyle = "#fff"; g.font = "500 44px " + F; g.fillText("KES 500", 930, y + 2); g.textAlign = "left"; });
    tex[2].needsUpdate = true;
  }
  function redraw() { drawA(); drawB(); drawC(); }
  redraw(); screenMat.map = tex[0];
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  /* back panel with the logo, and a camera bump */
  var bc = document.createElement("canvas"); bc.width = 1024; bc.height = 2088; var bg2 = bc.getContext("2d");
  function drawBack() {
    var gr = bg2.createLinearGradient(0, 0, 1024, 2088); gr.addColorStop(0, "#0a12b8"); gr.addColorStop(.55, "#1b4aa8"); gr.addColorStop(1, "#2f7a45"); bg2.fillStyle = gr; bg2.fillRect(0, 0, 1024, 2088);
    var rg = bg2.createRadialGradient(512, 1000, 20, 512, 1000, 620); rg.addColorStop(0, "rgba(255,255,255,.22)"); rg.addColorStop(1, "rgba(255,255,255,0)"); bg2.fillStyle = rg; bg2.fillRect(0, 0, 1024, 2088);
    if (logo.complete && logo.naturalWidth) { bg2.globalAlpha = .96; bg2.drawImage(logo, 232, 740, 560, 560); bg2.globalAlpha = 1; }
    bg2.textAlign = "center"; bg2.fillStyle = "rgba(255,255,255,.92)"; bg2.font = "500 64px " + F; bg2.fillText("Eliana Capital", 512, 1480); bg2.fillStyle = "#a6dd99"; bg2.font = "400 40px " + F; bg2.fillText("we grow together", 512, 1546);
    backTex.needsUpdate = true;
  }
  var backTex = new T.CanvasTexture(bc); backTex.colorSpace = T.SRGBColorSpace; backTex.anisotropy = 8; drawBack(); logo.addEventListener("load", drawBack);
  var back = new T.Mesh(flat(.95, 2.0, .14), new T.MeshPhysicalMaterial({ map: backTex, roughness: .22, metalness: .1, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.3 }));
  back.rotation.y = Math.PI; back.position.z = -FZ - .002; phone.add(back);
  var bump = new T.Mesh(new T.ExtrudeGeometry(rr(.42, .42, .1), { depth: .018, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 3 }), new T.MeshPhysicalMaterial({ color: 0x0b0f5e, metalness: .8, roughness: .3, clearcoat: 1 }));
  bump.position.set(.24, .78, -FZ - .022); bump.rotation.y = Math.PI; phone.add(bump);
  [[.1, .1], [.1, -.1], [-.1, 0]].forEach(function (p) { var l = new T.Mesh(new T.CylinderGeometry(.075, .075, .02, 28), new T.MeshPhysicalMaterial({ color: 0x03030f, metalness: .6, roughness: .08, clearcoat: 1 })); l.rotation.x = Math.PI / 2; l.position.set(.24 + p[0], .78 + p[1] * .98, -FZ - .045); phone.add(l); });
  var bm = new T.MeshPhysicalMaterial({ color: 0x151a8a, metalness: .95, roughness: .22, clearcoat: 1 });
  [[.512, .35, .3], [-.512, .5, .16], [-.512, .26, .16]].forEach(function (b) { var m = new T.Mesh(new T.BoxGeometry(.03, b[2], .05), bm); m.position.set(b[0], b[1], 0); phone.add(m); });

  /* soft contact shadow on the page (not part of the phone, so it never spins) */
  var sc = document.createElement("canvas"); sc.width = sc.height = 256; var sg = sc.getContext("2d"), grd = sg.createRadialGradient(128, 128, 8, 128, 128, 126);
  grd.addColorStop(0, "rgba(0,1,70,.55)"); grd.addColorStop(.55, "rgba(0,1,70,.2)"); grd.addColorStop(1, "rgba(0,1,70,0)"); sg.fillStyle = grd; sg.fillRect(0, 0, 256, 256);
  var shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false, opacity: .8 })); shadow.position.z = -40; scene.add(shadow);

  /* ---------- soft glow behind the phone (follows it, brightens with scroll speed) ---------- */
  var gc = document.createElement("canvas"); gc.width = gc.height = 256; var gg = gc.getContext("2d"), gr2 = gg.createRadialGradient(128, 128, 4, 128, 128, 126);
  gr2.addColorStop(0, "rgba(255,226,150,.55)"); gr2.addColorStop(.45, "rgba(255,206,120,.2)"); gr2.addColorStop(1, "rgba(255,206,120,0)"); gg.fillStyle = gr2; gg.fillRect(0, 0, 256, 256);
  var glow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc), transparent: true, depthWrite: false, opacity: 0 })); glow.position.z = -80; scene.add(glow);

  /* ---------- the choreography ---------- */
  var pointer = { x: -9999, y: -9999 }, lastY = window.pageYOffset, lx = 0, ly = 0, svel = 0;
  window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); }   /* smootherstep: no kink at either end */

  /* a critically damped spring (the same physics as motion.dev's spring): it keeps its velocity, so the phone never jerks */
  function Spring(k, zeta) { this.k = k; this.c = 2 * Math.sqrt(k) * zeta; this.x = 0; this.v = 0; this.on = false; }
  Spring.prototype.go = function (target, dt) {
    if (!this.on) { this.x = target; this.v = 0; this.on = true; return this.x; }
    var n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
    for (var i = 0; i < n; i++) { this.v += (this.k * (target - this.x) - this.c * this.v) * h; this.x += this.v * h; }
    return this.x;
  };
  var sX = new Spring(110, 1), sY = new Spring(110, 1), sH = new Spring(120, 1), sYaw = new Spring(70, .92), sLift = new Spring(90, 1);

  /* the drop-in on load: a soft spring with one gentle settle (not a bounce) */
  function drop(t) { if (t <= 0) return 0; var w = 5.2, z = .8, d = Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(w * d * t) + z / d * Math.sin(w * d * t)); }
  var avoidEl = anchors.map(function (a) { var q = a.getAttribute("data-avoid"); return q ? document.querySelector(q) : null; });
  var t0 = performance.now() + (reduce ? 0 : 700), FLY_MAX = 2.4, HOLD = .2, last = performance.now(), curScr = 0, GAP = 26;

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(.05, (now - last) / 1000); last = now; if (dt <= 0) return;
    var sy = window.pageYOffset || 0, A = [], i;
    for (i = 0; i < anchors.length; i++) {
      var r = anchors[i].getBoundingClientRect(), top = r.top, hh = r.height;
      if (avoidEl[i]) {                       /* keep clear of the tagline: shrink from the top, keep the bottom fixed */
        var er = avoidEl[i].getBoundingClientRect(), minTop = er.bottom + GAP;
        if (top < minTop) { hh = Math.max(240, r.bottom - minTop); top = r.bottom - hh; }
      }
      var cy = top + hh / 2;
      A.push({ x: r.left + r.width / 2, y: cy, h: hh, a: sy + cy - dh / 2, yaw: (parseFloat(anchors[i].getAttribute("data-yaw")) || 0) * Math.PI / 180, scr: parseInt(anchors[i].getAttribute("data-screen") || "0", 10) });
    }
    var n = A.length, seg = 0, j;
    while (seg < n - 1 && sy >= A[seg + 1].a) seg++;
    var from = A[seg], to = A[Math.min(seg + 1, n - 1)], t = 0, fly = false, spin = 0;
    for (j = 0; j < seg; j++) { var Gj = A[j + 1].a - A[j].a; if (Gj > 0 && Gj <= dh * FLY_MAX && !reduce) spin++; }
    if (seg < n - 1) {
      var G = to.a - from.a;
      if (G > 0 && G <= dh * FLY_MAX && !reduce) { fly = true; t = ease((sy - (from.a + HOLD * G)) / (G * (1 - 2 * HOLD))); spin += t; }
      else t = sy >= (from.a + to.a) / 2 ? 1 : 0;
    }
    var tx = lerp(from.x, to.x, t), ty = lerp(from.y, to.y, t), th = lerp(from.h, to.h, t);
    var tyaw = lerp(from.yaw, to.yaw, t) + Math.PI * 2 * spin;
    var dip = fly ? Math.sin(Math.PI * t) : 0;                      /* a small, graceful dip in size mid-flight */
    var want = t < .5 ? from.scr : to.scr;

    /* everything follows its target through a spring */
    var cx = sX.go(tx, dt), cy2 = sY.go(ty, dt), h = sH.go(th * (1 - .08 * dip), dt), yaw = sYaw.go(tyaw, dt);
    var backFacing = Math.cos(yaw) < -.25, settled = Math.abs(yaw - tyaw) < .12;
    if (want !== curScr && (backFacing || settled || reduce)) curScr = want;      /* swap the screen only while its back is to you */
    if (screenMat.map !== tex[curScr]) screenMat.map = tex[curScr];

    var T0 = (now - t0) / 1000, p = reduce ? 1 : drop(T0), q = 1 - p;
    var dy = sy - lastY; lastY = sy; svel += (clamp(dy, -90, 90) - svel) * .1;
    var px = 0, py = 0;
    if (!reduce) { var ddx = (pointer.x - cx) / Math.max(120, h), ddy = (pointer.y - cy2) / Math.max(120, h), near = Math.max(0, 1 - Math.hypot(ddx, ddy) / 1.4); px = ddx * near * .5; py = ddy * near * .3; }
    lx += (px - lx) * .06; ly += (py - ly) * .06;
    var bob = reduce ? 0 : Math.sin(now / 1000 * 1.2) * .012;

    var visible = cy2 + h / 2 > -vh * .25 && cy2 - h / 2 < vh * 1.25 && p > .002;
    canvas.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    var s = h / HEIGHT * (1 - q * .3);
    phone.scale.setScalar(s);
    phone.position.set(cx - vw / 2, vh / 2 - cy2 - q * vh * .7 + bob * h, 0);
    phone.rotation.set(.06 + ly - svel * .0036 - q * .5 + (reduce ? 0 : Math.sin(now / 2100) * .03), yaw + lx - q * Math.PI * 2, -.08 + (reduce ? 0 : Math.sin(now / 2500) * .02) + q * .18);
    shadow.position.set(cx - vw / 2, vh / 2 - cy2 - h * .46 - q * vh * .7, -h * .3);
    shadow.scale.set(h * .62 * (1 - q * .4), h * .16, 1); shadow.material.opacity = .85 * p * p;
    glow.position.set(cx - vw / 2, vh / 2 - cy2 - q * vh * .7, -h * .5); glow.scale.set(h * 1.5, h * 1.5, 1);
    glow.material.opacity = clamp((.5 + Math.min(1, Math.abs(svel) / 60) * .45) * p, 0, 1);
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
})();
