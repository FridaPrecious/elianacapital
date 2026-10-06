/* Eliana Capital: WebGL photo layer.
   Every photo on the site is drawn by one shared three.js renderer and copied into a canvas inside its own frame, so
   layering, rounded corners, captions and links keep working. Effects (the kind seen on WebGL portfolio sites):
   - image bends and splits colour with scroll velocity
   - cursor ripple and 3D tilt on hover
   - reveal wipe with a slow zoom-out when the photo scrolls into view
   - parallax inside the frame
   If WebGL or the embedded image data is missing, the normal <img> stays visible. */
(function () {
  "use strict";
  var T = window.THREE, DATA = window.ELIANA_IMGS;
  if (!T || !DATA) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var figs = Array.prototype.slice.call(document.querySelectorAll(".photo.has-img"));
  if (!figs.length) return;

  var BUF = 2048, DPR = Math.min(window.devicePixelRatio || 1, 1.5), clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var gl;
  try {
    gl = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  gl.setPixelRatio(1); gl.setSize(BUF, BUF, false);
  gl.outputColorSpace = T.LinearSRGBColorSpace;   /* pass colours straight through, textures stay "as is" */
  gl.setClearColor(0x000000, 0); gl.setScissorTest(true);
  var glc = gl.domElement;

  var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, .1, 20);
  var D = .5 / Math.tan(T.MathUtils.degToRad(35 / 2)); cam.position.z = D;

  var VERT = [
    "uniform float uVel; varying vec2 vUv;",
    "void main(){ vUv = uv; vec3 p = position;",
    "  float b = sin(uv.x * 3.14159) * sin(uv.y * 3.14159);",
    "  p.z += b * uVel * .22; p.y += (uv.x - .5) * uVel * .05;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }"
  ].join("\n");

  var FRAG = [
    "uniform sampler2D uTex; uniform float uTime, uVel, uHover, uPar, uAspect, uTexAspect, uReveal, uZoom;",
    "uniform vec2 uMouse, uPos; varying vec2 vUv;",
    "vec2 cover(vec2 uv){",
    "  vec2 s = vec2(1.);",
    "  if (uAspect > uTexAspect) s.y = uTexAspect / uAspect; else s.x = uAspect / uTexAspect;",
    "  vec2 off = vec2((1. - s.x) * uPos.x, (1. - s.y) * (1. - uPos.y));",
    "  uv = (uv - .5) / uZoom + .5; uv.y += uPar;",
    "  return uv * s + off; }",
    "void main(){",
    "  vec2 uv = vUv; vec2 d = uv - uMouse; vec2 da = d * vec2(uAspect, 1.);",
    "  float r = length(da);",
    "  float w = sin(r * 26. - uTime * 3.2) * exp(-r * 4.5) * uHover;",
    "  uv += normalize(d + 1e-4) * w * .014;",
    "  uv.x += sin(uv.y * 6. + uTime * .6) * .0025 * (.4 + uHover);",
    "  float sp = uVel * .012 + uHover * .0022;",
    "  vec2 c = cover(uv);",
    "  vec3 col = vec3(texture2D(uTex, cover(uv + vec2(sp, 0.))).r, texture2D(uTex, c).g, texture2D(uTex, cover(uv - vec2(sp, 0.))).b);",
    "  col *= 1. + uHover * .06;",
    "  float rr = uReveal * 1.25;",
    "  float a = 1. - smoothstep(rr - .25, rr, vUv.y);",
    "  col *= mix(.55, 1., uReveal);",
    "  gl_FragColor = vec4(col * a, a); }"
  ].join("\n");

  var plane = new T.PlaneGeometry(1, 1, 40, 40), textures = {}, pending = {};
  function getTex(name, cb) {
    if (textures[name]) return cb(textures[name]);
    if (pending[name]) return pending[name].push(cb);
    var d = DATA[name]; if (!d) return;
    pending[name] = [cb];
    var im = new Image();
    im.onload = function () {
      var t = new T.Texture(im); t.colorSpace = T.NoColorSpace; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter; t.needsUpdate = true;
      t.userData = { aspect: im.width / im.height }; textures[name] = t; pending[name].forEach(function (f) { f(t); });
    };
    im.src = d[0];
  }

  var vel = 0, lastY = window.scrollY, seen = 0, items = [];
  var started = performance.now();

  figs.forEach(function (fig) {
    var img = fig.querySelector("img"); if (!img) return;
    var name = (img.getAttribute("src") || "").split("/").pop();
    var pos = (img.style.objectPosition || "50% 50%").split(/\s+/).map(function (s) { return parseFloat(s) / 100; });
    var cv = document.createElement("canvas"); cv.className = "gl-cv"; cv.setAttribute("aria-hidden", "true"); fig.insertBefore(cv, img.nextSibling);
    var it = { fig: fig, cv: cv, ctx: cv.getContext("2d"), host: fig.closest(".story, .feat-a") || fig, vis: false, hover: 0, hoverT: 0, mx: .5, my: .5, rx: 0, ry: 0, sx: 0, sy: 0, reveal: 0, started: false, w: 0, h: 0, dirty: true, mesh: null };
    getTex(name, function (tex) {
      var mat = new T.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, blending: T.NoBlending, transparent: false, depthTest: false, depthWrite: false, toneMapped: false,
        uniforms: { uTex: { value: tex }, uTime: { value: 0 }, uVel: { value: 0 }, uHover: { value: 0 }, uPar: { value: 0 }, uAspect: { value: 1 }, uTexAspect: { value: tex.userData.aspect },
          uReveal: { value: 0 }, uZoom: { value: 1.35 }, uMouse: { value: new T.Vector2(.5, .5) }, uPos: { value: new T.Vector2(pos[0] || .5, pos[1] || .5) } }
      });
      it.mesh = new T.Mesh(plane, mat); it.mesh.visible = false; scene.add(it.mesh); it.u = mat.uniforms;
      it.ready = true; it.dirty = true;
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { it.vis = en[0].isIntersecting; if (it.vis && !it.started) { it.started = true; it.t0 = performance.now(); } }, { rootMargin: "120px" }).observe(fig);
    else { it.vis = true; it.started = true; it.t0 = performance.now(); }
    it.host.addEventListener("pointermove", function (e) {
      var b = fig.getBoundingClientRect(); it.mx = clamp((e.clientX - b.left) / b.width, 0, 1); it.my = clamp(1 - (e.clientY - b.top) / b.height, 0, 1); it.hoverT = 1;
    });
    it.host.addEventListener("pointerleave", function () { it.hoverT = 0; });
    it.host.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      var b = fig.getBoundingClientRect(); it.mx = clamp((e.clientX - b.left) / b.width, 0, 1); it.my = clamp(1 - (e.clientY - b.top) / b.height, 0, 1);
      it.hoverT = 1; clearTimeout(it.tt); it.tt = setTimeout(function () { it.hoverT = 0; }, 1100);
    });
    items.push(it);
  });
  if (!items.length) return;

  function size(it, rect) {
    var w = Math.min(BUF, Math.round(rect.width * DPR)), h = Math.min(BUF, Math.round(rect.height * DPR));
    if (w !== it.w || h !== it.h) { it.w = w; it.h = h; it.cv.width = w; it.cv.height = h; it.dirty = true; }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    var y = window.scrollY, vh = window.innerHeight, t = (now - started) / 1000;
    var dy = y - lastY; lastY = y;
    vel += (clamp(dy / 38, -1.4, 1.4) - vel) * .12;
    var moving = Math.abs(vel) > .004;
    items.forEach(function (it) {
      if (!it.ready || !it.vis) return;
      var rect = it.fig.getBoundingClientRect(); if (rect.width < 4 || rect.height < 4) return;
      size(it, { width: it.fig.offsetWidth, height: it.fig.offsetHeight });
      it.hover += (it.hoverT - it.hover) * .08; it.rx += (((it.my - .5) * -.16) * it.hover - it.rx) * .1; it.ry += (((it.mx - .5) * .2) * it.hover - it.ry) * .1;
      var k = clamp((now - it.t0) / 1500, 0, 1), e = 1 - Math.pow(1 - k, 3);
      var par = clamp(((rect.top + rect.height / 2) - vh / 2) / vh, -1, 1) * -.06;
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2, shifted = Math.abs(cx - (it.lx || 0)) + Math.abs(cy - (it.ly || 0)) > .4; it.lx = cx; it.ly = cy;
      var stx = clamp((cy - vh / 2) / vh, -1, 1) * -.13, sty = clamp((cx - window.innerWidth / 2) / window.innerWidth, -1, 1) * .16;
      it.sx += (stx - it.sx) * .12; it.sy += (sty - it.sy) * .12;
      var active = moving || shifted || it.hover > .002 || it.hoverT > 0 || k < 1 || it.dirty || Math.abs(stx - it.sx) + Math.abs(sty - it.sy) > .002;
      if (!active) return;
      var u = it.u, asp = it.w / it.h;
      u.uTime.value = t; u.uVel.value = vel; u.uHover.value = it.hover; u.uPar.value = par; u.uAspect.value = asp; u.uReveal.value = e; u.uZoom.value = 1.35 - .23 * e;
      u.uMouse.value.set(it.mx, it.my);
      it.mesh.scale.set(asp * 1.1, 1.1, 1); it.mesh.rotation.set(it.rx + it.sx, it.ry + it.sy, 0); it.mesh.visible = true;
      cam.aspect = asp; cam.updateProjectionMatrix();
      gl.setViewport(0, 0, it.w, it.h); gl.setScissor(0, 0, it.w, it.h); gl.clear();
      gl.render(scene, cam);
      it.mesh.visible = false;
      it.ctx.clearRect(0, 0, it.w, it.h); it.ctx.drawImage(glc, 0, BUF - it.h, it.w, it.h, 0, 0, it.w, it.h);
      if (!it.on) { it.on = true; it.fig.classList.add("gl-on"); }
      it.dirty = false;
    });
  }
  window.addEventListener("resize", function () { items.forEach(function (it) { it.dirty = true; }); });
  document.documentElement.classList.add("gl-img");
  requestAnimationFrame(frame);
})();
