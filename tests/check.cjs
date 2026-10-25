// Content/build invariants for the public static artifact. Browser QA is separate.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(read('data.js').replace(/export\s*\{[^}]+\};?/,'')+';globalThis.data={M,E,FRAMES,PROGRAMS,LOTS}',ctx);
const {M,E,FRAMES,PROGRAMS,LOTS}=ctx.data;
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
assert(/const ENGINE = \{ on: true/.test(cj),'engine must be the default reading');
assert(cj.includes('() => toggleEngine(true)'),'engine state must be applied on the first frame');
console.log('PASS: dataset ranges, frame bounds, DOM identity, local links, offline bundle, reading room, attribution and dependency license.');
