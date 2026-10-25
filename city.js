/* City of the Atlas · Contour edition
 * Semir Poturak / Svemir. Independent open-source architectural experience.
 * Eight authored measures generate inhabitable contour models. See METHOD.md.
 */

import * as THREE from "three";
import { M, E, FRAMES, PROGRAMS, LOTS } from "./data.js";

/* ── palette ──────────────────────────────────────────────────────────── */
const C = {
  pink:     0xe20a7f,   // eel, and only eel
  bone:     0xd8d1c1,   // operating schools — plaster
  boneWarm: 0xd8cdb4,
  rose:     0xdba5bb,   // the eel network, one step off the accent
  graphite: 0x37352f,   // ruins
  slate:    0x242a31,   // the regulatory baseline — the one polished thing
  paper:    0xa8a293,   // the sheet
  field:    0xb3ad9c,   // the measured field inside it
  ink:      0x141210,
  haze:     0xe7e8e4
};

const SPREAD = 380;          // metres spanned by a 0→5 measure axis
const GROUND = 980;          // metres, ground plane edge
const UNIT   = SPREAD / 5;   // metres per score point
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
/* A phone is not a small desk. Two things change: the arithmetic budget
   (one draw of 4x MSAA at DPR 3 is four times the work a laptop does) and
   the only input that exists — a thumb. Detected once, honoured everywhere. */
const TOUCH = matchMedia("(hover:none) and (pointer:coarse)").matches
  || /[?&]touch/.test(location.search);   // ?touch forces the thumb build on a desk
const compactViewport = () => innerWidth <= 1040;
let MOBILE = compactViewport();
if (TOUCH) document.body.classList.add("touch");
if (MOBILE) document.body.classList.add("mobile");

/* ── derived survey ───────────────────────────────────────────────────── */
const ranksByFrame = FRAMES.map(f => {
  const order = E.map((d, i) => ({ i, s: f.score(d) })).sort((a, b) => b.s - a.s);
  const r = {}; order.forEach(o => r[o.i] = 1 + order.filter(p => p.s > o.s).length); return r;
});
const rank = (i, fi) => ranksByFrame[fi][i];
const variance = i => {
  const rs = FRAMES.map((_, fi) => rank(i, fi));
  return Math.max(...rs) - Math.min(...rs);
};
const topThree = fi => E.map((_, i) => i).filter(i => rank(i, fi) <= 3);
const leader = fi => E.findIndex((_, i) => rank(i, fi) === 1);

let FI = Math.max(0, Math.min(2, (location.hash.match(/^#f([0-2])$/) || [])[1] | 0));

/* ═══════════════════════════════════════════════════════════════════════
   RENDERER + THE POST CHAIN
   The scene is rendered into a linear half-float target. Tone mapping,
   bloom, vignette, aberration and grain all happen in one composite pass
   at the end, so the image is graded once, like a photograph of a model,
   instead of each material guessing at its own exposure.
   ═══════════════════════════════════════════════════════════════════════ */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
} catch (err) {
  document.getElementById("nowebgl").style.display = "grid";
  document.getElementById("boot").classList.add("off");
  throw err;
}
/* DPR 3 on a phone is 9x the pixels of DPR 1 for a drawing whose finest
   feature is a 1 px hairline drawn in SVG — which is not in the GL buffer at
   all. 1.25 keeps the model clean and the frame inside budget. */
const DPR = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(DPR);
document.body.appendChild(renderer.domElement);
let VW = innerWidth, VH = innerHeight;
function measure() {
  const r = renderer.domElement.getBoundingClientRect();
  VW = Math.max(1, Math.round(r.width)); VH = Math.max(1, Math.round(r.height));
}
measure();
renderer.setSize(VW, VH, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;      // the composite pass does it
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
renderer.domElement.setAttribute('aria-label', 'Interactive architectural atlas. Use the entity index for a text view.');
renderer.domElement.setAttribute('role', 'img');
renderer.domElement.addEventListener('webglcontextlost', e => {
  e.preventDefault(); document.getElementById('nowebgl').style.display = 'grid';
  document.getElementById('fallback-message').textContent = 'The graphics context was interrupted. Retry the 3D view or continue in the complete text index.';
});

const HALF = renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float');
const rtOpt = {
  type: HALF ? THREE.HalfFloatType : THREE.UnsignedByteType,
  colorSpace: THREE.NoColorSpace,
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  depthBuffer: true
};
const rtScene = new THREE.WebGLRenderTarget(1, 1, { ...rtOpt, samples: (HALF && !MOBILE && !TOUCH) ? 4 : 0 });
const rtA = new THREE.WebGLRenderTarget(1, 1, { ...rtOpt, depthBuffer: false });
const rtB = new THREE.WebGLRenderTarget(1, 1, { ...rtOpt, depthBuffer: false });

const quadScene = new THREE.Scene();
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
quad.frustumCulled = false;
quadScene.add(quad);

const VERT = `varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const brightMat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, thr: { value: 0.80 }, knee: { value: 0.40 } },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float thr, knee; varying vec2 vUv;
  void main(){
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = vec4(c * smoothstep(thr, thr + knee, l), 1.0);
  }`,
  depthTest: false, depthWrite: false
});

const blurMat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 dir; varying vec2 vUv;
  void main(){
    vec4 s = texture2D(tDiffuse, vUv) * 0.227027;
    s += (texture2D(tDiffuse, vUv + dir * 1.3846) + texture2D(tDiffuse, vUv - dir * 1.3846)) * 0.3162162;
    s += (texture2D(tDiffuse, vUv + dir * 3.2308) + texture2D(tDiffuse, vUv - dir * 3.2308)) * 0.0702703;
    gl_FragColor = s;
  }`,
  depthTest: false, depthWrite: false
});

/* the grade. ACES, then a lens: vignette, corner aberration, grain.
   sRGB is done here by hand — a raw ShaderMaterial gets no output chunks. */
const gradeMat = new THREE.ShaderMaterial({
  uniforms: {
    tScene: { value: rtScene.texture }, tBloom: { value: rtA.texture },
    bloom: { value: 0.035 }, expo: { value: 1.02 }, vig: { value: 0.10 },
    chroma: { value: 0 }, grain: { value: 0.002 }, time: { value: 0 }
  },
  vertexShader: VERT,
  fragmentShader: `
  uniform sampler2D tScene, tBloom;
  uniform float bloom, expo, vig, chroma, grain, time;
  varying vec2 vUv;
  vec3 aces(vec3 x){
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }
  vec3 lin2srgb(vec3 c){
    return mix(c * 12.92,
               1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
               step(vec3(0.0031308), c));
  }
  void main(){
    vec2 d = vUv - 0.5;
    float r2 = dot(d, d);
    vec2 off = d * chroma * r2 * 2.0;           // ~1.5 px at the corners, 0 at centre
    vec3 c;
    c.r = texture2D(tScene, vUv + off).r;
    c.g = texture2D(tScene, vUv).g;
    c.b = texture2D(tScene, vUv - off).b;
    c += texture2D(tBloom, vUv).rgb * bloom;
    c = aces(c * expo);
    c *= 1.0 - vig * smoothstep(0.035, 0.42, r2);
    float n = fract(sin(dot(vUv * 1337.0 + time, vec2(12.9898, 78.233))) * 43758.5453);
    c += (n - 0.5) * grain;
    gl_FragColor = vec4(lin2srgb(c), 1.0);
  }`,
  depthTest: false, depthWrite: false
});

function sizeTargets() {
  const w = Math.floor(VW * DPR), h = Math.floor(VH * DPR);
  rtScene.setSize(w, h);
  rtA.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
  rtB.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
}
sizeTargets();

function blit(mat, target) {
  quad.material = mat;
  renderer.setRenderTarget(target || null);
  renderer.render(quadScene, quadCam);
}

let sceneStats={calls:0,triangles:0};
function present(t) {
  renderer.setRenderTarget(rtScene);
  renderer.clear();
  renderer.render(scene, camera);
  sceneStats={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};

  brightMat.uniforms.tDiffuse.value = rtScene.texture;
  blit(brightMat, rtA);
  const bw = rtA.width, bh = rtA.height;
  blurMat.uniforms.tDiffuse.value = rtA.texture;
  blurMat.uniforms.dir.value.set(1 / bw, 0); blit(blurMat, rtB);
  blurMat.uniforms.tDiffuse.value = rtB.texture;
  blurMat.uniforms.dir.value.set(0, 1 / bh); blit(blurMat, rtA);

  gradeMat.uniforms.tScene.value = rtScene.texture;
  gradeMat.uniforms.tBloom.value = rtA.texture;
  gradeMat.uniforms.time.value = 0; // stationary paper grain; no idle shimmer
  blit(gradeMat, null);
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(C.haze, 0.00024);

const camera = new THREE.PerspectiveCamera(38, VW / VH, 0.4, 3000);

/* ═══════════════════════════════════════════════════════════════════════
   ONE SKY, ONE SUN — a low dawn. The environment map and the key light
   point at the same place, so every highlight agrees with every shadow.
   ═══════════════════════════════════════════════════════════════════════ */
const SUN = new THREE.Vector3(0.65, 0.85, 0.38).normalize();   // low: long shadows

function buildEnvironment() {
  const w = 1024, h = 512;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0.00, "#b5c5cd");   // slate zenith
  grd.addColorStop(0.20, "#ced9df");
  grd.addColorStop(0.38, "#e0e6e8");
  grd.addColorStop(0.465, "#e9ebe7");
  grd.addColorStop(0.498, "#f5f2e9");  // the incandescent band at the horizon
  grd.addColorStop(0.512, "#d3d0c8");
  grd.addColorStop(0.62, "#bbb8ae");
  grd.addColorStop(1.00, "#a09d94");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);

  // the sun placed at the equirectangular coordinate SUN actually points to
  const u = Math.atan2(SUN.z, SUN.x) / (Math.PI * 2) + 0.5;
  const v = Math.asin(SUN.y) / Math.PI + 0.5;
  const sx = u * w, sy = (1 - v) * h, R = 150;
  const sg = g.createRadialGradient(sx, sy, 0, sx, sy, R);
  sg.addColorStop(0.00, "rgba(255,250,232,1)");
  sg.addColorStop(0.14, "rgba(255,243,214,.80)");
  sg.addColorStop(0.46, "rgba(252,232,196,.26)");
  sg.addColorStop(1.00, "rgba(250,230,195,0)");
  g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, R, 0, Math.PI * 2); g.fill();

  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  return { env, sky: tex };
}
const ENV = buildEnvironment();
scene.environment = ENV.env;
scene.background = ENV.sky;
scene.environmentIntensity = 0.58;

const sun = new THREE.DirectionalLight(0xfff7eb, 1.8);
sun.position.copy(SUN).multiplyScalar(680);
sun.castShadow = true;
sun.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
sun.shadow.camera.left = -470; sun.shadow.camera.right = 470;
sun.shadow.camera.top = 470;   sun.shadow.camera.bottom = -470;
sun.shadow.camera.near = 40;   sun.shadow.camera.far = 1600;
sun.shadow.bias = -0.00012; sun.shadow.normalBias = 0.30;
scene.add(sun);
// cool sky above, warm bounce from the paper below: the cheapest ambient occlusion
scene.add(new THREE.HemisphereLight(0xd8e5ed, 0xb8b2a3, .80));

/* ═══════════════════════════════════════════════════════════════════════
   THE GROUND IS A SURVEY DRAWING
   Not a grid helper. A drafted sheet with its own units, a scale bar,
   north and a sheet note — redrawn when the frame changes, because the
   axes change.
   ═══════════════════════════════════════════════════════════════════════ */
const SHEET = 2048;
const groundCv = document.createElement("canvas");
groundCv.width = groundCv.height = SHEET;
const gx = groundCv.getContext("2d");
const toPx = wx => (wx + GROUND / 2) / GROUND * SHEET;
const mName = k => (M.find(m => m[0] === k) || [k, k])[1];

function drawGround(fi) {
  const f = FRAMES[fi], S = SHEET, g = gx;
  g.fillStyle = "#d3d2c9"; g.fillRect(0, 0, S, S);

  // a faint laid-paper tooth, so the plain is never a flat fill
  g.globalAlpha = 0.045;
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = i % 2 ? "#ffffff" : "#000000";
    g.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  g.globalAlpha = 1;

  const a = toPx(-SPREAD / 2 - 36), b = toPx(SPREAD / 2 + 36), span = b - a;
  g.fillStyle = "#dddcd3"; g.fillRect(a, a, span, span);

  for (let s = 0; s <= 20; s++) {                 // quarter, half and whole rules
    const p = toPx(-SPREAD / 2 + s * UNIT / 4);
    const whole = s % 4 === 0, half = s % 2 === 0;
    g.strokeStyle = whole ? "rgba(240,234,218,.55)" : half ? "rgba(240,234,218,.26)" : "rgba(240,234,218,.19)";
    g.lineWidth = whole ? 2.4 : half ? 1.3 : 1;
    g.beginPath(); g.moveTo(p, a); g.lineTo(p, b); g.moveTo(a, p); g.lineTo(b, p); g.stroke();
  }
  g.strokeStyle = "rgba(20,18,16,.58)"; g.lineWidth = 3;
  g.strokeRect(a, a, span, span);

  g.fillStyle = "rgba(20,18,16,.66)";
  g.font = "600 22px ui-monospace, Consolas, monospace";
  for (let s = 0; s <= 5; s++) {
    const p = toPx(-SPREAD / 2 + s * UNIT);
    g.textAlign = "center"; g.textBaseline = "top";  g.fillText(String(s), p, b + 15);
    g.textAlign = "right";  g.textBaseline = "middle"; g.fillText(String(5 - s), a - 15, p);
  }
  g.font = "600 31px ui-sans-serif, 'Segoe UI', sans-serif";
  g.fillStyle = "rgba(20,18,16,.78)";
  g.textAlign = "center"; g.textBaseline = "top";
  g.fillText(mName(f.x).toUpperCase() + "  →", (a + b) / 2, b + 50);
  g.save(); g.translate(a - 56, (a + b) / 2); g.rotate(-Math.PI / 2);
  g.fillText(mName(f.y).toUpperCase() + "  →", 0, 0); g.restore();

  const o = toPx(-SPREAD / 2);                      // pink origin cross
  g.strokeStyle = "rgba(226,10,127,.8)"; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(o - 44, b); g.lineTo(o + 44, b);
  g.moveTo(o, b - 44); g.lineTo(o, b + 44); g.stroke();

  const bx = a, by = b + 92, len = 100 / GROUND * SHEET;   // 100 m scale bar
  for (let i = 0; i < 4; i++) {
    g.fillStyle = i % 2 ? "#dddcd3" : "rgba(20,18,16,.78)";
    g.fillRect(bx + i * len / 4, by, len / 4, 14);
  }
  g.strokeStyle = "rgba(20,18,16,.78)"; g.lineWidth = 2; g.strokeRect(bx, by, len, 14);
  g.fillStyle = "rgba(20,18,16,.78)";
  g.font = "600 21px ui-monospace, Consolas, monospace";
  g.textAlign = "left"; g.textBaseline = "top";
  g.fillText("0", bx - 4, by + 21); g.fillText("100 m", bx + len - 12, by + 21);

  const nx = b + 78, ny = a + 48;                   // north
  g.fillStyle = "rgba(20,18,16,.78)";
  g.beginPath(); g.moveTo(nx, ny - 46); g.lineTo(nx + 16, ny + 23); g.lineTo(nx, ny + 10);
  g.closePath(); g.fill();
  g.beginPath(); g.moveTo(nx, ny - 46); g.lineTo(nx - 16, ny + 23); g.lineTo(nx, ny + 10);
  g.closePath(); g.strokeStyle = "rgba(20,18,16,.78)"; g.lineWidth = 2.3; g.stroke();
  g.font = "600 25px ui-sans-serif, sans-serif"; g.textAlign = "center"; g.textBaseline = "top";
  g.fillText("N", nx, ny + 31);

  g.font = "600 27px ui-sans-serif, 'Segoe UI', sans-serif";
  g.fillStyle = "rgba(20,18,16,.5)"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText(`${f.no.toUpperCase()} · ${f.name.toUpperCase()} — SURVEYED BY ${f.who.toUpperCase()}`,
             a, a - 48);
}
drawGround(FI);
const groundTex = new THREE.CanvasTexture(groundCv);
groundTex.colorSpace = THREE.SRGBColorSpace;
groundTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND, GROUND),
  new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.97, metalness: 0 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

/* ═══════════════════════════════════════════════════════════════════════
   MATERIALS — differentiation by material, not by hue.
   Plaster for the living, graphite for the dead, one polished slab for
   the regulator, and the accent spent on eel alone.
   ═══════════════════════════════════════════════════════════════════════ */
const plaster = (hex, o = {}) => new THREE.MeshStandardMaterial({
  color: hex, side: THREE.DoubleSide, roughness: 0.78, metalness: 0, envMapIntensity: 0.95, ...o
});
const MAT = {
  eel: new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide, color: C.pink, roughness: 0.46, metalness: 0,
    sheen: 0.7, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xffb2d8),
    envMapIntensity: 1.0
  }),
  sat:  plaster(C.rose, { roughness: 0.64 }),
  live: plaster(C.bone),
  hist: plaster(C.graphite, { transparent: true, opacity: 0.62, roughness: 0.92, depthWrite: false }),
  base: new THREE.MeshPhysicalMaterial({
    color: C.slate, roughness: 0.12, metalness: 0.15,
    clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 1.6
  }),
  inkLine:  new THREE.LineBasicMaterial({ color: 0xf0e8d6, transparent: true, opacity: 0.5 }),
  filament: new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.72 }),
  figure:   new THREE.MeshStandardMaterial({ color: 0x1c1915, roughness: 0.82 })
};

/* a prism with very slightly eased vertical corners — sharp enough to be
   architecture, eased enough to catch one line of sun down each arris */
function prism(w, d, r) {
  const s = new THREE.Shape();
  const hw = w / 2, hd = d / 2; r = Math.max(0.02, Math.min(r, hw * 0.9, hd * 0.9));
  s.moveTo(-hw + r, -hd);
  s.lineTo(hw - r, -hd);  s.quadraticCurveTo(hw, -hd, hw, -hd + r);
  s.lineTo(hw, hd - r);   s.quadraticCurveTo(hw, hd, hw - r, hd);
  s.lineTo(-hw + r, hd);  s.quadraticCurveTo(-hw, hd, -hw, hd - r);
  s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd + r);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 3 });
  geo.rotateX(-Math.PI / 2);     // extrude +Z becomes +Y: y spans 0..1
  return geo;
}

/* merge by hand: BufferGeometryUtils lives in examples/jsm and this build
   vendors only the core. Eighteen prisms become one draw call per tower. */
function mergeGeoms(list) {
  const geos = list.map(g => g.index ? g.toNonIndexed() : g);
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  out.computeBoundingSphere();
  return out;
}

const hash = i => { const s = Math.sin(i * 127.1 + 11.7) * 43758.5453; return s - Math.floor(s); };

/* ═══════════════════════════════════════════════════════════════════════
   THE SETBACK TOWER — the silhouette IS the survey
   Eight measures, sorted descending so the mass always steps inward.
   Stage plan area = that measure's score. Stage height = its weight.
   Geometry is normalised to y ∈ [0,1]; the frame score is applied as
   scale.y, so a resurvey is one number per mass and the profile holds.
   ═══════════════════════════════════════════════════════════════════════ */
function stageOrder(d) {
  return M.map(([k, nm], mi) => ({ k, nm, mi, v: d[k] }))
          .sort((a, b) => b.v - a.v || a.mi - b.mi);
}

function buildTerraces(d, i, wall) {
  const parts = [];
  const W = wall ? 17 : 11 + d.acc * 3.1;
  const D = wall ? 252 : W * (0.70 + hash(i + 31) * 0.52);
  const R = Math.min(W, D) * 0.05;
  const add = (w, dp, y0, y1) => {
    const g = prism(w, dp, R * (w / W));
    g.scale(1, Math.max(y1 - y0, 1e-4), 1); g.translate(0, y0, 0); parts.push(g);
  };

  if (wall) {                                   // a boundary, not a competitor
    add(W * 1.12, D * 1.004, 0.000, 0.028);     // plinth
    add(W,        D,         0.028, 0.952);     // slab
    add(W * 1.07, D * 1.006, 0.952, 1.000);     // cornice
  } else {
    add(W * 1.14, D * 1.14, 0, 0.020);          // plinth
    const order = stageOrder(d);
    const top = order[0].v;
    const wts = order.map(o => 0.20 + o.v / 5);
    const sum = wts.reduce((a, b) => a + b, 0);
    const span = 0.935 - 0.020;
    let y = 0.020;
    order.forEach((o, k) => {
      const s = Math.sqrt((0.13 + 0.87 * o.v / 5) / (0.13 + 0.87 * top / 5));
      const h = span * wts[k] / sum;
      add(W * s, D * s, y, y + h);
      add(W * s * 1.05, D * s * 1.05, y + h - 0.0035, y + h);   // the setback ledge
      y += h;
    });
    add(W * 0.13, D * 0.13, 0.935, 1.0);        // the mast
  }
  const geo = mergeGeoms(parts);
  geo.userData = { W, D, order: wall ? null : stageOrder(d) };
  return geo;
}


// Contour pavilions. No random shape choices: every contour reads the dataset.
let geometryMode = 'contour';
function contourRadius(d, a) {
  const u=((a/(Math.PI*2)*8)%8+8)%8, i=Math.floor(u), t=u-i;
  const blend=(1-Math.cos(t*Math.PI))/2;
  return .30+.70*(d[M[i][0]]*(1-blend)+d[M[(i+1)%8][0]]*blend)/5;
}
function buildTower(d,i,wall){
  if(wall || geometryMode==='terraces')return buildTerraces(d,i,wall);
  const W=23+d.acc*4, D=W, radius=W/2, floors=8+4*d.evi;
  const twist=(d.aut-d.rec)*Math.PI/15, opening=.14+.045*d.acc;
  const positions=[], segments=64;
  function vertex(a,y,inner=false){
    const taper=1-(.10+.035*d.mat)*y+.24*d.wld/5*Math.sin(Math.PI*y)-.20*d.epi/5*Math.sin(2*Math.PI*y);
    const contour=contourRadius(d,a);
    const r=radius*(inner?Math.min(opening,contour*.60):contour)*taper;
    const q=a+twist*y;
    return [Math.cos(q)*r,y,Math.sin(q)*r];
  }
  function tri(a,b,c){positions.push(...a,...b,...c);}
  function quad(a,b,c,d){tri(a,b,c);tri(a,c,d);}
  function ring(y0,y1){
    for(let j=0;j<segments;j++){
      const a=j/segments*Math.PI*2,b=(j+1)/segments*Math.PI*2;
      const A=vertex(a,y0),B=vertex(b,y0),C=vertex(b,y1),D=vertex(a,y1);
      const I=vertex(a,y0,true),J=vertex(b,y0,true),K=vertex(b,y1,true),L=vertex(a,y1,true);
      quad(A,D,C,B);quad(I,J,K,L);quad(D,L,K,C);quad(A,B,J,I);
    }
  }
  ring(0,.026);
  for(let n=1;n<=floors;n++){const y=n/floors;ring(Math.max(.03,y-.009),y);}
  // Matter controls rib count; the contour stays legible between slabs.
  const ribs=12+4*d.mat;
  for(let n=0;n<ribs;n++){
    const a=n/ribs*Math.PI*2, da=.020;
    for(let j=0;j<24;j++){
      const y0=.026+j/24*.974,y1=.026+(j+1)/24*.974;
      const A=vertex(a-da,y0),B=vertex(a+da,y0),C=vertex(a+da,y1),D=vertex(a-da,y1);
      quad(A,D,C,B);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();geo.computeBoundingSphere();
  geo.userData={W,D,order:stageOrder(d),floors,twist,opening};return geo;
}

/* where a mass stands and how tall it is, in a given frame */
function anchorLayout(d, i, fi) {
  const f = FRAMES[fi];
  const jx = (hash(i) - 0.5) * 26, jz = (hash(i + 97) - 0.5) * 26;
  const h = 9 + (f.score(d) / f.max) * 86;
  if (d.kind === "base") {
    const k = E.filter(e => e.kind === "base").indexOf(d);
    return { x: -SPREAD / 2 - 46, z: k === 0 ? -132 : 132, h, wall: true };
  }
  return { x: (d[f.x] / 5 - 0.5) * SPREAD + jx, z: -(d[f.y] / 5 - 0.5) * SPREAD + jz, h, wall: false };
}

// Resolve overlapping footprints deterministically; score axes remain neighborhood anchors.
const layouts=FRAMES.map((_,fi)=>{
  const points=E.map((d,i)=>anchorLayout(d,i,fi));
  for(let pass=0;pass<80;pass++)for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++){
    const A=points[a],B=points[b];if(A.wall||B.wall)continue;
    let dx=B.x-A.x,dz=B.z-A.z,dist=Math.hypot(dx,dz);
    const gap=(23+E[a].acc*4+23+E[b].acc*4)/2+9;
    if(dist<gap){if(dist<.001){dx=1;dz=0;dist=1;}const force=(gap-dist)*.51;A.x-=dx/dist*force;A.z-=dz/dist*force;B.x+=dx/dist*force;B.z+=dz/dist*force;}
  }
  return points;
});
function layout(d,i,fi){return layouts[fi][i];}

const city = new THREE.Group(); scene.add(city);
const masses = [];
const colliders = [];

E.forEach((d, i) => {
  const L = layout(d, i, FI);
  const geo = buildTower(d, i, L.wall);
  const { W, D } = geo.userData;
  const mat = d.kind === "eel" ? MAT.eel : d.kind === "sat" ? MAT.sat
            : d.kind === "hist" ? MAT.hist : d.kind === "base" ? MAT.base : MAT.live;

  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  m.position.set(L.x, 0, L.z); m.scale.y = L.h;
  m.userData = { i, d, w: W, dp: D, wall: L.wall, order: geo.userData.order };
  city.add(m); masses.push(m);
  colliders.push({ x: L.x, z: L.z, r: Math.max(W, D) * 0.5 + 1.5, wall: L.wall, w: W, dp: D });

  // ruins keep a pale outline once the solid has gone translucent
  if (d.kind === "hist") {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 24), MAT.inkLine);
    e.position.set(L.x, 0, L.z); e.scale.y = L.h;
    city.add(e); m.userData.edge = e;
    m.renderOrder = 2;
  }
});

/* ── nameplates: diegetic signs, one small canvas each ────────────────── */
const plates = [];
function paintPlate(i, g, cv) {
  const cw = cv.width, ch = cv.height, d = E[i];
  g.clearRect(0, 0, cw, ch);
  g.fillStyle = "rgba(236,230,217,.97)"; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = "rgba(20,18,16,.85)"; g.lineWidth = 3; g.strokeRect(1.5, 1.5, cw - 3, ch - 3);
  g.fillStyle = "#e20a7f"; g.fillRect(3, 3, 7, ch - 6);
  g.fillStyle = "#141210";
  g.font = "600 30px ui-sans-serif, 'Segoe UI', sans-serif";
  g.textBaseline = "middle"; g.textAlign = "left";
  let t = d.n; while (g.measureText(t).width > cw - 40 && t.length > 4) t = t.slice(0, -2);
  g.fillText(t === d.n ? t : t + "…", 24, ch * 0.37);
  g.font = "500 19px ui-monospace, Consolas, monospace";
  g.fillStyle = "rgba(20,18,16,.58)";
  g.fillText(`#${rank(i, FI)} IN FRAME 0${FI + 1}`, 24, ch * 0.74);
}
E.forEach((d, i) => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 80;
  const g = cv.getContext("2d");
  paintPlate(i, g, cv);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0, depthTest: true, fog: false
  }));
  sp.scale.set(42, 42 * 80 / 512, 1);
  sp.position.set(masses[i].position.x, Math.min(layout(d, i, FI).h + 10, 32), masses[i].position.z);
  sp.userData = { i, cv, g, tex };
  scene.add(sp); plates.push(sp);
});
const repaintPlate = i => {
  const sp = plates[i]; paintPlate(i, sp.userData.g, sp.userData.cv);
  sp.userData.tex.needsUpdate = true;
};

/* ═══════════════════════════════════════════════════════════════════════
   FILAMENTS — eel's own hairline wires, doing analytical work:
   each one is a line of descent or dependence between two masses.
   ═══════════════════════════════════════════════════════════════════════ */
const idx = n => E.findIndex(e => e.n === n);
const LINES = [
  ["Archigram", "eel_ lab (Spiller/Watson)"],
  ["Archigram", "Architectural Association"],
  ["eel_ lab (Spiller/Watson)", "eel"],
  ["eel_ lab (Spiller/Watson)", "Bartlett B-Pro"],
  ["eel", "Underground School NY"],
  ["eel", "Form:uLA (Cantley)"],
  ["eel", "Belgrade academic lead"],
  ["Free School of Arch. (LA)", "eel"],
  ["School of Arch. at Taliesin", "Grymsdyke Farm"],
  ["Belgrade academic lead", "EU Dir. 2005/36/EC Art.46"],
  ["eel", "RIBA / ARB Part 1-2-3"]
].map(([a, b]) => [idx(a), idx(b)]).filter(([a, b]) => a >= 0 && b >= 0);

const filaments = new THREE.Group(); scene.add(filaments);
const filamentCurves = [];
function buildFilaments() {
  filaments.children.forEach(c => c.geometry.dispose());
  filaments.clear();
  filamentCurves.length = 0;
  LINES.forEach(([a, b]) => {
    const pa = masses[a].position, pb = masses[b].position;
    const A = new THREE.Vector3(pa.x, masses[a].scale.y * 0.80, pa.z);
    const B = new THREE.Vector3(pb.x, masses[b].scale.y * 0.80, pb.z);
    const mid = A.clone().lerp(B, 0.5);
    mid.y = Math.max(A.y, B.y) + Math.min(13, A.distanceTo(B) * 0.035);
    const curve = new THREE.CatmullRomCurve3(
      [A, A.clone().lerp(mid, 0.5), mid, mid.clone().lerp(B, 0.5), B]);
    filamentCurves.push(curve);
    filaments.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.28, 4, false), MAT.filament));
  });
}
buildFilaments();
filaments.visible=false;

/* ═══════════════════════════════════════════════════════════════════════
   THE EEL QUARTER — 11 published programmes around the eel mass.
   Built = the apparatus exists.  Site = a pegged-out vacant lot.
   ═══════════════════════════════════════════════════════════════════════ */
const eelIdx = 0;
const quarter = new THREE.Group(); scene.add(quarter);
const pavilions = [];
const pegMat = new THREE.MeshStandardMaterial({ color: C.pink, roughness: 0.42, metalness: 0.05 });
const lotMat = new THREE.MeshBasicMaterial({
  color: C.pink, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
const pavGeo = (() => {
  const g = prism(18, 18, 1.0); g.scale(1, 0.92, 1);
  const cap = prism(19.3, 19.3, 1.0); cap.scale(1, 0.08, 1); cap.translate(0, 0.92, 0);
  return mergeGeoms([g, cap]);
})();
const pavMat = new THREE.MeshPhysicalMaterial({
  color: C.pink, roughness: 0.4, metalness: 0, sheen: 0.6,
  sheenColor: new THREE.Color(0xffb2d8), envMapIntensity: 1.0 });

function placeQuarter() {
  const o = masses[eelIdx].position;
  if (pavilions.length) {
    const dx = o.x - quarter.userData.x, dz = o.z - quarter.userData.z;
    for (const node of pavilions) {
      node.position.x += dx; node.position.z += dz;
      if (node.userData.collider) {
        node.userData.collider.x = node.position.x;
        node.userData.collider.z = node.position.z;
      }
    }
    quarter.userData.x = o.x; quarter.userData.z = o.z;
    return;
  }
  quarter.userData.x = o.x; quarter.userData.z = o.z;
  const all = PROGRAMS.concat(LOTS.map(l => ({ ...l, st: "site", q: "—" })));
  all.forEach((p, k) => {
    const ang = (k / all.length) * Math.PI * 2 + 0.42;
    const rad = 80 + (k % 3) * 12;
    const x = o.x + Math.cos(ang) * rad, z = o.z + Math.sin(ang) * rad;
    let node;
    if (p.st === "built") {
      node = new THREE.Mesh(pavGeo, pavMat);
      node.scale.y = 16; node.castShadow = true; node.receiveShadow = true;
      node.position.set(x, 0, z);
      node.userData.collider = { x, z, r: 11 };
      colliders.push(node.userData.collider);
    } else {
      node = new THREE.Group(); node.position.set(x, 0, z);
      const plot = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lotMat);
      plot.rotation.x = -Math.PI / 2; plot.position.y = 0.1; node.add(plot);
      const ring = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(24, 24)),
        new THREE.LineBasicMaterial({ color: C.pink }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.14; node.add(ring);
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 15, 6), pegMat);
      peg.position.y = 7.5; peg.castShadow = true; node.add(peg);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.7, 14), pegMat);
      disc.position.y = 15.2; disc.castShadow = true; node.add(disc);
    }
    node.userData.prog = p;
    quarter.add(node); pavilions.push(node);
  });
}
placeQuarter();

/* ── figures: the same small dark person eel puts in their drawings ───── */
const figures = new THREE.Group(); scene.add(figures);
function figure(x, z, rot = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.94, 3, 7), MAT.figure);
  body.position.y = 0.92; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 9, 7), MAT.figure);
  head.position.y = 1.63; head.castShadow = true; g.add(head);
  g.position.set(x, 0, z); g.rotation.y = rot;
  return g;
}
function placeFigures() {
  const o = masses[eelIdx].position;
  if (figures.children.length) {
    const dx = o.x - figures.userData.x, dz = o.z - figures.userData.z;
    figures.children.slice(0, 3).forEach(g => { g.position.x += dx; g.position.z += dz; });
    figures.userData.x = o.x; figures.userData.z = o.z;
    return;
  }
  figures.userData.x = o.x; figures.userData.z = o.z;
  [[28, 15, 0.7], [-20, 33, 2.1], [46, -24, 4.0]].forEach(([dx, dz, r]) =>
    figures.add(figure(o.x + dx, o.z + dz, r)));
  figures.add(figure(-SPREAD / 2 - 22, -24, 1.6));   // one person at the regulatory edge
}
placeFigures();

/* ═══════════════════════════════════════════════════════════════════════
   URBAN LIFE — the city is inhabited by its own numbers.
   Nothing here is atmosphere for its own sake. Every moving body and every
   lit lamp is one unit of the survey, and the count is read off the data:

     two walking figures = one point of ACCESS     (who may enter the work)
                           — one per point on a phone, so the ratio stays
                             exact at half the population rather than
                             truncating the last districts to fit a cap
     one street lamp     = one point of EVIDENCE   (what is documented is lit)
     one travelling dot  = traffic on a proposed line of descent

   So a school with access 5 is busy and a school with evidence 1 stands in
   the dark, and both facts are visible from the air without reading a word.
   The mapping is restated in METHOD.md. It is authored, like every score.
   ═══════════════════════════════════════════════════════════════════════ */
const LIFE = { on: !reduce, dusk: false, t: 0 };
const dummy = new THREE.Object3D();

/* ── the crowd ─────────────────────────────────────────────────────────
   One instanced mesh for the whole population: 21 schools' worth of
   figures is one draw call. Each agent belongs to a mass, walks to a
   neighbouring mass and back, and is pushed out of anything solid by the
   same colliders the player uses — so the crowd obeys the city plan. */
const agentGeo = (() => {
  const b = new THREE.CapsuleGeometry(0.25, 0.94, 2, 6); b.translate(0, 0.92, 0);
  const h = new THREE.SphereGeometry(0.2, 7, 5);         h.translate(0, 1.63, 0);
  return mergeGeoms([b, h]);
})();
const agents = [];
const AGENT_CAP = MOBILE ? 120 : 280;
const crowd = new THREE.InstancedMesh(
  agentGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0 }),
  AGENT_CAP);
crowd.castShadow = !MOBILE; crowd.frustumCulled = false;
crowd.count = 0;
scene.add(crowd);

const neighbours = E.map((_, i) => {
  const n = LINES.filter(([a, b]) => a === i || b === i).map(([a, b]) => a === i ? b : a);
  return n.length ? n : [(i + 7) % E.length];
});

function spawnAgents() {
  const cTone = new THREE.Color();
  E.forEach((d, i) => {
    const n = Math.min(12, Math.max(2, d.acc * (MOBILE ? 1 : 2)));   // ACCESS, in bodies
    for (let k = 0; k < n && agents.length < AGENT_CAP; k++) {
      const h = hash(i * 31 + k * 7), h2 = hash(i * 17 + k * 97);
      const a = {
        home: i, to: neighbours[i][k % neighbours[i].length],
        x: 0, z: 0, yaw: h * 6.28, sp: 2.1 + h2 * 2.4, lane: (h - 0.5) * 11,
        wait: h2 * 3
      };
      const p = masses[i].position;
      a.x = p.x + Math.cos(h * 6.28) * (masses[i].userData.w * 0.5 + 9 + h2 * 16);
      a.z = p.z + Math.sin(h * 6.28) * (masses[i].userData.dp * 0.5 + 9 + h * 16);
      crowd.setColorAt(agents.length,
        cTone.setHex(d.kind === "eel" ? 0xb4075d : d.kind === "sat" ? 0x5b3340 : 0x1c1915));
      agents.push(a);
    }
  });
  crowd.count = agents.length;
  if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
}
spawnAgents();

function stepCrowd(dt) {
  for (let n = 0; n < agents.length; n++) {
    const a = agents[n];
    const tgt = masses[a.to].position;
    let dx = tgt.x - a.x, dz = tgt.z - a.z;
    const dd = Math.hypot(dx, dz) || 1;
    // walk offset from the centre line: a street, not a spoke
    const px = -dz / dd, pz = dx / dd;
    let gx = dx / dd + px * (a.lane / Math.max(40, dd));
    let gz = dz / dd + pz * (a.lane / Math.max(40, dd));
    const gl = Math.hypot(gx, gz) || 1; gx /= gl; gz /= gl;

    if (a.wait > 0) { a.wait -= dt; }
    else {
      a.x += gx * a.sp * dt; a.z += gz * a.sp * dt;
      a.yaw += (Math.atan2(gx, gz) - a.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    }
    // the same solids the player cannot walk through
    for (let c = 0; c < colliders.length; c++) {
      const col = colliders[c];
      const ox = a.x - col.x, oz = a.z - col.z;
      if (col.wall) {
        const hx = col.w / 2 + 1, hz = col.dp / 2 + 1;
        if (Math.abs(ox) < hx && Math.abs(oz) < hz) {
          if (hx - Math.abs(ox) < hz - Math.abs(oz)) a.x = col.x + Math.sign(ox || 1) * hx;
          else a.z = col.z + Math.sign(oz || 1) * hz;
        }
      } else {
        const od = Math.hypot(ox, oz);
        if (od < col.r + 1.2) {
          const r = col.r + 1.2;
          a.x = col.x + ox / (od || 1) * r; a.z = col.z + oz / (od || 1) * r;
        }
      }
    }
    if (Math.hypot(tgt.x - a.x, tgt.z - a.z) < masses[a.to].userData.w * 0.5 + 12) {
      const nb = neighbours[a.to];
      const prev = a.to;
      a.to = Math.random() < 0.45 ? a.home : nb[(Math.random() * nb.length) | 0];
      if (a.to === prev) a.to = a.home;
      a.lane = -a.lane; a.wait = 0.4 + Math.random() * 2.2;
    }
    dummy.position.set(a.x, 0, a.z);
    dummy.rotation.set(0, a.yaw, 0);
    dummy.updateMatrix();
    crowd.setMatrixAt(n, dummy.matrix);
  }
  crowd.instanceMatrix.needsUpdate = true;
}
stepCrowd(0);          // a still city is still populated

/* ── street lighting ───────────────────────────────────────────────────
   Lamps stand on the kerb of each mass, one per point of evidence. They
   are instanced posts plus instanced heads plus a flat pool of light; no
   real point lights, which would cost a shader recompile per lamp. */
const LAMP_H = 7.2;
const lampPost = new THREE.InstancedMesh(
  (() => { const g = new THREE.CylinderGeometry(0.11, 0.17, LAMP_H, 5); g.translate(0, LAMP_H / 2, 0); return g; })(),
  new THREE.MeshStandardMaterial({ color: 0x4a4740, roughness: 0.5, metalness: 0.35 }), 220);
const lampHeadMat = new THREE.MeshStandardMaterial({
  color: 0xfdf3dd, emissive: new THREE.Color(0xffd79a), emissiveIntensity: 0.12, roughness: 0.4 });
const lampHead = new THREE.InstancedMesh(
  (() => { const g = new THREE.BoxGeometry(1.5, 0.22, 0.5); g.translate(0, LAMP_H, 0); return g; })(),
  lampHeadMat, 220);
const poolTex = (() => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const g = cv.getContext("2d");
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,230,186,.72)");
  rg.addColorStop(0.42, "rgba(255,212,148,.22)");
  rg.addColorStop(1, "rgba(255,205,140,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const poolMat = new THREE.MeshBasicMaterial({
  map: poolTex, transparent: true, opacity: 0, depthWrite: false,
  blending: THREE.AdditiveBlending, toneMapped: false });
const lampPool = new THREE.InstancedMesh(
  (() => { const g = new THREE.PlaneGeometry(15, 15); g.rotateX(-Math.PI / 2); return g; })(),
  poolMat, 220);
[lampPost, lampHead, lampPool].forEach(m => { m.frustumCulled = false; m.count = 0; scene.add(m); });
lampPost.castShadow = false; lampPool.renderOrder = 1;

const lamps = [];
function placeLamps() {
  lamps.length = 0;
  E.forEach((d, i) => {
    const n = Math.min(7, Math.max(0, d.evi));          // EVIDENCE, in lamps
    const m = masses[i], R = Math.max(m.userData.w, m.userData.dp) * 0.5 + 9;
    for (let k = 0; k < n; k++) {
      const a = (k / Math.max(1, n)) * Math.PI * 2 + hash(i) * 3.1;
      lamps.push({ i, dx: Math.cos(a) * R, dz: Math.sin(a) * R, rot: -a });
    }
  });
  relightLamps();
}
function relightLamps() {
  let n = 0;
  for (const L of lamps) {
    if (n >= 220) break;
    const p = masses[L.i].position;
    dummy.position.set(p.x + L.dx, 0, p.z + L.dz);
    dummy.rotation.set(0, L.rot, 0); dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lampPost.setMatrixAt(n, dummy.matrix);
    lampHead.setMatrixAt(n, dummy.matrix);
    dummy.position.y = 0.08; dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
    lampPool.setMatrixAt(n, dummy.matrix);
    n++;
  }
  lampPost.count = lampHead.count = lampPool.count = n;
  lampPost.instanceMatrix.needsUpdate = true;
  lampHead.instanceMatrix.needsUpdate = true;
  lampPool.instanceMatrix.needsUpdate = true;
}
placeLamps();

/* ── traffic on the filaments ─────────────────────────────────────────── */
const pulseMat = new THREE.MeshBasicMaterial({ color: C.pink, toneMapped: false });
const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(0.85, 7, 5), pulseMat, 64);
pulses.frustumCulled = false; pulses.count = 0; pulses.visible = false; scene.add(pulses);
const pulseState = [];
function stepPulses(dt) {
  if (!filaments.visible || !filamentCurves.length) { pulses.visible = false; return; }
  pulses.visible = true;
  let n = 0;
  for (let c = 0; c < filamentCurves.length && n < 64; c++) {
    for (let k = 0; k < 2 && n < 64; k++) {
      pulseState[n] = pulseState[n] === undefined ? (c * 0.17 + k * 0.5) % 1 : pulseState[n];
      pulseState[n] = (pulseState[n] + dt * 0.11) % 1;
      const p = filamentCurves[c].getPointAt(pulseState[n]);
      dummy.position.copy(p); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
      dummy.updateMatrix(); pulses.setMatrixAt(n, dummy.matrix); n++;
    }
  }
  pulses.count = n;
  pulses.instanceMatrix.needsUpdate = true;
}

/* ── dusk ──────────────────────────────────────────────────────────────
   One switch moves the whole image, not the lamps alone: key light down
   and warmer, sky and environment down, exposure and bloom up. The lamps
   only read as light because everything around them agreed to be dark. */
const DAY = { sun: 1.8, sunCol: 0xfff7eb, hemi: 0.80, env: 0.58, bg: 1.0,
              fog: C.haze, fogD: 0.00024, expo: 1.02, bloom: 0.035, emis: 0.12, pool: 0 };
const DUSK = { sun: 0.42, sunCol: 0xffc98f, hemi: 0.26, env: 0.20, bg: 0.34,
               fog: 0x2e3340, fogD: 0.00058, expo: 1.30, bloom: 0.17, emis: 3.4, pool: 0.75 };
const hemi = scene.children.find(o => o.isHemisphereLight);
function applyLight(k = LIFE.dusk ? DUSK : DAY) {
  sun.intensity = k.sun; sun.color.setHex(k.sunCol);
  hemi.intensity = k.hemi;
  scene.environmentIntensity = k.env;
  scene.backgroundIntensity = k.bg;
  scene.fog.color.setHex(k.fog); scene.fog.density = k.fogD;
  gradeMat.uniforms.expo.value = k.expo;
  gradeMat.uniforms.bloom.value = k.bloom;
  lampHeadMat.emissiveIntensity = k.emis;
  poolMat.opacity = k.pool;
  groundMesh.material.color.setHex(LIFE.dusk ? 0x8d8b84 : 0xffffff);
  renderer.shadowMap.needsUpdate = true;
}
function setDusk(on) {
  LIFE.dusk = on;
  document.body.classList.toggle("dusk", on);
  applyLight();
  invalidate(900);
}

/* everything that is placed relative to a mass has to move when the city
   is resurveyed; one call, so nothing is forgotten */
function relocateLife() { relightLamps(); }

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA — two positions toward the same institution.
   Orbit = the critic above the model.  Walk = the student inside it.
   ═══════════════════════════════════════════════════════════════════════ */
const orbit = { az: -.64, pol: .88, dist: 420, tx: 0, ty: 34, tz: 0 };

function framing(fi) {
  // on a phone the wall is 300 m off to one side; including it in the extents
  // shrinks the city to a model of itself. Frame the city, let the wall arrive
  // when they orbit toward it.
  const p = E.map((d, i) => layout(d, i, fi))
             .filter((q, i) => !(MOBILE && q.wall));
  const xs = p.map(q => q.x), zs = p.map(q => q.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 150);
  let dist = Math.max(650, Math.min(900, r * 1.80));
  const asp = VW / VH;
  if (MOBILE) {
    /* Fit the plan to what is actually free. A phone's frame is narrow in
       one axis and eaten by furniture in the other, so solve the distance
       from both half-angles and take the one that binds. */
    const vf = camera.fov * Math.PI / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * asp);
    const uV = Math.max(0.45, (VH - 132) / VH);     // top bar + tab bar
    const dV = r * 0.52 / Math.tan(vf / 2 * uV);
    const dH = r * 0.52 / Math.tan(hf / 2 * 0.94);
    dist = Math.max(360, Math.min(1500, Math.max(dV, dH)));
  }
  // slide the aim along camera-right, so the model sits clear of the left margin.
  // on mobile there is no left margin — the furniture is top and bottom.
  const rx = Math.cos(orbit.az), rz = -Math.sin(orbit.az);
  const off = 0;
  const ty = MOBILE ? 18 : 25;
  return { tx: cx - rx * off, tz: cz - rz * off, dist, ty };
}
Object.assign(orbit, framing(FI));
let MODE = "orbit";

function applyOrbit() {
  const sp = Math.sin(orbit.pol), cp = Math.cos(orbit.pol);
  camera.position.set(
    orbit.tx + orbit.dist * sp * Math.sin(orbit.az),
    orbit.ty + orbit.dist * cp,
    orbit.tz + orbit.dist * sp * Math.cos(orbit.az));
  camera.lookAt(orbit.tx, orbit.ty, orbit.tz);
}
applyOrbit();

/* One pointer model for mouse and thumb. A mouse never raises a second
   pointer, so the pinch branch simply never fires for it; a thumb never
   raises a wheel event, so the pinch branch is the only zoom it has. */
let drag = null;
const pts = new Map();          // live pointers on the canvas
let pinch = 0;                  // last two-finger separation, px
let suppressPick = false;
let userMoved = false;          // once the camera is theirs, stop re-framing it

renderer.domElement.addEventListener("pointerdown", e => {
  if (!pts.size) suppressPick = false;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  renderer.domElement.setPointerCapture(e.pointerId);
  if (MODE === "walk") { walkDown(e); return; }
  if (pts.size === 2) { pinch = pinchDist(); drag = null; suppressPick = true; return; }
  drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId, touch: e.pointerType !== "mouse" };
  renderer.domElement.setPointerCapture(e.pointerId);
});
function pinchDist() {
  const [a, b] = [...pts.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}
addEventListener("pointermove", e => {
  if (pts.has(e.pointerId)) pts.get(e.pointerId).x = e.clientX, pts.get(e.pointerId).y = e.clientY;
  if (MODE === "walk") {
    if (e.pointerType === "mouse" && document.pointerLockElement) look(e.movementX, e.movementY);
    else walkMove(e);
    return;
  }
  if (pts.size === 2) {                       // pinch: zoom, and tilt with the pair
    const d = pinchDist();
    if (pinch && d > 1) { zoomBy(pinch / d); userMoved = true; }
    pinch = d;
    return;
  }
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  // a thumb travels further than a mouse for the same intent
  const g = drag.touch ? 1.45 : 1;
  orbit.az -= dx * 0.0045 * g;
  orbit.pol = Math.max(0.10, Math.min(1.50, orbit.pol - dy * 0.0035 * g));
  drag.x = e.clientX; drag.y = e.clientY; userMoved = true;
  if (drag.moved > 10) leavePlanUI();   // the moment they tilt it, it is no longer a plan
  applyOrbit();
});
function endPointer(e) {
  if (e.type === 'pointercancel') suppressPick = true;
  pts.delete(e.pointerId);
  if (pts.size < 2) pinch = 0;
  if (MODE === "walk") { walkUp(e); return; }
  if (drag && e.pointerId === drag.id) { lastDrag = drag; drag = null; }
}
let lastDrag = null;
addEventListener("pointerup", endPointer);
addEventListener("pointercancel", endPointer);

function zoomBy(f) {
  orbit.dist = Math.max(70, Math.min(1800, orbit.dist * f));
  applyOrbit();
}
renderer.domElement.addEventListener("wheel", e => {
  if (MODE !== "orbit") return;
  e.preventDefault();
  zoomBy(1 + Math.sign(e.deltaY) * 0.1);
  userMoved = true;
}, { passive: false });

/* ── walk: eye height, head bob, the model from inside ────────────────── */
const EYE = 1.70;
const walker = { x: 0, z: 190, yaw: Math.PI, pitch: -0.05, vx: 0, vz: 0, bob: 0, dist: 0 };
const shadowCenter = new THREE.Vector3(Infinity,0,Infinity);
function focusShadow(walk) {
  const x = walk ? walker.x : 0, z = walk ? walker.z : 0;
  if (walk && Math.hypot(x-shadowCenter.x,z-shadowCenter.z)<12) return;
  shadowCenter.set(x,0,z);
  sun.target.position.set(x,0,z);sun.target.updateMatrixWorld();
  sun.position.copy(SUN).multiplyScalar(680).add(shadowCenter);
  const extent = walk ? 170 : 470;
  Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});
  sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;
}
const keys = Object.create(null);
addEventListener("keydown", e => { keys[e.code] = true; });
addEventListener("keyup", e => { keys[e.code] = false; });

/* ── walking with a thumb ──────────────────────────────────────────────
   Pointer lock does not exist on a phone, so the two halves of the gesture
   are split by where the thumb lands: a stick in the lower-left quadrant
   walks, anything else looks. Same loop, same collider, no keyboard. */
const stickEl = document.getElementById("stick");
const stickNub = stickEl && stickEl.querySelector("i");
const tm = { fx: 0, fz: 0, run: false };
let stickId = null, lookId = null, stickOrigin = null;
stickEl.addEventListener('pointerdown', e => {
  if (MODE !== 'walk') return;
  e.preventDefault(); stickEl.setPointerCapture(e.pointerId); walkDown(e);
});

function inStick(e) {
  const r = stickEl.getBoundingClientRect();
  const pad = 26;
  return e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
         e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
}
function walkDown(e) {
  if (e.pointerType === "mouse" && document.pointerLockElement) return;
  if (TOUCH && stickId === null && stickEl && inStick(e)) {
    const r = stickEl.getBoundingClientRect();
    stickId = e.pointerId;
    stickOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    stickEl.classList.add("live");
    stickAt(e);
  } else if (lookId === null) {
    lookId = e.pointerId;
    lookLast = { x: e.clientX, y: e.clientY };
  }
}
let lookLast = null;
function stickAt(e) {
  const R = 46;
  let dx = e.clientX - stickOrigin.x, dy = e.clientY - stickOrigin.y;
  const d = Math.hypot(dx, dy);
  if (d > R) { dx *= R / d; dy *= R / d; }
  tm.fx = dx / R; tm.fz = -dy / R;
  tm.run = d > R * 0.92;
  if (stickNub) stickNub.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
}
function walkMove(e) {
  if (e.pointerId === stickId) { stickAt(e); return; }
  if (e.pointerId === lookId && lookLast) {
    look((e.clientX - lookLast.x) * 1.5, (e.clientY - lookLast.y) * 1.5);
    lookLast = { x: e.clientX, y: e.clientY };
  }
}
function walkUp(e) {
  if (e.pointerId === stickId) {
    stickId = null; tm.fx = tm.fz = 0; tm.run = false;
    stickEl.classList.remove("live");
    if (stickNub) stickNub.style.transform = "";
  }
  if (e.pointerId === lookId) { lookId = null; lookLast = null; }
}

function look(mx, my) {
  walker.yaw -= mx * 0.0022;
  walker.pitch = Math.max(-1.0, Math.min(1.0, walker.pitch - my * 0.0022));
}
function enterWalk() {
  resetInput();
  document.body.classList.remove('notes-open');
  document.getElementById('notes-btn').setAttribute('aria-expanded', 'false');
  MODE = "walk"; document.body.classList.add("walking");
  const o = masses[eelIdx].position;
  walker.x = o.x + 96; walker.z = o.z + 96; walker.dist = 0;   // outside the quarter ring
  walker.yaw = Math.atan2(walker.x - o.x, walker.z - o.z) + Math.PI;
  walker.pitch = 0.16;
  shadowCenter.x=Infinity;focusShadow(true);
  camera.fov = TOUCH ? 74 : 66; camera.updateProjectionMatrix();
  if (!TOUCH && navigator.userActivation?.isActive) {
    try { renderer.domElement.requestPointerLock?.()?.catch(() => {}); } catch (_) {}
  }
  tm.fx = tm.fz = 0; tm.run = false; stickId = lookId = null;
  closePanel();
}
function exitWalk() {
  resetInput();
  MODE = "orbit"; document.body.classList.remove("walking");
  camera.fov = 38; camera.updateProjectionMatrix();
  tm.fx = tm.fz = 0; tm.run = false;
  document.exitPointerLock?.();
  applyOrbit();
  nearEl.classList.remove('on');
  focusShadow(false);
  document.getElementById('walk').focus({preventScroll:true});
}
document.getElementById("walk").onclick = enterWalk;
document.addEventListener("pointerlockchange", () => {
  if (!TOUCH && MODE === "walk" && !document.pointerLockElement) exitWalk();
});

function stepWalk(dt) {
  const run = keys.ShiftLeft || keys.ShiftRight || tm.run;
  const sp = run ? 18 : 6.8;
  let fx = tm.fx, fz = tm.fz;
  if (keys.KeyW || keys.ArrowUp) fz += 1;
  if (keys.KeyS || keys.ArrowDown) fz -= 1;
  if (keys.KeyA || keys.ArrowLeft) fx -= 1;
  if (keys.KeyD || keys.ArrowRight) fx += 1;
  // the stick is analogue: normalise only when it is pushed past full
  const l = Math.max(1, Math.hypot(fx, fz)); fx /= l; fz /= l;
  const s = Math.sin(walker.yaw), c = Math.cos(walker.yaw);
  const wx = -fx * c + fz * s, wz = fx * s + fz * c;
  const k = 1 - Math.pow(0.0009, dt);
  walker.vx += (wx * sp - walker.vx) * k;
  walker.vz += (wz * sp - walker.vz) * k;
  let nx = walker.x + walker.vx * dt, nz = walker.z + walker.vz * dt;

  for (const col of colliders) {
    if (col.wall) {
      const hx = col.w / 2 + 1.2, hz = col.dp / 2 + 1.2;
      const dx = nx - col.x, dz = nz - col.z;
      if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
        if (hx - Math.abs(dx) < hz - Math.abs(dz)) nx = col.x + Math.sign(dx || 1) * hx;
        else nz = col.z + Math.sign(dz || 1) * hz;
      }
    } else {
      const dx = nx - col.x, dz = nz - col.z, dd = Math.hypot(dx, dz);
      if (dd < col.r) { nx = col.x + dx / (dd || 1) * col.r; nz = col.z + dz / (dd || 1) * col.r; }
    }
  }
  const lim = GROUND / 2 - 14;
  const moved = Math.hypot(nx - walker.x, nz - walker.z);
  walker.dist += moved;
  walker.x = Math.max(-lim, Math.min(lim, nx));
  walker.z = Math.max(-lim, Math.min(lim, nz));
  focusShadow(true);

  // head bob: a step every 0.78 m, ±2 cm. enough to feel walked, not sea-sick
  walker.bob += moved / 0.78 * Math.PI;
  const bob = reduce ? 0 : Math.sin(walker.bob) * 0.021;

  camera.position.set(walker.x, EYE + bob, walker.z);
  const cp = Math.cos(walker.pitch);
  camera.lookAt(
    walker.x + Math.sin(walker.yaw) * cp,
    EYE + bob + Math.sin(walker.pitch),
    walker.z + Math.cos(walker.yaw) * cp);
}

const nearEl = document.getElementById("near");
const nearN = nearEl.querySelector(".n"), nearM = nearEl.querySelector(".m");
let nearLast = -1;
function updateNear() {
  let best = -1, bd = 1e9;
  for (let i = 0; i < masses.length; i++) {
    const p = masses[i].position;
    const d = Math.hypot(p.x - walker.x, p.z - walker.z) - masses[i].userData.w * 0.5;
    if (d < bd) { bd = d; best = i; }
  }
  if (bd > 80) { nearEl.classList.remove("on"); nearLast = -1; return; }
  nearEl.classList.add("on");
  if (best !== nearLast) {
    nearLast = best;
    nearN.textContent = E[best].n;
    nearM.textContent =
      `#${rank(best, FI)} OF 21 · ${Math.round(masses[best].scale.y)} UNITS · VARIANCE ${variance(best)}`;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESURVEY — the whole city moves and regrows. This is the argument.
   ═══════════════════════════════════════════════════════════════════════ */
let tween = null;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function setFrame(fi, animate = true) {
  if (fi === FI && tween) return;
  FI = fi;
  history.replaceState(null, "", `#f${fi}`);
  drawGround(FI); groundTex.needsUpdate = true;
  renderFrameUI();
  if (selectedEntity !== null) showEntity(selectedEntity, false);
  E.forEach((_, i) => repaintPlate(i));

  const from = masses.map(m => ({ x: m.position.x, z: m.position.z, h: m.scale.y }));
  const to = E.map((d, i) => layout(d, i, FI));
  closeExhibit();
  const dur = (animate && !reduce) ? 1250 : 0;
  tween = { from, to, t0: performance.now(), dur,
            camFrom: { tx: orbit.tx, tz: orbit.tz, dist: orbit.dist, ty: orbit.ty },
            camTo: framing(FI) };
  if (!dur) applyTween(1);
  invalidate(1500);
}

function applyTween(p) {
  renderer.shadowMap.needsUpdate = true;
  for (let i = 0; i < masses.length; i++) {
    const m = masses[i], a = tween.from[i], b = tween.to[i];
    const stagger = Math.min(0.42, i * 0.018);
    const q = ease(Math.max(0, Math.min(1, (p - stagger) / (1 - stagger))));
    const x = a.x + (b.x - a.x) * q, z = a.z + (b.z - a.z) * q, h = a.h + (b.h - a.h) * q;
    m.position.x = x; m.position.z = z; m.scale.y = h;
    if (m.userData.edge) { m.userData.edge.position.set(x, 0, z); m.userData.edge.scale.y = h; }
    const col = colliders[i]; col.x = x; col.z = z;
    plates[i].position.set(x, Math.min(h + 10, 32), z);
  }
  if (tween.camFrom && MODE === "orbit") {
    const q = ease(p);
    for (const k of ["tx", "tz", "dist", "ty"])
      orbit[k] = tween.camFrom[k] + (tween.camTo[k] - tween.camFrom[k]) * q;
    applyOrbit();
  }
  buildFilaments();
  placeQuarter();
  placeFigures();
  relocateLife();
  updateMap();
}

/* ═══════════════════════════════════════════════════════════════════════
   THE DRAFTING OVERLAY
   Border, crop marks, a datum, a dimension line on the tallest mass and a
   leader to the leader of the frame — drawn in SVG over the render and
   re-projected from the live camera. This is the layer that makes the page
   a drawing rather than a viewport with a chart in it.
   ═══════════════════════════════════════════════════════════════════════ */
const svgNS = "http://www.w3.org/2000/svg";
const gBorder = document.getElementById("border");
const gAnnot = document.getElementById("annot");
const mk = (t, a) => { const e = document.createElementNS(svgNS, t);
  for (const k in a) e.setAttribute(k, a[k]); return e; };

function drawBorder() {
  gBorder.textContent = "";
  const w = VW, h = VH, i = 9, c = 20;
  gBorder.appendChild(mk("rect",
    { x: i, y: i, width: w - i * 2, height: h - i * 2, class: "hair-faint" }));
  [[i, i, 1, 1], [w - i, i, -1, 1], [i, h - i, 1, -1], [w - i, h - i, -1, -1]]
    .forEach(([x, y, sx, sy]) => {
      gBorder.appendChild(mk("path",
        { d: `M${x} ${y + sy * c} L${x} ${y} L${x + sx * c} ${y}`, class: "hair" }));
    });
}

const v3 = new THREE.Vector3();
function proj(x, y, z) {
  v3.set(x, y, z).project(camera);
  return { x: (v3.x * 0.5 + 0.5) * VW, y: (-v3.y * 0.5 + 0.5) * VH,
           in: v3.z > -1 && v3.z < 1 };
}

/* In plan every mass is named. Labels are stacked against each other with
   a single downward pass per screen column, so twenty-one names coexist
   without a collision solver and without one covering another. */
function drawPlanLabels() {
  /* A 390 px sheet cannot carry 21 names at a readable size without
     burying the city under them. On a phone the plan is numbered by rank
     and the names are read in the index; on a desk they are spelled out. */
  const fr = freeRect();
  const numbersOnly = VW < 700 || fr.h < 300;
  const items = masses.map((m, i) => {
    const p = proj(m.position.x, m.scale.y, m.position.z);
    let n = E[i].n; if (n.length > 24) n = n.slice(0, 23) + "…";
    const r = String(rank(i, FI)).padStart(2, "0");
    const text = numbersOnly ? r : `${r} ${n}`;
    return { i, x: p.x, y: p.y, in: p.in, text,
             w: numbersOnly ? 22 : text.length * 6.25 + 16 };
  }).filter(p => p.in && p.x > -60 && p.x < VW + 60 && p.y > -40 && p.y < VH + 40);

  /* Place by hand: sort down the sheet, then push each name below anything
     already placed that it would have landed on. 21 labels, one sweep —
     cheaper than a solver and it never leaves two names on top of each
     other, which is the only thing a plan has to get right. */
  items.sort((a, b) => a.y - b.y);
  const placed = [];
  for (const it of items) {
    it.right = it.x + it.w < VW - 16;
    it.lx = it.x + (it.right ? 10 : -10);
    const x0 = it.right ? it.lx : it.lx - it.w;
    const x1 = x0 + it.w;
    let ly = it.y - 1;
    for (let guard = 0; guard < 60; guard++) {
      const gap = numbersOnly ? 12 : 14;
      const hit = placed.find(q => x0 < q.x1 + 5 && q.x0 < x1 + 5 && Math.abs(q.ly - ly) < gap);
      if (!hit) break;
      ly = hit.ly + gap;
    }
    it.ly = Math.max(fr.y + 10, Math.min(fr.y + fr.h - 6, ly));
    placed.push({ x0, x1, ly: it.ly });

    gAnnot.appendChild(mk("path", { d: `M${it.x} ${it.y} L${it.lx - (it.right ? 4 : -4)} ${it.ly - 3}`,
                                    class: "hair-faint" }));
    gAnnot.appendChild(mk("circle", { cx: it.x, cy: it.y, r: 1.9, fill: "#141210" }));
    const t = mk("text", { x: it.lx, y: it.ly, class: "dimtxt",
                           "text-anchor": it.right ? "start" : "end",
                           fill: E[it.i].kind === "eel" ? "#ad145d" : "#242822",
                           style: "font:600 11px/1 ui-monospace,Consolas,monospace;letter-spacing:.02em" });
    t.textContent = it.text;
    gAnnot.appendChild(t);
  }
  const turn = Math.round(orbit.az * 180 / Math.PI);
  const north = turn === 0 ? "N ↑" : `SHEET TURNED ${Math.abs(turn)}° ${turn > 0 ? "CW" : "ACW"}`;
  // the caption rides the head of the free box; its foot belongs to the furniture
  const cap = mk("text", { x: fr.x + 6, y: fr.y + 14, class: "dimtxt", opacity: 0.85 });
  cap.textContent = numbersOnly
    ? `PLAN · F0${FI + 1} · NUMBERED BY RANK · TAP A MASS FOR ITS NAME · ${north}`
    : `PLAN · FRAME 0${FI + 1} · ${FRAMES[FI].name.toUpperCase()} · RANK BEFORE NAME · ${north}`;
  gAnnot.appendChild(cap);
}

function drawAnnot() {
  gAnnot.textContent = "";
  if (MODE === "walk") return;
  if (document.body.classList.contains("plan")) { drawPlanLabels(); return; }
  if (!document.body.classList.contains("annotations")) return;

  const li = leader(FI), m = masses[li];
  const H = m.scale.y, W = m.userData.w;
  const base = proj(m.position.x, 0, m.position.z);
  const top = proj(m.position.x, H, m.position.z);
  if (!base.in || !top.in) return;

  // ± 0.00 — the datum, taken at the foot of the tallest mass
  gAnnot.appendChild(mk("path",
    { d: `M20 ${base.y} L${VW - 20} ${base.y}`,
      class: "hair-faint", "stroke-dasharray": "7 5" }));
  const dt = mk("text", { x: 26, y: base.y - 7, class: "dimtxt", opacity: 0.75 });
  dt.textContent = "± 0.00  datum — the sheet";
  gAnnot.appendChild(dt);

  // the dimension line: offset to the right of the mass, drafting ticks
  const edge = proj(m.position.x + W * 0.5, 0, m.position.z);
  const ox = Math.max(base.x, edge.x) + 46;
  const tick = (x, y) => mk("path", { d: `M${x - 6} ${y + 6} L${x + 6} ${y - 6}`, class: "hair" });
  gAnnot.appendChild(mk("path", { d: `M${ox} ${base.y} L${ox} ${top.y}`, class: "hair" }));
  gAnnot.appendChild(tick(ox, base.y));
  gAnnot.appendChild(tick(ox, top.y));
  gAnnot.appendChild(mk("path",
    { d: `M${base.x} ${base.y} L${ox + 12} ${base.y}`, class: "hair-faint" }));
  gAnnot.appendChild(mk("path",
    { d: `M${top.x} ${top.y} L${ox + 12} ${top.y}`, class: "hair-faint" }));
  const dim = mk("text",
    { x: 0, y: 0, class: "dimtxt",
      transform: `translate(${ox - 9} ${(base.y + top.y) / 2}) rotate(-90)`,
      "text-anchor": "middle" });
  dim.textContent = `${Math.round(H)} units`;
  gAnnot.appendChild(dim);

  // the leader: who is first in this frame, said out loud on the sheet
  // the leader runs right unless right has run out of sheet — then it turns
  const W2 = MOBILE ? 150 : 112;
  const side = (MOBILE && VH < 500 || top.x + 30 + W2 > VW - 24) ? -1 : 1;
  const lx = top.x + 30 * side, ly = Math.max(MOBILE ? 112 : 32, top.y - 54);
  gAnnot.appendChild(mk("path",
    { d: `M${top.x} ${top.y - 6} L${lx} ${ly} L${lx + W2 * side} ${ly}`, class: "hair" }));
  gAnnot.appendChild(mk("circle", { cx: top.x, cy: top.y - 6, r: 2.4, fill: "#141210" }));
  const anchor = side > 0 ? "start" : "end";
  const tx = lx + 4 * side;
  const t1 = mk("text", { x: tx, y: ly - 15, class: "dimtxt", fill: "#e20a7f",
                          "text-anchor": anchor });
  const tied = E.filter((_,i) => rank(i,FI) === 1).length > 1;
  t1.textContent = `01 · ${tied ? 'joint first' : 'first'} in frame 0${FI + 1}`;
  const t2 = mk("text",
    { x: tx, y: ly - 4, class: "dimtxt", "text-anchor": anchor,
      style: "font:650 12px/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:none" });
  t2.textContent = E[li].n;
  gAnnot.appendChild(t1); gAnnot.appendChild(t2);
}
drawBorder();

/* ═══════════════════════════════════════════════════════════════════════
   UI
   ═══════════════════════════════════════════════════════════════════════ */
const framesEl = document.getElementById("frames");
FRAMES.forEach((f, i) => {
  const b = document.createElement("button");
  b.className = "fr"; b.type = "button";
  b.innerHTML = `<div class="k">Frame 0${i + 1}</div><div class="t">${f.name}</div><div class="w">${f.who}</div>`;
  b.onclick = () => setFrame(i);
  framesEl.appendChild(b);
});
function renderFrameUI() {
  [...framesEl.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === FI)));
  if (tabsEl) [...tabsEl.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === FI)));
  document.getElementById("zoning").innerHTML = FRAMES[FI].z;
  document.getElementById("st-sheet").textContent = `0${FI + 1} / 03`;
  document.getElementById("st-frame").textContent = FRAMES[FI].name;
  document.getElementById("current-question").textContent = FRAMES[FI].name;
}
/* ── mobile furniture ──────────────────────────────────────────────────
   The left margin is a sheet margin; a 390 px screen has no margin. The same
   index becomes a bottom tab bar (the three frames, always one tap away) plus
   a drawer for the notes. One source of truth: both call setFrame, both read
   aria-pressed from renderFrameUI. */
const tabsEl = document.getElementById("tabs");
if (tabsEl) {
  FRAMES.forEach((f, i) => {
    const b = document.createElement("button");
    b.className = "tb"; b.type = "button";
    b.innerHTML = `<span class="k">F0${i + 1}</span><span class="t">${f.name}</span>`;
    b.onclick = () => setFrame(i);
    tabsEl.appendChild(b);
  });
}
const notesBtn = document.getElementById("notes-btn");
if (notesBtn) {
  const setNotes = on => {
    document.body.classList.toggle("notes-open", on);
    notesBtn.setAttribute("aria-expanded", String(on));
  };
  notesBtn.onclick = () => setNotes(!document.body.classList.contains("notes-open"));
  document.getElementById("margin").addEventListener("click", e => {
    if (e.target.closest(".fr")) setNotes(false);      // picked a frame: get out of the way
  });
}
const exitBtn = document.getElementById("exit-btn");
if (exitBtn) exitBtn.onclick = exitWalk;

renderFrameUI();

const panel = document.getElementById("panel"), pbody = document.getElementById("pbody");
let selectedEntity = null, panelReturnFocus = null;
document.getElementById("close").onclick = closePanel;
function closePanel() {
  const wasOpen = panel.classList.contains('on');
  panel.classList.remove("on"); selectedEntity = null;
  if (wasOpen && MODE !== 'walk') {
    const target = panelReturnFocus?.isConnected && panelReturnFocus.getClientRects().length ? panelReturnFocus : document.getElementById('reset');
    target.focus({preventScroll:true});
  }
}
function openPanel(focus = true) {
  if (!panel.classList.contains('on')) panelReturnFocus = document.activeElement;
  panel.classList.add('on'); pbody.scrollTop = 0;
  document.body.classList.remove('notes-open'); notesBtn.setAttribute('aria-expanded','false');
  if (focus) document.getElementById('close').focus({preventScroll:true});
}

function showEntity(i, focus = true) {
  selectedEntity = i;
  const d = E[i], v = variance(i), order = stageOrder(d);
  pbody.innerHTML = `
    <div class="hd">
      <div class="k">${d.kind === "eel" ? "The origin — and a participant" :
                      d.kind === "sat" ? "eel network" :
                      d.kind === "hist" ? "Historical experiment" :
                      d.kind === "base" ? "Regulatory baseline" : "Operating school"}</div>
      <h2>${d.n}</h2>
      <div class="seat">${d.seat}</div>
    </div>
    <div class="bd">
      <div class="cap" style="border-top:0;padding-top:14px">Proposed standing · uncalibrated scores</div>
      <div class="ranks">
        ${FRAMES.map((f, fi) => `<div class="${fi === FI ? "hi" : ""}">
          <div class="lb">F0${fi + 1}</div><div class="vl">#${rank(i, fi)}</div></div>`).join("")}
      </div>
      <div class="var"><span class="n">${v}</span>places of movement between frames. Equal scores share a rank.</div>
      <button class="focus-entity" type="button" onclick="document.dispatchEvent(new CustomEvent('atlas-focus',{detail:${i}}))">View this architecture ↗</button><div class="cap">Eight measures · authored scores / 5</div>${radar(d)}
      <div class="prof">
        ${order.map((o, k) => `<div class="st ${k === 0 ? "p0" : ""}">
          <div class="nm">${o.nm}</div>
          <div class="bar"><i style="width:${(0.13 + 0.87 * o.v / 5) * 100}%"></i></div>
          <div class="vv">${o.v}</div></div>`).join("")}
      </div>
      <div class="cap">Note</div>
      <p>${d.t}</p>
      ${d.source ? `<p style="margin-top:12px"><a href="${d.source}" target="_blank" rel="noopener">Primary source ↗</a></p>` : ''}
    </div>`;
  openPanel(focus);
  document.getElementById("selection-name").textContent=d.n;
}


function radar(d){
  const point=(a,r)=>[100+Math.cos(a)*r,90+Math.sin(a)*r];
  const points=M.map(([k],i)=>point(i/8*Math.PI*2,d[k]/5*62).join(',')).join(' ');
  return '<svg class="radar" viewBox="0 0 200 180" role="img" aria-label="Eight measures in the same clockwise order as the contour">'+[.5,1].map(s=>'<circle cx="100" cy="90" r="'+62*s+'" fill="none" stroke="#bcbab1"/>').join('')+M.map(([k,n],i)=>{const a=i/8*Math.PI*2,p=point(a,62),q=point(a,82);return '<path d="M100 90L'+p.join(' ')+'" stroke="#bcbab1"/><text x="'+q[0]+'" y="'+q[1]+'" text-anchor="middle" dominant-baseline="middle">'+n.slice(0,3)+'</text>';}).join('')+'<polygon points="'+points+'" fill="#b8076620" stroke="#b80766" stroke-width="1.5"/></svg><p class="form-note">Contour: eight clockwise measures. Atrium: access. Floors: 8 + 4 × evidence. Twist: 12° × (autonomy − recognition). Height: active frame score. These are design rules, not built dimensions.</p>';
}
document.addEventListener('atlas-focus',e=>{
  const m=masses[e.detail]; if(!m)return;closePanel();userMoved=true;
  if(tween){applyTween(1);tween=null;}
  Object.assign(orbit,{tx:m.position.x,ty:m.scale.y*.42,tz:m.position.z,dist:MOBILE?230:185,pol:.98});applyOrbit();invalidate();
});
document.getElementById('geometry').onclick=()=>{
  geometryMode=geometryMode==='contour'?'terraces':'contour';
  for(const m of masses){
    m.geometry.dispose();m.geometry=buildTower(m.userData.d,m.userData.i,m.userData.wall);
    const {W,D}=m.geometry.userData;m.userData.w=W;m.userData.dp=D;
    const col=colliders[m.userData.i];col.w=W;col.dp=D;col.r=Math.max(W,D)*.5+1.5;
    if(m.userData.edge){m.userData.edge.geometry.dispose();m.userData.edge.geometry=new THREE.EdgesGeometry(m.geometry,24);}
  }
  document.getElementById('geometry').textContent=geometryMode==='contour'?'Form: contour':'Form: terraces';
  document.getElementById('geometry').setAttribute('aria-pressed',String(geometryMode==='terraces'));
  renderer.shadowMap.needsUpdate=true;updateMap();invalidate();
};
document.getElementById('relations').onclick=e=>{filaments.visible=!filaments.visible;e.currentTarget.setAttribute('aria-pressed',String(filaments.visible));invalidate();};
/* ── PLAN — the sheet seen square on ──────────────────────────────────
   The old plan button only tilted the camera; whatever was off the edge
   stayed off the edge. This one solves the distance so the entire survey
   — every mass, the regulatory wall, the eel quarter — lands inside the
   rectangle the HUD actually leaves free, then labels all 21 by name. */
function freeRect() {
  const r = { x: 14, y: 14, w: VW - 28, h: VH - 28 };
  /* position:fixed furniture reports offsetParent === null, so visibility
     has to be asked for directly or every inset silently reads as zero. */
  const vis = el => {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return false;
    const b = el.getBoundingClientRect();
    return b.width > 8 && b.height > 8;
  };
  const el = id => document.getElementById(id);
  let top = 14, bottom = VH - 14, left = 14, right = VW - 14;
  const mast = el("masthead");
  if (vis(mast)) top = Math.max(top, mast.getBoundingClientRect().bottom + 10);
  for (const id of ["margin", "tools"]) {
    const n = el(id); if (!vis(n)) continue;
    const b = n.getBoundingClientRect();
    if (b.bottom > VH * 0.62) bottom = Math.min(bottom, b.top - 10);        // parked at the foot
    else if (b.right < VW * 0.5) left = Math.max(left, b.right + 12);
    else if (b.left > VW * 0.5) right = Math.min(right, b.left - 12);
  }
  for (const id of ["tabs", "walk", "status-strip", "credit", "title-block"]) {
    const n = el(id); if (!vis(n)) continue;
    const b = n.getBoundingClientRect();
    if (b.top > VH * 0.55) bottom = Math.min(bottom, b.top - 8);
  }
  r.x = left; r.y = top; r.w = Math.max(120, right - left); r.h = Math.max(120, bottom - top);
  return r;
}

function planCorners() {
  // every mass at its real footprint, plus the quarter ring around eel
  const pts = [];
  E.forEach((d, i) => {
    const m = masses[i], hw = m.userData.w * 0.5 + 14, hd = m.userData.dp * 0.5 + 14;
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      pts.push([m.position.x + sx * hw, m.position.z + sz * hd]);
  });
  const q = masses[eelIdx].position;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts.push([q.x + sx * 120, q.z + sz * 120]);
  return pts;
}

/* With the camera straight above, the screen's up axis is the horizontal
   component of the view, which for this orbit is −(sin az, cos az). Every
   plan calculation goes through these two unit vectors, so turning the
   sheet is one angle and not a special case. */
const planAxes = az => ({ up: [-Math.sin(az), -Math.cos(az)],
                          right: [Math.cos(az), -Math.sin(az)] });

function planFraming() {
  const pts = planCorners();
  const fr = freeRect();
  const vf = camera.fov * Math.PI / 180;
  const hf = 2 * Math.atan(Math.tan(vf / 2) * (VW / VH));
  const tanV = Math.tan(vf / 2) * (fr.h / VH), tanH = Math.tan(hf / 2) * (fr.w / VW);

  /* A draughtsman turns the sheet when the survey runs diagonally across
     it. The city is laid out on score axes, so on a portrait phone it
     runs corner to corner; trying every quarter-turn in 15° steps and
     keeping the one that needs the least height is the same move. */
  let best = null;
  for (let deg = -90; deg <= 90; deg += 15) {
    const az = deg * Math.PI / 180;
    const { up, right } = planAxes(az);
    let u0 = 1e9, u1 = -1e9, r0 = 1e9, r1 = -1e9;
    for (const [x, z] of pts) {
      const u = x * up[0] + z * up[1], r = x * right[0] + z * right[1];
      if (u < u0) u0 = u; if (u > u1) u1 = u;
      if (r < r0) r0 = r; if (r > r1) r1 = r;
    }
    const ex = (r1 - r0) * 1.06, ey = (u1 - u0) * 1.06;     // 6 % air for the names
    const dist = Math.max(ey / (2 * tanV), ex / (2 * tanH));
    const penalty = 1 + Math.abs(deg) * 0.0007;             // north up unless it costs
    if (!best || dist * penalty < best.cost)
      best = { az, deg, dist, cost: dist * penalty, up, right,
               cu: (u0 + u1) / 2, cr: (r0 + r1) / 2 };
  }
  const dist = Math.max(260, Math.min(2200, best.dist));
  // centre of the survey, back in world coordinates
  const cx = best.cr * best.right[0] + best.cu * best.up[0];
  const cz = best.cr * best.right[1] + best.cu * best.up[1];
  // aim at the centre of the free box, not the centre of the screen:
  // push the target against the offset, in screen axes
  const offR = ((fr.x + fr.w / 2) - VW / 2) / VW * (2 * dist * Math.tan(hf / 2));
  const offU = ((fr.y + fr.h / 2) - VH / 2) / VH * (2 * dist * Math.tan(vf / 2));
  return {
    tx: cx - best.right[0] * offR + best.up[0] * offU,
    tz: cz - best.right[1] * offR + best.up[1] * offU,
    dist, ty: 0, az: best.az, deg: best.deg
  };
}
function leavePlanUI() {
  if (!document.body.classList.contains("plan")) return;
  document.body.classList.remove("plan");
  const b = document.getElementById("plan-view");
  b.setAttribute("aria-pressed", "false"); b.textContent = "Plan view";
}
function planView(on = !document.body.classList.contains("plan")) {
  document.body.classList.toggle("plan", on);
  closeExhibit(); closePanel();
  if (MODE === "walk") exitWalk();
  const btn = document.getElementById("plan-view");
  btn.setAttribute("aria-pressed", String(on));
  btn.textContent = on ? "Leave plan" : "Plan view";
  if (on) {
    orbit.az = 0; orbit.pol = 0.0001;                    // square on, north up
    Object.assign(orbit, planFraming());
  } else {
    orbit.az = -.64; orbit.pol = .88;
    Object.assign(orbit, framing(FI));
  }
  userMoved = on;     // plan owns the camera; leaving hands it back to the frame
  applyOrbit(); invalidate(900);
  // one settling pass: furniture can still be animating when the button is hit
  if (on) requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!document.body.classList.contains("plan") || MODE !== "orbit") return;
    Object.assign(orbit, planFraming()); applyOrbit(); invalidate(600);
  }));
}
document.getElementById('plan-view').onclick = () => planView();
document.getElementById('dusk').onclick = () => setDusk(!LIFE.dusk);
function toggleLife() {
  LIFE.on = !LIFE.on;
  const b = document.getElementById('life');
  b.setAttribute('aria-pressed', String(LIFE.on));
  b.textContent = LIFE.on ? 'Life: on' : 'Life: off';
  invalidate();
}
document.getElementById('life').onclick = toggleLife;
if (reduce) { LIFE.on = false; const b = document.getElementById('life');
  b.textContent = 'Life: off'; b.setAttribute('aria-pressed', 'false'); }
function closeExhibit(){document.body.classList.add('exploring');}
renderer.domElement.addEventListener('pointerdown',closeExhibit);
document.addEventListener('atlas-focus',closeExhibit);
document.getElementById('feature').onclick=()=>document.dispatchEvent(new CustomEvent('atlas-focus',{detail:0}));
document.getElementById('annotate').onclick=e=>{const on=document.body.classList.toggle('annotations');e.currentTarget.setAttribute('aria-pressed',String(on));invalidate();};
/* close the drawer before firing the control: a view that measures the
   free screen must not measure it through an open drawer */
document.querySelectorAll('[data-control]').forEach(button=>button.onclick=()=>{
  document.body.classList.remove('notes-open');notesBtn.setAttribute('aria-expanded','false');
  requestAnimationFrame(()=>document.getElementById(button.dataset.control).click());});

function showProgram(p) {
  selectedEntity = null;
  pbody.innerHTML = `
    <div class="hd">
      <div class="k">${p.st === "built" ? "Our working prototype" : "Our proposed contribution"}${p.d ? " · " + p.d : ""}</div>
      <h2>${p.n}</h2>
      <div class="seat">eel quarter</div>
    </div>
    <div class="bd">
      ${p.q && p.q !== "—" ? `<div class="cap" style="border-top:0;padding-top:14px">Source theme</div>
      <p><a href="https://eelfreeschoolofarchitecture.com/" target="_blank" rel="noopener">${p.n} ↗</a></p>` : ""}
      <div class="cap">What the apparatus would be</div>
      <p><b>${p.h}.</b> ${p.b}</p>
    </div>`;
  openPanel();
}

const entitySelect = document.getElementById('entity-select');
E.forEach((d,i) => { const o = document.createElement('option');o.value=i;o.textContent=d.n;entitySelect.append(o); });
entitySelect.onchange = () => {if(entitySelect.value !== '') showEntity(+entitySelect.value);};
function resetInput() {
  for (const k in keys) delete keys[k];
  pts.clear(); drag = lastDrag = null; pinch = 0;
  tm.fx = tm.fz = 0; tm.run = false; stickId = lookId = null; lookLast = null;
  walker.vx = walker.vz = 0;
  stickEl.classList.remove('live'); stickNub.style.transform = '';
}
function resetView() {
  if (MODE === 'walk') exitWalk();
  closePanel(); resetInput(); userMoved = false; document.body.classList.remove('exploring');
  if (tween) {applyTween(1);tween=null;}
  orbit.az = -.64; orbit.pol = .88;
  Object.assign(orbit, framing(FI));applyOrbit();invalidate();
}
document.getElementById('reset').onclick = resetView;
addEventListener('blur', resetInput);

const mapBuildings = document.getElementById('map-buildings'), mapPlayer = document.getElementById('map-player');
function updateMap() {
  mapBuildings.innerHTML = masses.map(m => `<rect x="${m.position.x-m.userData.w/2}" y="${m.position.z-m.userData.dp/2}" width="${m.userData.w}" height="${m.userData.dp}" fill="${m.userData.i===0?'#9d0757':'#777368'}"/>`).join('');
}
updateMap();

/* picking */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const labelEl = document.getElementById("label");
let hovered = -1;

renderer.domElement.addEventListener("pointermove", e => {
  if (MODE !== "orbit") return;
  // a thumb has no hover: no floating label, and no raycast per move either
  if (e.pointerType !== "mouse") return;
  ptr.set((e.clientX / VW) * 2 - 1, -(e.clientY / VH) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hitM = ray.intersectObjects(masses, false)[0];
  const hitQ = ray.intersectObjects(quarter.children, true)[0];
  const near = (hitM && hitQ) ? (hitM.distance < hitQ.distance ? "m" : "q") : hitM ? "m" : hitQ ? "q" : null;
  if (near === "m") {
    hovered = hitM.object.userData.i;
    labelEl.textContent = E[hovered].n;
  } else if (near === "q") {
    let o = hitQ.object; while (o && !o.userData.prog) o = o.parent;
    hovered = -1;
    labelEl.textContent = o ? o.userData.prog.n : "";
  } else { hovered = -1; labelEl.textContent = ""; }
  if (labelEl.textContent) {
    labelEl.classList.add("on");
    labelEl.style.left = (e.clientX + 15) + "px";
    labelEl.style.top = (e.clientY - 11) + "px";
    renderer.domElement.style.cursor = "pointer";
  } else {
    labelEl.classList.remove("on");
    renderer.domElement.style.cursor = "grab";
  }
});

renderer.domElement.addEventListener("click", e => {
  const d = drag || lastDrag;
  // a thumb wobbles on the way down; a mouse does not
  if (MODE !== "orbit" || suppressPick || pts.size > 1 || (d && d.moved > (d.touch ? 14 : 6))) return;
  lastDrag = null;
  ptr.set((e.clientX / VW) * 2 - 1, -(e.clientY / VH) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hitM = ray.intersectObjects(masses, false)[0];
  const hitQ = ray.intersectObjects(quarter.children, true)[0];
  if (hitM && (!hitQ || hitM.distance < hitQ.distance)) return showEntity(hitM.object.userData.i);
  if (hitQ) { let o = hitQ.object; while (o && !o.userData.prog) o = o.parent; if (o) showProgram(o.userData.prog); }
});

/* colophon: the experiment, signed. One dialog, reachable from the masthead
   signature, the footer, the drawer and ?about. */
const colophon = document.getElementById('colophon');
let coloReturn = null;
let coloBackground = [];
function openColophon(trigger = document.activeElement) {
  if (colophon.classList.contains('on')) return;
  coloReturn = trigger;
  if (coloReturn.closest('#margin')) coloReturn = notesBtn;
  resetInput();
  document.body.classList.remove('notes-open'); notesBtn.setAttribute('aria-expanded', 'false');
  coloBackground = [...document.body.children].filter(el => el !== colophon && !['SCRIPT','STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
  coloBackground.forEach(([el]) => { el.inert = true; });
  colophon.classList.add('on'); document.body.classList.add('colophon-open');
  colophon.scrollTop = 0;
  document.getElementById('co-close').focus();
}
function closeColophon() {
  colophon.classList.remove('on'); document.body.classList.remove('colophon-open');
  coloBackground.forEach(([el, inert]) => { el.inert = inert; }); coloBackground = [];
  resetInput();
  if (coloReturn && coloReturn.focus) coloReturn.focus({preventScroll:true}); coloReturn = null;
}
document.querySelectorAll('[data-colophon]').forEach(el =>
  el.addEventListener('click', e => { e.preventDefault(); openColophon(el); }));
document.getElementById('co-close').onclick = closeColophon;
colophon.addEventListener('click', e => { if (e.target === colophon) closeColophon(); });
colophon.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const items = [...colophon.querySelectorAll('button,a[href]')];
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

addEventListener("keydown", e => {
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.key === "Escape" && colophon.classList.contains('on')) { closeColophon(); return; }
  if (colophon.classList.contains('on')) return;
  if (e.key.toLowerCase() === 'r') resetView();
  if (MODE === 'orbit') {
    if (e.key === '+' || e.key === '=') zoomBy(.9);
    if (e.key === '-') zoomBy(1.1);
    if (e.key.startsWith('Arrow')) {
      e.preventDefault(); userMoved = true;
      if(e.key==='ArrowLeft') orbit.az += .08;
      if(e.key==='ArrowRight') orbit.az -= .08;
      if(e.key==='ArrowUp') orbit.pol = Math.max(.10,orbit.pol-.06);
      if(e.key==='ArrowDown') orbit.pol = Math.min(1.50,orbit.pol+.06);
      applyOrbit();
    }
  }
  if (e.key === "1" || e.key === "2" || e.key === "3") setFrame(+e.key - 1);
  if (e.key.toLowerCase() === "f" && MODE === "orbit") enterWalk();
  if (e.key.toLowerCase() === "p" && MODE === "orbit") planView();
  if (e.key.toLowerCase() === "n") setDusk(!LIFE.dusk);
  if (e.key.toLowerCase() === "l") toggleLife();
  if (e.key === "Escape") {
    if (MODE === "walk") exitWalk(); else closePanel();
    document.body.classList.remove('notes-open');notesBtn.setAttribute('aria-expanded','false');
  }
});

/* ═══════════════════════════════════════════════════════════════════════
   LOOP
   ═══════════════════════════════════════════════════════════════════════ */
/* deep links: #f1 picks the frame, ?e=7 opens a cut sheet, ?notes opens the
   drawer. The same hooks make a still proof reproducible. */
{
  const e = /[?&]e=(\d+)/.exec(location.search);
  if (e && E[+e[1]]) showEntity(+e[1]);
  if (/[?&]notes/.test(location.search) && notesBtn) notesBtn.click();
  if (/[?&]about/.test(location.search)) openColophon();
}
const STILL = /[?&]still/.test(location.search);
if (/[?&]walk/.test(location.search)) requestAnimationFrame(() => enterWalk());
let frames = 0, last = performance.now();
let frameRequest = 0, activeUntil = performance.now() + 1500;
function invalidate(ms = 700) {
  activeUntil = Math.max(activeUntil, performance.now() + ms);
  if (!frameRequest && !document.hidden) frameRequest = requestAnimationFrame(tick);
}
for (const event of ['pointerdown','pointerup','pointercancel','wheel','keydown','keyup','click','change'])
  addEventListener(event, () => invalidate(), {passive:true});
addEventListener('pointermove', () => { if (drag || pts.size || MODE === 'walk' || hovered >= 0) invalidate(); },{passive:true});
document.addEventListener('visibilitychange', () => {
  resetInput();
  if(document.hidden){cancelAnimationFrame(frameRequest);frameRequest=0;}
  else {last=performance.now();invalidate();}
});

function tick(now) {
  frameRequest = 0;
  if (document.hidden || renderer.getContext().isContextLost()) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;

  if (tween) {
    const p = tween.dur ? Math.min(1, (now - tween.t0) / tween.dur) : 1;
    applyTween(p);
    if (p >= 1) tween = null;
  }
  if (LIFE.on && !reduce) { LIFE.t += dt; stepCrowd(dt); stepPulses(dt); }
  if (MODE === "walk") {
    stepWalk(dt); updateNear();
    mapPlayer.setAttribute('transform',`translate(${walker.x},${walker.z}) rotate(${180-walker.yaw*180/Math.PI})`);
  }

  const tops = topThree(FI);
  for (let i = 0; i < plates.length; i++) {
    const sp = plates[i];
    let want = 0;
    if (MODE === "walk") {
      const d = camera.position.distanceTo(sp.position);
      want = d < 180 ? Math.min(1, (180 - d) / 65) : 0;
    } else {
      want = (i === hovered) ? 1 : 0;
      if (orbit.dist > 780) want = 0;
    }
    sp.material.opacity += (want - sp.material.opacity) * Math.min(1, dt * 9);
    sp.visible = sp.material.opacity > 0.02;
  }

  if (frames % 2 === 0) drawAnnot();      // the overlay need not run at 60 Hz
  present(now);

  if (++frames === 3) {
    document.getElementById("boot").classList.add("off");
    document.getElementById("boot").setAttribute('aria-hidden','true');
  }
  if (STILL && frames > 34) return;       // software rendering is slow; 34 settles it
  const moving = MODE === 'walk' && (Object.values(keys).some(Boolean) || tm.fx || tm.fz || Math.hypot(walker.vx,walker.vz) > .01);
  const alive = LIFE.on && !reduce && !STILL;
  if (tween || moving || alive || now < activeUntil || frames < 3) frameRequest = requestAnimationFrame(tick);
}
invalidate();

addEventListener("resize", () => {
  MOBILE = compactViewport();
  measure();
  camera.aspect = VW / VH;
  camera.updateProjectionMatrix();
  renderer.setSize(VW, VH, false);
  sizeTargets();
  drawBorder();
  // a phone changes aspect by a whole turn, not a few pixels: re-frame unless
  // the camera has already been taken over by hand
  if (MODE === "orbit" && document.body.classList.contains("plan")) {
    Object.assign(orbit, planFraming()); applyOrbit();
  } else if (MODE === "orbit" && !userMoved) { Object.assign(orbit, framing(FI)); applyOrbit(); }
  // headless Chrome leaves stale layers for position:fixed furniture when the
  // window settles to its real viewport. Force one full repaint of the page.
  for (const el of document.querySelectorAll("#margin,#title-block,#walk,#panel,#near,#sheet")) {
    el.style.willChange = "transform"; void el.offsetHeight; el.style.willChange = "";
  }
  invalidate();
});

// Diagnostic state is available only to the local QA route; no frame data is sent anywhere.
if (new URLSearchParams(location.search).has('qa')) window.__atlasQA = {
  geometry: () => masses.map(m=>({name:m.userData.d.n,finite:Array.from(m.geometry.attributes.position.array).every(Number.isFinite),vertices:m.geometry.attributes.position.count,meta:m.geometry.userData})),
  state: () => ({frame:FI,mode:MODE,frames,colliders:colliders.length,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,orbit:{...orbit},walker:{...walker},camera:camera.position.toArray(),tm:{...tm},tween:!!tween,scheduled:!!frameRequest,drawCalls:sceneStats.calls,pixelRatio:renderer.getPixelRatio(),geometryMode,triangles:sceneStats.triangles,webgl:renderer.getContext().getParameter(renderer.getContext().RENDERER)}),
  point: i => proj(masses[i].position.x,masses[i].scale.y/2,masses[i].position.z),
  life: () => ({
    agents: agents.length,
    agentsExpected: E.reduce((s,d)=>s+Math.min(12,Math.max(2,d.acc*(MOBILE?1:2))),0),
    lamps: lampPost.count,
    lampsExpected: E.reduce((s,d)=>s+Math.min(7,Math.max(0,d.evi)),0),
    drawables: [crowd,lampPost,lampHead,lampPool].length,
    on: LIFE.on, dusk: LIFE.dusk
  }),
  agent: i => ({x:agents[i].x,z:agents[i].z,yaw:agents[i].yaw}),
  light: () => ({sun:sun.intensity,emissive:lampHeadMat.emissiveIntensity,pool:poolMat.opacity,
                 expo:gradeMat.uniforms.expo.value,env:scene.environmentIntensity}),
  pulses: () => pulses.visible ? pulses.count : 0,
  walkTo: (x,z) => { walker.x=x; walker.z=z; invalidate(600); },
  /* Does the plan actually fit, and do the names read? Measured against the
     same free rectangle the camera solved for, and against the labels the
     overlay really emitted — not against the intention. */
  planFit: () => {
    drawAnnot();
    const fr = freeRect();
    let outside = 0;
    masses.forEach(m => {
      for (const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        const p = proj(m.position.x+dx*m.userData.w*0.5, 0, m.position.z+dz*m.userData.dp*0.5);
        if (!p.in || p.x < fr.x || p.x > fr.x+fr.w || p.y < fr.y || p.y > fr.y+fr.h) { outside++; return; }
      }
    });
    const texts = [...gAnnot.querySelectorAll('text')].filter(t=>/^\d\d($| )/.test(t.textContent));
    const boxes = texts.map(t=>t.getBoundingClientRect());
    let collisions = 0;
    for (let a=0;a<boxes.length;a++) for (let b=a+1;b<boxes.length;b++) {
      const A=boxes[a],B=boxes[b];
      if (A.left<B.right-1 && B.left<A.right-1 && A.top<B.bottom-1 && B.top<A.bottom-1) collisions++;
    }
    const box = pts => {
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      for (const [wx,wz] of pts) { const p=proj(wx,0,wz);
        x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y); }
      return {x0,x1,y0,y1,dx:Math.round((x0+x1)/2-(fr.x+fr.w/2)),dy:Math.round((y0+y1)/2-(fr.y+fr.h/2))};
    };
    const massPts=[];
    masses.forEach(m=>{for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])
      massPts.push([m.position.x+dx*m.userData.w*0.5,m.position.z+dz*m.userData.dp*0.5]);});
    const bbox = box(massPts), fullBox = box(planCorners());
    return { bbox, fullBox, pol: orbit.pol, az: orbit.az, deg: Math.round(orbit.az*180/Math.PI),
             dist: orbit.dist, free: fr, outside, labels: texts.length,
             named: texts.filter(t=>t.textContent.length>3).length, collisions, plan: document.body.classList.contains('plan') };
  },
  bare: () => {gradeMat.uniforms.bloom.value=0;gradeMat.uniforms.vig.value=0;gradeMat.uniforms.chroma.value=0;gradeMat.uniforms.grain.value=0;renderer.shadowMap.enabled=false;sun.castShadow=false;scene.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.needsUpdate=true;});invalidate();}
};
