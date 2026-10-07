/* Eliana Capital: 3D layer (three.js, vanilla).
   Techniques borrowed from the react-three-fiber / drei ecosystem and rebuilt without React so the
   prototype still opens from a plain folder:
   - Float + pointer parallax (drei <Float>, pointer-lerp camera rigs)
   - Procedural studio Environment lit via PMREM (drei <Environment>)
   - Distorted glossy orbs (drei <MeshDistortMaterial>)
   - Sparkle point-fields (drei <Sparkles>)
   - Scroll-linked rotation (drei <ScrollControls>)
   - Instanced mesh wave that reacts to the cursor (r3f instancing demos)
   The extruded logo is built from the real vector hands in the brand guideline. */
(function () {
  "use strict";
  var T = window.THREE;
  if (!T) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HANDS = [[[[-0.5421, 0.8071], [-0.5138, 0.8379], [-0.483, 0.8662], [-0.4508, 0.893]], [[-0.4508, 0.893], [-0.4995, 0.8702], [-0.5468, 0.8428], [-0.5923, 0.8108]], [[-0.5923, 0.8108], [-0.8623, 0.6204], [-1.0, 0.3123], [-0.9848, 0.005]], [[-0.9848, 0.005], [-0.9817, -0.0373], [-0.977, -0.0809], [-0.9701, -0.1255]], [[-0.9701, -0.1255], [-0.9552, -0.2226], [-0.9305, -0.3249], [-0.8929, -0.4309]], [[-0.8929, -0.4309], [-0.8872, -0.4468], [-0.8787, -0.4589], [-0.8642, -0.4573]], [[-0.8642, -0.4573], [-0.8462, -0.4553], [-0.8404, -0.437], [-0.8433, -0.4225]], [[-0.8433, -0.4225], [-0.8638, -0.321], [-0.8613, -0.2533], [-0.8386, -0.2442]], [[-0.8386, -0.2442], [-0.8255, -0.2388], [-0.8124, -0.2438], [-0.8025, -0.2947]], [[-0.8025, -0.2947], [-0.7878, -0.3706], [-0.7735, -0.4731], [-0.7491, -0.551]], [[-0.7491, -0.551], [-0.744, -0.5673], [-0.7277, -0.5849], [-0.7036, -0.5771]], [[-0.7036, -0.5771], [-0.6877, -0.5719], [-0.679, -0.5518], [-0.6857, -0.5261]], [[-0.6857, -0.5261], [-0.7079, -0.441], [-0.7255, -0.3503], [-0.7182, -0.2696]], [[-0.7182, -0.2696], [-0.7165, -0.2501], [-0.7062, -0.242], [-0.6956, -0.242]], [[-0.6956, -0.242], [-0.6833, -0.242], [-0.6747, -0.2492], [-0.664, -0.2784]], [[-0.664, -0.2784], [-0.6319, -0.3665], [-0.577, -0.5302], [-0.5308, -0.5815]], [[-0.5308, -0.5815], [-0.5208, -0.5927], [-0.5078, -0.594], [-0.4955, -0.5867]], [[-0.4955, -0.5867], [-0.4833, -0.5794], [-0.4786, -0.5604], [-0.4859, -0.5401]], [[-0.4859, -0.5401], [-0.5093, -0.4749], [-0.5723, -0.3313], [-0.5963, -0.2052]], [[-0.5963, -0.2052], [-0.5985, -0.1935], [-0.5862, -0.1763], [-0.5712, -0.1813]], [[-0.5712, -0.1813], [-0.5466, -0.1894], [-0.4301, -0.3817], [-0.3684, -0.4481]], [[-0.3684, -0.4481], [-0.3304, -0.4888], [-0.293, -0.4665], [-0.3125, -0.423]], [[-0.3125, -0.423], [-0.3293, -0.3852], [-0.3784, -0.3224], [-0.4196, -0.2522]], [[-0.4196, -0.2522], [-0.4905, -0.1312], [-0.5581, 0.0073], [-0.5413, 0.0453]], [[-0.5413, 0.0453], [-0.5137, 0.1076], [-0.4138, 0.0891], [-0.3497, 0.0561]], [[-0.3497, 0.0561], [-0.3001, 0.0305], [-0.2547, -0.0062], [-0.2202, 0.0247]], [[-0.2202, 0.0247], [-0.1879, 0.0535], [-0.232, 0.0949], [-0.2964, 0.1371]], [[-0.2964, 0.1371], [-0.355, 0.1755], [-0.4464, 0.216], [-0.5332, 0.2616]], [[-0.5332, 0.2616], [-0.6337, 0.3143], [-0.6927, 0.4234], [-0.6792, 0.5361]], [[-0.6792, 0.5361], [-0.6789, 0.5386], [-0.6786, 0.541], [-0.6782, 0.5435]], [[-0.6782, 0.5435], [-0.664, 0.6429], [-0.6101, 0.7332], [-0.5421, 0.8071]]], [[[0.818, 0.5441], [0.8472, 0.5161], [0.8738, 0.4859], [0.8989, 0.4544]], [[0.8989, 0.4544], [0.8779, 0.5017], [0.8525, 0.5479], [0.8226, 0.5923]], [[0.8226, 0.5923], [0.6447, 0.8562], [0.3507, 0.995], [0.0545, 0.9866]], [[0.0545, 0.9866], [0.0137, 0.9845], [-0.0284, 0.9808], [-0.0715, 0.9751]], [[-0.0715, 0.9751], [-0.1653, 0.9627], [-0.2644, 0.941], [-0.3672, 0.9069]], [[-0.3672, 0.9069], [-0.3827, 0.9017], [-0.3944, 0.8938], [-0.3932, 0.8798]], [[-0.3932, 0.8798], [-0.3916, 0.8624], [-0.3741, 0.8564], [-0.3602, 0.859]], [[-0.3602, 0.859], [-0.262, 0.8766], [-0.1968, 0.8729], [-0.1884, 0.8509]], [[-0.1884, 0.8509], [-0.1836, 0.8381], [-0.1887, 0.8255], [-0.2379, 0.8171]], [[-0.2379, 0.8171], [-0.3113, 0.8044], [-0.4103, 0.7928], [-0.4857, 0.7708]], [[-0.4857, 0.7708], [-0.5016, 0.7662], [-0.5189, 0.7509], [-0.5118, 0.7275]], [[-0.5118, 0.7275], [-0.5072, 0.7121], [-0.488, 0.7033], [-0.4631, 0.7093]], [[-0.4631, 0.7093], [-0.3806, 0.729], [-0.2929, 0.744], [-0.2154, 0.7354]], [[-0.2154, 0.7354], [-0.1967, 0.7333], [-0.189, 0.7233], [-0.1893, 0.713]], [[-0.1893, 0.713], [-0.1895, 0.7012], [-0.1966, 0.693], [-0.2249, 0.6834]], [[-0.2249, 0.6834], [-0.3104, 0.6542], [-0.4692, 0.6047], [-0.5196, 0.5612]], [[-0.5196, 0.5612], [-0.5306, 0.5517], [-0.5321, 0.5393], [-0.5253, 0.5273]], [[-0.5253, 0.5273], [-0.5185, 0.5154], [-0.5003, 0.5105], [-0.4806, 0.5171]], [[-0.4806, 0.5171], [-0.4173, 0.5383], [-0.2777, 0.5961], [-0.1558, 0.6167]], [[-0.1558, 0.6167], [-0.1445, 0.6186], [-0.1282, 0.6064], [-0.1333, 0.5921]], [[-0.1333, 0.5921], [-0.1416, 0.5685], [-0.3292, 0.4602], [-0.3944, 0.402]], [[-0.3944, 0.402], [-0.4344, 0.3664], [-0.4136, 0.3299], [-0.3713, 0.3477]], [[-0.3713, 0.3477], [-0.3346, 0.3632], [-0.2731, 0.4092], [-0.2046, 0.4474]], [[-0.2046, 0.4474], [-0.0867, 0.5133], [0.0481, 0.5756], [0.0843, 0.5587]], [[0.0843, 0.5587], [0.1438, 0.5308], [0.124, 0.435], [0.0908, 0.3738]], [[0.0908, 0.3738], [0.0652, 0.3267], [0.029, 0.2836], [0.058, 0.2498]], [[0.058, 0.2498], [0.0851, 0.2182], [0.1259, 0.2598], [0.1678, 0.3209]], [[0.1678, 0.3209], [0.206, 0.3766], [0.2469, 0.4638], [0.2925, 0.5465]], [[0.2925, 0.5465], [0.3453, 0.6422], [0.4516, 0.6969], [0.5598, 0.6815]], [[0.5598, 0.6815], [0.5621, 0.6812], [0.5645, 0.6808], [0.5669, 0.6804]], [[0.5669, 0.6804], [0.6623, 0.6647], [0.7482, 0.611], [0.818, 0.5441]]], [[[0.5132, -0.7895], [0.484, -0.8154], [0.4528, -0.8386], [0.4205, -0.8604]], [[0.4205, -0.8604], [0.4677, -0.8439], [0.5142, -0.823], [0.5593, -0.7976]], [[0.5593, -0.7976], [0.8273, -0.647], [0.9839, -0.3747], [0.9988, -0.0888]], [[0.9988, -0.0888], [1.0, -0.0493], [0.9997, -0.0086], [0.9976, 0.0334]], [[0.9976, 0.0334], [0.9929, 0.1247], [0.9798, 0.2217], [0.9549, 0.3234]], [[0.9549, 0.3234], [0.9512, 0.3387], [0.9445, 0.3506], [0.9309, 0.3505]], [[0.9309, 0.3505], [0.914, 0.3504], [0.9069, 0.334], [0.9082, 0.3204]], [[0.9082, 0.3204], [0.9176, 0.2245], [0.909, 0.162], [0.8871, 0.1557]], [[0.8871, 0.1557], [0.8744, 0.152], [0.8627, 0.1579], [0.8584, 0.2059]], [[0.8584, 0.2059], [0.8519, 0.2776], [0.8484, 0.3738], [0.8332, 0.4482]], [[0.8332, 0.4482], [0.83, 0.4638], [0.8166, 0.4816], [0.7935, 0.4767]], [[0.7935, 0.4767], [0.7783, 0.4734], [0.7684, 0.4556], [0.7722, 0.4312]], [[0.7722, 0.4312], [0.7847, 0.3502], [0.7924, 0.2646], [0.778, 0.1906]], [[0.778, 0.1906], [0.7745, 0.1727], [0.7643, 0.1662], [0.7544, 0.1672]], [[0.7544, 0.1672], [0.743, 0.1684], [0.7358, 0.1759], [0.7287, 0.2038]], [[0.7287, 0.2038], [0.7072, 0.2884], [0.6719, 0.4452], [0.634, 0.4971]], [[0.634, 0.4971], [0.6257, 0.5084], [0.6139, 0.5109], [0.6018, 0.5052]], [[0.6018, 0.5052], [0.5898, 0.4996], [0.5837, 0.4825], [0.5885, 0.463]], [[0.5885, 0.463], [0.604, 0.4004], [0.6488, 0.2615], [0.659, 0.1425]], [[0.659, 0.1425], [0.66, 0.1315], [0.647, 0.1167], [0.6336, 0.1227]], [[0.6336, 0.1227], [0.6115, 0.1326], [0.5219, 0.3216], [0.471, 0.3889]], [[0.471, 0.3889], [0.4397, 0.4302], [0.403, 0.4131], [0.4168, 0.371]], [[0.4168, 0.371], [0.4289, 0.3344], [0.4684, 0.2716], [0.4999, 0.2027]], [[0.4999, 0.2027], [0.5541, 0.084], [0.6036, -0.0506], [0.5845, -0.0841]], [[0.5845, -0.0841], [0.553, -0.1393], [0.4623, -0.1127], [0.406, -0.076]], [[0.406, -0.076], [0.3625, -0.0477], [0.324, -0.0094], [0.2891, -0.0347]], [[0.2891, -0.0347], [0.2565, -0.0584], [0.2934, -0.1009], [0.349, -0.1461]], [[0.349, -0.1461], [0.3997, -0.1871], [0.4805, -0.2333], [0.5565, -0.2836]], [[0.5565, -0.2836], [0.6445, -0.342], [0.6889, -0.4485], [0.6657, -0.5515]], [[0.6657, -0.5515], [0.6652, -0.5538], [0.6647, -0.5561], [0.6641, -0.5583]], [[0.6641, -0.5583], [0.6415, -0.649], [0.5831, -0.7275], [0.5132, -0.7895]]], [[[-0.6783, -0.6816], [-0.7083, -0.6622], [-0.7365, -0.6404], [-0.7637, -0.6173]], [[-0.7637, -0.6173], [-0.7375, -0.6549], [-0.7076, -0.6908], [-0.6741, -0.7243]], [[-0.6741, -0.7243], [-0.4749, -0.9239], [-0.1958, -0.995], [0.0604, -0.9377]], [[0.0604, -0.9377], [0.0955, -0.9291], [0.1314, -0.9187], [0.168, -0.9065]], [[0.168, -0.9065], [0.2475, -0.8799], [0.3299, -0.8443], [0.4136, -0.7973]], [[0.4136, -0.7973], [0.4262, -0.7902], [0.4351, -0.7814], [0.4316, -0.7694]], [[0.4316, -0.7694], [0.4274, -0.7545], [0.4111, -0.7523], [0.3994, -0.7568]], [[0.3994, -0.7568], [0.317, -0.7887], [0.2597, -0.7965], [0.2487, -0.7788]], [[0.2487, -0.7788], [0.2424, -0.7685], [0.2447, -0.7567], [0.286, -0.741]], [[0.286, -0.741], [0.3477, -0.7177], [0.4319, -0.6908], [0.4938, -0.659]], [[0.4938, -0.659], [0.5068, -0.6523], [0.5192, -0.6362], [0.5092, -0.617]], [[0.5092, -0.617], [0.5025, -0.6043], [0.4843, -0.6], [0.4637, -0.6093]], [[0.4637, -0.6093], [0.3953, -0.6403], [0.3216, -0.6682], [0.2527, -0.6738]], [[0.2527, -0.6738], [0.2361, -0.6752], [0.2277, -0.6677], [0.2262, -0.6588]], [[0.2262, -0.6588], [0.2244, -0.6484], [0.2292, -0.6401], [0.2522, -0.627]], [[0.2522, -0.627], [0.3216, -0.5872], [0.4514, -0.5173], [0.4879, -0.471]], [[0.4879, -0.471], [0.4958, -0.4609], [0.4951, -0.4499], [0.4871, -0.4406]], [[0.4871, -0.4406], [0.4792, -0.4314], [0.4626, -0.4302], [0.4466, -0.4393]], [[0.4466, -0.4393], [0.3951, -0.4684], [0.2834, -0.5422], [0.1809, -0.5806]], [[0.1809, -0.5806], [0.1714, -0.5842], [0.1551, -0.5763], [0.1571, -0.563]], [[0.1571, -0.563], [0.1604, -0.5411], [0.3052, -0.4153], [0.3521, -0.3537]], [[0.3521, -0.3537], [0.3809, -0.316], [0.3567, -0.2877], [0.3229, -0.3103]], [[0.3229, -0.3103], [0.2936, -0.33], [0.2479, -0.3804], [0.1948, -0.4252]], [[0.1948, -0.4252], [0.1033, -0.5024], [-0.0034, -0.5793], [-0.0377, -0.5706]], [[-0.0377, -0.5706], [-0.0941, -0.5565], [-0.0931, -0.4698], [-0.0745, -0.411]], [[-0.0745, -0.411], [-0.0602, -0.3656], [-0.036, -0.3221], [-0.0669, -0.2976]], [[-0.0669, -0.2976], [-0.0958, -0.2746], [-0.1243, -0.3177], [-0.1504, -0.378]], [[-0.1504, -0.378], [-0.1743, -0.4328], [-0.1951, -0.5156], [-0.2208, -0.5952]], [[-0.2208, -0.5952], [-0.2506, -0.6873], [-0.3338, -0.7527], [-0.4305, -0.7576]], [[-0.4305, -0.7576], [-0.4326, -0.7578], [-0.4347, -0.7578], [-0.4369, -0.7579]], [[-0.4369, -0.7579], [-0.5225, -0.7603], [-0.6063, -0.7281], [-0.6783, -0.6816]]]];
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var jobs = [];

  function mkRenderer(canvas) {
    try {
      var r = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      r.outputColorSpace = T.SRGBColorSpace;
      r.toneMapping = T.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      r.setClearColor(0x000000, 0);
      return r;
    } catch (e) { return null; }
  }

  /* A small procedural "studio" for reflections: navy-to-lavender sky, a white key softbox, a green fill. */
  function makeEnv(r) {
    var pm = new T.PMREMGenerator(r), s = new T.Scene();
    s.add(new T.Mesh(new T.SphereGeometry(50, 32, 16), new T.ShaderMaterial({
      side: T.BackSide,
      vertexShader: "varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "varying vec3 p;void main(){float h=normalize(p).y*.5+.5;vec3 lo=vec3(.004,.01,.2);vec3 hi=vec3(.55,.6,.98);gl_FragColor=vec4(mix(lo,hi,smoothstep(.05,1.,h)),1.);}"
    })));
    var panel = function (w, h, c, x, y, z, k) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    };
    panel(16, 9, 0xffffff, -10, 13, 10, 7);
    panel(10, 10, 0x5fa052, 13, -3, 6, 6);
    panel(18, 3, 0xaab2ff, 0, -13, -8, 4);
    var tex = pm.fromScene(s, 0.02).texture; pm.dispose(); return tex;
  }

  function distort(mat, amt) {
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = { value: 0 }; sh.uniforms.uAmt = { value: amt }; mat.userData.sh = sh;
      sh.vertexShader = "uniform float uTime;uniform float uAmt;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\nfloat n=sin(position.x*2.2+uTime*1.1)*sin(position.y*2.4+uTime*.9)*sin(position.z*2.1+uTime*1.3);\ntransformed+=normal*n*uAmt;");
    };
  }

  function dotTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.4, "rgba(255,255,255,.55)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  }

  function sparkles(n, color, size, sx, sy, sz) {
    var g = new T.BufferGeometry(), a = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * sx; a[i * 3 + 1] = (Math.random() - .5) * sy; a[i * 3 + 2] = (Math.random() - .5) * sz; }
    g.setAttribute("position", new T.BufferAttribute(a, 3));
    return new T.Points(g, new T.PointsMaterial({ color: color, size: size, map: dotTexture(), transparent: true, depthWrite: false, opacity: .85 }));
  }

  /* damped spring toward the pointer (what drei/react-spring call a spring): a little overshoot, then settles */
  function spring2(st) {
    var dt = .016, k = 95, d = 13; st.vx = st.vx || 0; st.vy = st.vy || 0;
    st.vx += (k * (st.tx - st.px) - d * st.vx) * dt; st.px += st.vx * dt;
    st.vy += (k * (st.ty - st.py) - d * st.vy) * dt; st.py += st.vy * dt;
  }

  function track(host, state) {
    host.addEventListener("pointermove", function (e) {
      var b = host.getBoundingClientRect();
      state.tx = ((e.clientX - b.left) / b.width) * 2 - 1; state.ty = -(((e.clientY - b.top) / b.height) * 2 - 1);
    });
    host.addEventListener("pointerleave", function () { state.tx = 0; state.ty = 0; });
    /* touch screens: the scene follows your finger even while you scroll, and tilts with the phone where the browser allows it */
    var tp = function (e) { var t = e.touches && e.touches[0]; if (!t) return; var b = host.getBoundingClientRect(); state.tx = clamp(((t.clientX - b.left) / b.width) * 2 - 1, -1, 1); state.ty = clamp(-(((t.clientY - b.top) / b.height) * 2 - 1), -1, 1); };
    host.addEventListener("touchstart", tp, { passive: true }); host.addEventListener("touchmove", tp, { passive: true });
    host.addEventListener("touchend", function () { state.tx = 0; state.ty = 0; }, { passive: true });
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function" && window.matchMedia("(pointer:coarse)").matches) {
      window.addEventListener("deviceorientation", function (e) {
        if (!state.on || e.gamma == null || e.beta == null) return;
        state.tx = clamp(e.gamma / 28, -1, 1); state.ty = clamp(-(e.beta - 50) / 28, -1, 1);
      });
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { state.on = en[0].isIntersecting; }).observe(host);
  }

  function fit(r, cam, host, onSize) {
    var apply = function () {
      var b = host.getBoundingClientRect(); if (!b.width || !b.height) return;
      r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); onSize && onSize(b.width, b.height);
    };
    apply();
    if ("ResizeObserver" in window) new ResizeObserver(apply).observe(host); else window.addEventListener("resize", apply);
  }

  /* ---------- Scene 1: hero. The hands mark, floating, with orbs and sparkles ---------- */
  function hero(canvas, host) {
    var r = mkRenderer(canvas); if (!r) return false;
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 80); cam.position.set(0, 0, 12);
    scene.environment = makeEnv(r);
    var key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 6, 8); scene.add(key);
    var rim = new T.PointLight(0x5fa052, 60, 20); rim.position.set(5, -3, 3); scene.add(rim);
    scene.add(new T.HemisphereLight(0x9aa0ff, 0x000138, .5));

    var logo = new T.Group(), spin = new T.Group(); logo.add(spin); scene.add(logo);
    var mat = new T.MeshPhysicalMaterial({ color: 0xf4f6ff, roughness: .26, metalness: .05, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.35 });
    HANDS.forEach(function (segs, i) {
      var sh = new T.Shape(); sh.moveTo(segs[0][0][0], segs[0][0][1]);
      segs.forEach(function (s) { if (s.length === 4) sh.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]); else sh.lineTo(s[1][0], s[1][1]); });
      var geo = new T.ExtrudeGeometry(sh, { depth: .14, bevelEnabled: true, bevelThickness: .035, bevelSize: .028, bevelSegments: 5, curveSegments: 22 });
      var m = new T.Mesh(geo, mat); m.position.z = (i - 1.5) * .06; spin.add(m);
    });
    var ringMat = new T.MeshStandardMaterial({ color: 0x5fa052, emissive: 0x5fa052, emissiveIntensity: .9, roughness: .4 });
    var ring1 = new T.Mesh(new T.TorusGeometry(1.17, .012, 12, 160), ringMat), ring2 = new T.Mesh(new T.TorusGeometry(1.3, .008, 12, 160), ringMat);
    ring1.rotation.x = 1.15; ring2.rotation.set(.5, .9, 0); logo.add(ring1, ring2);

    var orbs = new T.Group(); scene.add(orbs);
    [{ c: 0x2328ff, r: .66, p: [3.2, -2.3, -2.2], d: .16 }, { c: 0x5fa052, r: .22, p: [-1.4, -2.5, 1.2], d: .28 }].forEach(function (o, i) {
      var m = new T.MeshPhysicalMaterial({ color: o.c, roughness: .12, metalness: .1, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.5 });
      distort(m, o.d);
      var mesh = new T.Mesh(new T.SphereGeometry(o.r, 64, 64), m); mesh.position.set(o.p[0], o.p[1], o.p[2]);
      mesh.userData = { base: mesh.position.clone(), ph: i * 1.7, mat: m }; orbs.add(mesh);
    });
    var dustA = sparkles(160, 0xc9ccff, .05, 22, 12, 12), dustB = sparkles(40, 0x7fd070, .075, 20, 11, 10);
    scene.add(dustA, dustB);

    var st = { tx: 0, ty: 0, px: 0, py: 0, on: true }, W = 1, H = 1, view = { w: 11, h: 7 };
    track(host, st);
    fit(r, cam, host, function (w, h) {
      W = w; H = h; view.h = 2 * 12 * Math.tan(T.MathUtils.degToRad(cam.fov / 2)); view.w = view.h * cam.aspect;
      var narrow = cam.aspect < 0.9;
      var rad = narrow ? view.w * .235 : Math.min(view.h * .32, view.w * .165);
      logo.userData.scale = rad; logo.userData.x = narrow ? 0 : view.w * .27; logo.userData.y = narrow ? view.h * .315 : view.h * .02;
      orbs.scale.setScalar(narrow ? .45 : 1); orbs.position.y = narrow ? 1.6 : 0;
    });

    function frame(t) {
      spring2(st);
      var p = clamp(window.scrollY / Math.max(1, host.offsetHeight), 0, 1);
      var s = logo.userData.scale || 1;
      logo.scale.setScalar(s * (1 - p * .25));
      logo.position.set(logo.userData.x || 0, (logo.userData.y || 0) + Math.sin(t * 1.1) * .14 + p * .9, 0);
      logo.rotation.y = st.px * .5 + Math.sin(t * .4) * .22 + p * 1.3;
      logo.rotation.x = -st.py * .32 + Math.sin(t * .5) * .06;
      spin.rotation.z = t * .16 + p * 2.4;
      ring1.rotation.z = t * .35; ring2.rotation.z = -t * .25;
      orbs.children.forEach(function (o) {
        var d = o.userData, k = 0.3 + (d.base.z + 3) * .12;
        o.position.set(d.base.x + st.px * k * 1.2, d.base.y + Math.sin(t * .9 + d.ph) * .22 + st.py * k, d.base.z);
        o.rotation.y = t * .3 + d.ph;
        if (d.mat.userData.sh) d.mat.userData.sh.uniforms.uTime.value = t + d.ph;
      });
      dustA.rotation.y = t * .015 + st.px * .06; dustA.rotation.x = st.py * .04; dustB.rotation.y = -t * .02 + st.px * .1;
      dustB.position.y = Math.sin(t * .3) * .2;
      canvas.style.opacity = String(clamp(1 - p * 1.1, 0, 1));
      r.render(scene, cam);
    }
    return { r: r, el: host, st: st, frame: frame, still: function () { frame(1.2); } };
  }

  /* ---------- Scene 2: call-to-action wave. An instanced field that rises toward the cursor ---------- */
  function wave(canvas, host) {
    var r = mkRenderer(canvas); if (!r) return false;
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, .1, 80);
    cam.position.set(0, 7.5, 15); cam.lookAt(0, 0, 0);
    scene.environment = makeEnv(r); scene.environmentIntensity = .6;
    scene.add(new T.HemisphereLight(0xffffff, 0x3a7a33, 1.5));
    var d = new T.DirectionalLight(0xffffff, 1.6); d.position.set(-4, 9, 6); scene.add(d);
    var COLS = 40, ROWS = 16, GAP = .52, N = COLS * ROWS;
    var geo = new T.BoxGeometry(.4, 1, .4); geo.translate(0, .5, 0);
    var mesh = new T.InstancedMesh(geo, new T.MeshStandardMaterial({ roughness: .3, metalness: 0, emissive: 0x0a0d60, emissiveIntensity: .35 }), N);
    mesh.setColorAt(0, new T.Color(0xffffff)); scene.add(mesh); mesh.rotation.y = -.42;
    var dummy = new T.Object3D(), c1 = new T.Color(0x2f6a2a), c2 = new T.Color(0x1217ff), c3 = new T.Color(0xffffff), col = new T.Color();
    var st = { tx: 0, ty: 0, px: 0, py: 0, on: true }, ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), nd = new T.Vector2(), mx = 99, mz = 99;
    track(host, st);
    fit(r, cam, host);

    function frame(t) {
      st.px += (st.tx - st.px) * .1; st.py += (st.ty - st.py) * .1;
      if (st.tx !== 0 || st.ty !== 0) { nd.set(st.px, st.py); ray.setFromCamera(nd, cam); if (ray.ray.intersectPlane(plane, hit)) { var l = mesh.worldToLocal(hit.clone()); mx = l.x; mz = l.z; } }
      else { mx = 99; mz = 99; }
      var i = 0;
      for (var z = 0; z < ROWS; z++) for (var x = 0; x < COLS; x++) {
        var px = (x - COLS / 2) * GAP, pz = (z - ROWS / 2) * GAP;
        var h = .18 + .62 * (.5 + .5 * Math.sin(px * .5 + t * .9 + pz * .3)) * (.55 + .45 * Math.sin(pz * .55 - t * .6));
        var dx = px - mx, dz = pz - mz, inf = Math.exp(-(dx * dx + dz * dz) / 2.6) * 1.9;
        h += inf;
        dummy.position.set(px, 0, pz); dummy.scale.set(1, h, 1); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
        var k = clamp(h / 2.2, 0, 1);
        col.copy(c1).lerp(c2, clamp(k * 1.5, 0, 1)); if (k > .55) col.lerp(c3, (k - .55) * 1.8);
        mesh.setColorAt(i, col); i++;
      }
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
      r.render(scene, cam);
    }
    return { r: r, el: host, st: st, frame: frame, still: function () { frame(2); } };
  }

  /* ---------- Scene 3: inner-page heroes. One shared studio (orbs, sparkles, parallax), a different centrepiece per page ---------- */
  function page(canvas, host) {
    var r = mkRenderer(canvas); if (!r) return false;
    var v = canvas.getAttribute("data-variant") || "mark";
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 80); cam.position.set(0, 0, 12);
    scene.environment = makeEnv(r);
    var key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 6, 8); scene.add(key);
    var rim = new T.PointLight(0x5fa052, 60, 20); rim.position.set(5, -3, 3); scene.add(rim);
    scene.add(new T.HemisphereLight(0x9aa0ff, 0x000138, .5));
    var glossy = function (c, rough) { return new T.MeshPhysicalMaterial({ color: c, roughness: rough == null ? .22 : rough, metalness: .05, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.4 }); };
    var hero = new T.Group(), spin = new T.Group(); hero.add(spin); scene.add(hero);
    var parts = [];   /* pieces animated per frame */

    if (v === "mark") {
      var mat = glossy(0xf4f6ff, .26);
      HANDS.forEach(function (segs, i) {
        var sh = new T.Shape(); sh.moveTo(segs[0][0][0], segs[0][0][1]);
        segs.forEach(function (s) { if (s.length === 4) sh.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]); else sh.lineTo(s[1][0], s[1][1]); });
        var m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: .14, bevelEnabled: true, bevelThickness: .035, bevelSize: .028, bevelSegments: 4, curveSegments: 18 }), mat);
        m.position.z = (i - 1.5) * .06; spin.add(m);
      });
    } else if (v === "bars") {
      [[.55, 0xa6dd99], [.95, 0x7fc16f], [1.4, 0x5fa052]].forEach(function (b, i) {
        var g = new T.CylinderGeometry(.34, .34, 1, 40); g.translate(0, .5, 0);
        var m = new T.Mesh(g, glossy(b[1], .3)); m.position.set((i - 1) * .95, -.8, 0); m.scale.y = b[0] * 1.4; m.userData = { h: b[0] * 1.4, i: i }; spin.add(m); parts.push(m);
      });
      var top = new T.Mesh(new T.SphereGeometry(.3, 48, 48), glossy(0xffffff, .1)); top.position.set(.95, 1.55, 0); spin.add(top); top.userData = { orb: 1 }; parts.push(top);
    } else if (v === "path") {
      var pts = [[-1.8, -1.1], [-.9, -.3], [0, -.7], [.9, .35], [1.8, 1.1]].map(function (p) { return new T.Vector3(p[0], p[1], 0); });
      spin.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 90, .04, 10), new T.MeshStandardMaterial({ color: 0xa6dd99, emissive: 0x5fa052, emissiveIntensity: .8 })));
      pts.forEach(function (p, i) { var m = new T.Mesh(new T.SphereGeometry(.2 + i * .035, 40, 40), glossy(i === 4 ? 0xffffff : 0x5fa052, .15)); m.position.copy(p); m.userData = { i: i, base: p.clone() }; spin.add(m); parts.push(m); });
    } else if (v === "cards") {
      var names = ["tailor.jpg", "shop.jpg", "farmers.jpg", "couple.jpg"], pos = [[.72, .35], [.5, .3], [.74, .55], [.45, .4]], D = window.ELIANA_IMGS, CA = 0.78;
      [0x5fa052, 0xd8daf4, 0x2328ff, 0xa6dd99].forEach(function (c, i) {
        var edge = glossy(c, .3), faces = [edge, edge, edge, edge, edge, edge];
        var m = new T.Mesh(new T.BoxGeometry(1.05, 1.35, .09), faces); var a = i / 4 * Math.PI * 2;
        m.userData = { a: a }; spin.add(m); parts.push(m);
        if (D && D[names[i]]) {
          var im = new Image();
          im.onload = function () {
            var tex = new T.Texture(im); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
            var rx = Math.min(1, CA / (im.width / im.height)); tex.repeat.set(rx, 1); tex.offset.set((1 - rx) * pos[i][0], 0);
            var ph = new T.MeshBasicMaterial({ map: tex, toneMapped: false });
            faces[4] = ph; faces[5] = ph; m.material = faces;
          };
          im.src = D[names[i]][0];
        }
      });
    } else if (v === "knot") {
      var k = new T.Mesh(new T.TorusKnotGeometry(.85, .26, 180, 24, 2, 3), glossy(0xf4f6ff, .2)); spin.add(k);
    } else if (v === "globe") {
      var gm = new T.Mesh(new T.SphereGeometry(1.1, 48, 48), glossy(0x2328ff, .18)); spin.add(gm);
      var dots = sparkles(160, 0xffffff, .07, 0, 0, 0), pa = dots.geometry.attributes.position;
      for (var j = 0; j < pa.count; j++) { var u = Math.random() * 6.283, w = Math.acos(2 * Math.random() - 1); pa.setXYZ(j, 1.3 * Math.sin(w) * Math.cos(u), 1.3 * Math.cos(w), 1.3 * Math.sin(w) * Math.sin(u)); }
      spin.add(dots);
      var rg = new T.Mesh(new T.TorusGeometry(1.6, .012, 12, 160), new T.MeshStandardMaterial({ color: 0x5fa052, emissive: 0x5fa052, emissiveIntensity: .9 })); rg.rotation.x = 1.3; spin.add(rg);
    } else {  /* shield: nested rings, a quiet gyroscope */
      [[1.5, 0xf4f6ff], [1.15, 0x5fa052], [.8, 0x8f94ff]].forEach(function (a, i) {
        var m = new T.Mesh(new T.TorusGeometry(a[0], .07, 24, 120), glossy(a[1], .2)); m.userData = { i: i }; spin.add(m); parts.push(m);
      });
      spin.add(new T.Mesh(new T.IcosahedronGeometry(.42, 1), glossy(0xffffff, .12)));
    }

    var orbs = new T.Group(); scene.add(orbs);
    [{ c: 0x5fa052, r: .4, p: [-.4, 2.9, -1.6], d: .2 }, { c: 0x2328ff, r: .6, p: [3.4, -2.4, -2.4], d: .16 }, { c: 0xd8daf4, r: .26, p: [1.6, 2.6, -.6], d: .24 }, { c: 0x8f94ff, r: .34, p: [5.2, 1.8, -3], d: .2 }].forEach(function (o, i) {
      var m = glossy(o.c, .12); distort(m, o.d);
      var mesh = new T.Mesh(new T.SphereGeometry(o.r, 48, 48), m); mesh.position.set(o.p[0], o.p[1], o.p[2]);
      mesh.userData = { base: mesh.position.clone(), ph: i * 1.7, mat: m }; orbs.add(mesh);
    });
    var dust = sparkles(380, 0xc9ccff, .05, 22, 12, 12), dustG = sparkles(90, 0x7fd070, .075, 20, 11, 10); scene.add(dust, dustG);

    var st = { tx: 0, ty: 0, px: 0, py: 0, on: true }; track(host, st);
    var narrow = false;
    fit(r, cam, host, function () {
      var vh = 2 * 12 * Math.tan(T.MathUtils.degToRad(cam.fov / 2)), vw = vh * cam.aspect; narrow = cam.aspect < .9;
      hero.userData.s = narrow ? vw * (v === "cards" ? .165 : .155) : Math.min(vh * .3, vw * (v === "cards" ? .1 : .115));
      hero.userData.x = narrow ? vw * .2 : vw * (v === "cards" ? .31 : .3); hero.userData.y = narrow ? vh * .3 : 0;
      orbs.scale.setScalar(narrow ? .45 : 1); orbs.position.y = narrow ? vh * .27 : 0;
    });

    function frame(t) {
      spring2(st);
      var p = clamp(window.scrollY / Math.max(1, host.offsetHeight), 0, 1);
      hero.scale.setScalar((hero.userData.s || 1) * (1 - p * .2));
      hero.position.set(hero.userData.x || 0, (hero.userData.y || 0) + Math.sin(t * 1.1) * .14 + p * .8, 0);
      hero.rotation.y = st.px * .5 + Math.sin(t * .4) * .25 + p * 1.2; hero.rotation.x = -st.py * .3 + Math.sin(t * .5) * .06;
      if (v === "mark") spin.rotation.z = t * .16 + p * 2;
      else if (v === "knot") { spin.rotation.x = t * .3; spin.rotation.y = t * .22; }
      else if (v === "globe") spin.rotation.y = t * .25;
      parts.forEach(function (m) {
        var d = m.userData;
        if (v === "bars") { if (d.orb) { m.position.y = 1.55 + Math.sin(t * 1.6) * .1; m.position.x = .95 * (1 + p * .9); } else { m.scale.y = d.h * (1 + .08 * Math.sin(t * 1.4 + d.i)); m.position.x = (d.i - 1) * .95 * (1 + p * .9); } }
        else if (v === "path") { m.position.y = d.base.y + Math.sin(t * 1.3 + d.i * .9) * .1; m.scale.setScalar(1 + .12 * Math.max(0, Math.sin(t * 1.3 - d.i * .8))); }
        else if (v === "cards") { var R = 1.55 * (1 + p * .5); m.position.set(Math.cos(t * .5 + d.a) * R, Math.sin(t * .9 + d.a) * .25, Math.sin(t * .5 + d.a) * R); m.rotation.y = -(t * .5 + d.a) + Math.PI / 2; }
        else if (v === "shield") { m.scale.setScalar(1 + p * .22 * (d.i + 1)); m.rotation.x = t * (.35 + d.i * .2) * (d.i % 2 ? -1 : 1); m.rotation.y = t * (.25 + d.i * .15) + d.i; }
      });
      orbs.children.forEach(function (o) {
        var d = o.userData, k = .3 + (d.base.z + 3) * .12;
        o.position.set(d.base.x + st.px * k * 1.2, d.base.y + Math.sin(t * .9 + d.ph) * .22 + st.py * k, d.base.z);
        if (d.mat.userData.sh) d.mat.userData.sh.uniforms.uTime.value = t + d.ph;
      });
      dust.rotation.y = t * .015 + st.px * .06; dustG.rotation.y = -t * .02 + st.px * .1;
      canvas.style.opacity = String(clamp(1 - p * 1.1, 0, 1));
      r.render(scene, cam);
    }
    return { r: r, el: host, st: st, frame: frame, still: function () { frame(1.2); } };
  }

  var builders = { hero: hero, wave: wave, page: page };
  Array.prototype.slice.call(document.querySelectorAll("canvas[data-scene]")).forEach(function (cv) {
    var b = builders[cv.getAttribute("data-scene")]; if (!b) return;
    var job = b(cv, cv.parentNode); if (job) { jobs.push(job); cv.classList.add("is-live"); document.documentElement.classList.add("gl"); }
  });
  if (!jobs.length) return;

  if (reduce) { jobs.forEach(function (j) { j.still(); }); return; }
  var t0 = performance.now();
  (function loop(now) {
    var t = (now - t0) / 1000;
    if (!document.hidden) jobs.forEach(function (j) {
      if (!j.st.on) return;
      var a = performance.now(); j.frame(t); var cost = performance.now() - a;
      /* Performance guard (like drei's PerformanceMonitor): ease off on slow devices */
      j.ema = j.ema ? j.ema * .95 + cost * .05 : cost; j.n = (j.n || 0) + 1;
      if (j.n > 60 && j.ema > 24 && !j.low) { j.low = true; j.r.setPixelRatio(1); j.r.setSize(j.el.clientWidth, j.el.clientHeight, false); j.ema = 0; j.n = 0; }
      else if (j.n > 90 && j.ema > 40 && j.low) { j.st.on = false; j.dead = true; }
    });
    requestAnimationFrame(loop);
  })(t0);
})();
