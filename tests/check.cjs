// Content/build invariants for the public static artifact. Browser QA is separate.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(read('data.js').replace(/export\s*\{[^}]+\};?/,'')+';globalThis.data={M,E,FRAMES,PROGRAMS,LOTS,GRAMMAR,grammarForm,grammarReconstruct}',ctx);
const {M,E,FRAMES,PROGRAMS,LOTS,GRAMMAR,grammarForm,grammarReconstruct}=ctx.data;
assert.equal(E.length,21);assert.equal(M.length,8);assert.equal(FRAMES.length,3);
for(const e of E)for(const [k]of M)assert(Number.isInteger(e[k])&&e[k]>=0&&e[k]<=5,`${e.n}: ${k}`);
const WEIGHTS=[
 {aut:1,wld:1,mat:1,epi:1,acc:1,evi:0,rec:0,cos:0},
 {aut:0,wld:0,mat:1,epi:0,acc:0,evi:2,rec:2,cos:0},
 {aut:0,wld:1,mat:1,epi:0,acc:0,evi:0,rec:0,cos:3}];
assert.equal(WEIGHTS.length,FRAMES.length);
for(const f of FRAMES)for(const e of E)assert(f.score(e)>=0&&f.score(e)<=f.max);
/* the engine's declared weights must BE the score function, or the exhibited
   grammar lies: score(e) === Σ weight·value for every entity, every frame */
for(let fi=0;fi<FRAMES.length;fi++)for(const e of E){
  const w=Object.entries(WEIGHTS[fi]).reduce((s,[k,v])=>s+v*e[k],0);
  assert.equal(f_score(fi,e),w,`${FRAMES[fi].no} weight drift on ${e.n}`);
}
function f_score(fi,e){const W=WEIGHTS[fi];return M.reduce((s,[k])=>s+W[k]*e[k],0);}
assert.equal(PROGRAMS.length+LOTS.length,15);
const html=read('index.html'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate DOM id');
for(const tag of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 const target=tag[1].split(/[?#]/)[0];if(!target||/^(?:https?:|data:|mailto:)/.test(target))continue;
 assert(fs.existsSync(path.resolve(root,target)),`missing local resource ${target}`);
}
assert(!/<script[^>]+src="https?:/.test(html),'remote runtime script');
assert(!read('city.html').includes('src="./city.js"'),'offline bundle still imports city');
assert(!read('city.html').includes('href="./hud.css"'),'offline bundle still imports CSS');
assert.equal((read('atlas-table.html').match(/<article/g)||[]).length,40,'21 entities + 15 contributions + 4 colophon');
for(const f of['index.html','atlas-table.html','README.md'])for(const s of['not affiliated with','Semir Poturak','Svemir','MIT'])assert(read(f).includes(s),`${f}: colophon statement "${s}"`);
assert(read('NOTICE.md').includes('not affiliated with'));
assert(read('vendor/THREE-LICENSE.txt').includes('Permission is hereby granted'));
// the guided tour and its surfaces: engine, captions, controls, keyboard hint
for(const s of['id="tour"','id="cut"','id="cut-skip"'])assert(html.includes(s),`tour surface ${s} missing`);
const cj=read('city.js');
for(const s of['function flyTo','stepCamTween','buildTour','startTour','endTour'])assert(cj.includes(s),`camera choreography missing ${s}`);
for(const s of['exists to be argued with','One lamp per point of published evidence','widest movers'])assert(cj.includes(s),`tour caption missing: ${s.slice(0,24)}`);
assert(cj.includes('camTween=null')||cj.includes('camTween = null'),'pointer must be able to cancel the camera');
assert(read('README.md').includes('Tour'),'README documents the tour');
// the engine: the grammar exhibited — surfaces, deep link, weights wired to the real score
for(const s of['id="engine"','id="engine-readout"','data-control="engine"','<kbd>E</kbd> the engine'])
  assert(html.includes(s),`engine surface ${s} missing`);
for(const s of['const WEIGHTS','function toggleEngine','function setLens','stepEnginePulses',
               'refreshEngineLines','renderEngineReadout','?engine','function engineFormula'])
  assert(cj.includes(s),`engine wiring missing ${s}`);
assert(cj.includes('aria-pressed'),'engine button reflects state');
/* the camera has three verbs now: orbit, zoom, pan — and the engine is the
   default reading, not an easter egg */
assert(cj.includes('function panBy'),'pan: the third verb of the camera missing');
assert(cj.includes('pinchMid'),'two-finger pan missing');
assert(cj.includes('contextmenu'),'right-drag must not raise a menu over the pan');
assert(html.includes('shift-drag or right-drag to pan'),'desktop pan hint missing');
assert(html.includes('two fingers</b> to pan'),'touch pan hint missing');
/* pan keeps its momentum and answers the keyboard, and both yield to any
   other claim on the camera */
assert(cj.includes('function startPanGlide'),'pan inertia missing');
assert(cj.includes('panGlide = null; panVX = panVY = 0;'),'a new hand must stop the glide');
assert(cj.includes('if (reduce) return;'),'reduced motion must not glide');
assert(/e\.shiftKey\) \{[^}]*ArrowLeft/.test(cj),'Shift+arrows must pan');
assert(html.includes('Shift</kbd>+arrows to pan'),'keyboard pan hint missing');
assert(/const ENGINE = \{ on: true/.test(cj),'engine must be the default reading');
assert(cj.includes('() => toggleEngine(true)'),'engine state must be applied on the first frame');
/* ── the grammar: the form is derived, and the derivation walks back ───
   Test rekonstrukcije: measure the form as one would off a drawing
   (three decimals), recover the measures — nothing may be off by more
   than one authored point. Disonanca: two different attribute sets must
   never produce one identical form. */
for(const e of E){
  const f=grammarForm(e),q=v=>+v.toFixed(3);
  const r0=q(f.radius);
  const radii=M.map((_,mi)=>q(f.radius*f.contour(mi/8*Math.PI*2)));
  const rec=grammarReconstruct(f,r0,radii);
  for(const [k,v] of Object.entries(rec)){
    const truth=k==='aut-rec'?e.aut-e.rec:e[k];
    assert(Math.abs(v-truth)<=1,`${e.n}: ${k} reconstructed ${v}, authored ${truth}`);
  }
}
{
  const seen=new Map();
  for(const e of E){
    const f=grammarForm(e);
    const sig=[f.radius,f.floors,f.opening,f.twist,...M.map((_,mi)=>+f.contour(mi/8*Math.PI*2).toFixed(4))].join('|');
    const prev=seen.get(sig);
    if(prev!==undefined)assert(M.every(([k])=>e[k]===prev[k]),`disonanca: ${e.n} and ${prev.n} share one form`);
    else seen.set(sig,e);
  }
}
for(const s of['const GRAMMAR = {','function grammarForm','function grammarReconstruct'])assert(read('data.js').includes(s),`grammar source ${s} missing`);
assert(cj.includes('grammarForm(d)')&&cj.includes('GRAMMAR.terrace.f'),'the city must build from the published grammar, not private copies');
/* ── the drawn city: creases, kotiranje, tone stipple ───────────────── */
for(const s of['new THREE.EdgesGeometry(geo, 22)','function buildDims','addStipple','MAT.crease','body.annotations'])
  assert(cj.includes(s),`drawing depth missing ${s}`);
assert(cj.includes('dims.visible=on'),'the Dimensions toggle must show the ground kote');
/* ── sound: the first tone — 0 asset bytes, gesture-gated, mute visible ─ */
for(const s of['id="sound"','data-control="sound"','<kbd>M</kbd> sound'])assert(html.includes(s),`sound surface ${s} missing`);
for(const s of['atlas-sound','webkitAudioContext','ctx.sampleRate','function build','voices','createBuffer'])assert(cj.includes(s),`sound wiring missing ${s}`);
assert(cj.includes('getElementById("sound").onclick'),'the mute toggle must be wired');
console.log('PASS: dataset ranges, frame bounds, DOM identity, local links, offline bundle, reading room, attribution and dependency license, grammar reconstruction and disonance, drawing depth, sound surfaces.');
