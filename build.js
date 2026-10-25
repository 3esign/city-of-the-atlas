/* Build one self-contained file that opens by double-click.
   The modular source (index.html + city.js + data.js + vendor/) is the one to edit
   and the one GitHub Pages serves. file:// blocks module fetches, so for a disk copy
   everything is folded into a single inline module.
   Run:  node build.js   →  city.html                                           */
const fs = require("fs"), path = require("path");
const here = __dirname;
const read = f => fs.readFileSync(path.join(here, f), "utf8");

let three = read("vendor/three.module.min.js");
const m = three.match(/export\{([^}]*)\};?\s*$/);
if (!m) throw new Error("three: trailing export statement not found");
const map = m[1].split(",").map(p => {
  const [local, name] = p.split(" as ").map(s => s.trim());
  return `${JSON.stringify(name || local)}:${local}`;
});
three = three.slice(0, m.index);

const data = read("data.js").replace(/^\s*export\s*\{[^}]*\};?\s*$/m, "");
const city = read("city.js").replace(/^\s*import[^\n]*\n/gm, "");

const bundle = [
  "/* three.js r169 — MIT, Three.js Authors. Inlined so this file opens from disk.",
  "   Wrapped in its own scope: the minified build uses one-letter top-level names",
  "   that would otherwise collide with ours. */",
  "const THREE = (() => {",
  three,
  `return {${map.join(",")}};`,
  "})();",
  "/* ── dataset ─────────────────────────────────────────────────────────── */",
  data,
  "/* ── city ────────────────────────────────────────────────────────────── */",
  city
].join("\n");

let html = read("index.html").replace('<link rel="stylesheet" href="./hud.css">','<style>'+read("hud.css")+'</style>')
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, "")
  // replacer must be a function: the minified source contains $& and $' sequences
  .replace(/<script type="module" src="\.\/city\.js"><\/script>/,
           () => '<script type="module">\n' + bundle + '\n</script>');

fs.writeFileSync(path.join(here, "city.html"), html);
console.log("city.html", (Buffer.byteLength(html) / 1048576).toFixed(2), "MB");

// A real, script-free alternative from the same dataset, available without WebGL.
const vm = require('vm');
const survey = vm.runInNewContext(data + '\n({M,E,FRAMES,PROGRAMS,LOTS})');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rank = (d,f) => 1 + survey.E.filter(e=>f.score(e)>f.score(d)).length;
const rows = survey.E.map((d,i)=>`<tr><th scope="row"><a href="#entity-${i}">${esc(d.n)}</a></th>${survey.M.map(([k])=>`<td>${d[k]}</td>`).join('')}${survey.FRAMES.map(f=>`<td>${rank(d,f)}</td>`).join('')}</tr>`).join('');
const details = survey.E.map((d,i)=>`<article id="entity-${i}"><span class="key">ENTITY ${String(i+1).padStart(2,'0')} · ${esc(d.kind)}</span><h2>${esc(d.n)}</h2><p class="seat">${esc(d.seat)}</p><p>${esc(d.t)}</p>${d.source?`<p><a href="${esc(d.source)}" rel="noopener" target="_blank">Primary source ↗</a></p>`:''}<a href="index.html?e=${i}">View in the city →</a></article>`).join('');
const proposals = [...survey.PROGRAMS,...survey.LOTS].map(p=>`<article><span class="key">${esc(p.d)} · ${p.st==='built'?'WORKING PROTOTYPE':'PROPOSAL'}</span><h2>${esc(p.n)}</h2><h3>${esc(p.h)}</h3><p>${esc(p.b)}</p></article>`).join('');
const table=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atlas index — City of the Atlas</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#ece6d9;color:#141210;font:16px/1.65 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:clamp(20px,5vw,72px)}a{color:#8d064d;text-underline-offset:4px}a:focus-visible{outline:2px solid currentColor;outline-offset:4px}header{border-top:3px solid #141210;padding-top:24px;margin-bottom:42px}h1{font-size:clamp(34px,6vw,72px);line-height:1.05;letter-spacing:-.04em;margin:22px 0}h2{line-height:1.2;font-size:24px}h3{font-size:17px}.key,.seat{font:12px/1.6 ui-monospace,Consolas,monospace;color:#59544c}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:28px}article{border-top:1px solid #9b9487;padding:22px 0;scroll-margin-top:20px}article p{font-size:14px}.scroll{overflow:auto;border:1px solid #9b9487;margin:24px 0 48px}table{border-collapse:collapse;min-width:800px;width:100%;font-size:12px}th,td{padding:12px 8px;border-bottom:1px solid #c8c0b2;text-align:center}th:first-child{text-align:left;min-width:180px}thead{background:#ded7c9}.intro{max-width:740px}nav{display:flex;gap:24px;flex-wrap:wrap}section{margin:46px 0}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style><main><header><nav><a href="index.html">← Enter the 3D city</a><a href="#measures">Compare scores</a><a href="#contributions">Proposed contributions</a></nav><h1>City of the Atlas.<br>The reading room.</h1><div class="intro"><p>An independent prototype by Semir Poturak / Svemir, built on top of <a href="https://eelfreeschoolofarchitecture.com/">eel Free School of Architecture</a>.</p><p>The 21 entities form an authored study, not a verified ranking. Scores, weights and connections are provisional interpretations. The school has not commissioned or endorsed this instrument. Entity notes inherited from the research draft still need source-by-source calibration; the Taliesin correction has a primary source attached.</p></div></header><section id="measures"><span class="key">HOW TO READ THE CITY</span><h2>Eight measures. Three questions.</h2><p>Each measure is an authored score from 0 to 5. Equal totals share a rank. Heights use model units, not actual building dimensions; the baseline is 9 units and the maximum is 95. In contour mode, eight measures occupy fixed angular directions; access opens the atrium; evidence sets floor count; autonomy minus recognition sets twist. Terraces offer the previous sorted measure representation. See <a href="METHOD.md">the complete mapping</a>. Connecting lines are proposed analytical relationships.</p><p><b>F01:</b> Autonomy + World + Matter + Episteme + Access.<br><b>F02:</b> 2 × Recognition + 2 × Evidence + Matter.<br><b>F03:</b> 3 × Cosmology + World + Matter.</p><p>These are our formulas. F02 does not determine registration eligibility; F03 is an interpretation inspired by cosmotechnics, not a measurement proposed by Yuk Hui.</p><div class="scroll" tabindex="0" role="region" aria-label="Scores and ranks; scroll horizontally"><table><thead><tr><th>Entity</th>${survey.M.map(([,name])=>`<th scope="col">${esc(name)}</th>`).join('')}<th scope="col">F01 rank</th><th scope="col">F02 rank</th><th scope="col">F03 rank</th></tr></thead><tbody>${rows}</tbody></table></div><div class="grid">${details}</div></section><section id="contributions"><span class="key">WHAT WE COULD BUILD TOGETHER</span><h2>Proposed contributions</h2><p>Only the atlas prototype is implemented here. All other plots represent proposals, not an assessment that the school has no existing work.</p><div class="grid">${proposals}</div></section><section id="colophon"><span class="key">COLOPHON · AN OPEN EXPERIMENT</span><h2>Who made this, and on what terms.</h2><div class="grid"><article><h3>The experiment</h3><p>Twenty-one entities of architectural education given built form by eight authored measures and three frames. Every score is published, every formula documented, and every disagreement with them welcome: the instrument exists so that the reading can be contested.</p></article><article><h3>Who made it</h3><p><b>Semir Poturak</b> — architect, university educator and PhD researcher working on architectural education, computation and fabrication. Drawn, tested and verified inside <b>Svemir</b>, his open working universe in which several AI minds plan, build and check one another's work in parallel.</p></article><article><h3>Independence</h3><p>Inspired by <a href="https://eelfreeschoolofarchitecture.com/">eel Free School of Architecture</a>. Independently made; not affiliated with, commissioned by, or endorsed by the school. Scores are provisional interpretations, not institutional ratings.</p></article><article><h3>Collaboration</h3><p>Open source under the MIT license. Correct a score, propose an entity, add a frame, or fork the whole city for another field of knowledge. <a href="https://github.com/3esign/city-of-the-atlas">Repository ↗</a> · <a href="https://github.com/3esign/city-of-the-atlas/issues">Start a conversation ↗</a></p></article></div></section><footer><a href="index.html">Return to the city →</a><p class="key">LOCAL PROTOTYPE · 24 OCTOBER 2026 · NO EXTERNAL ASSETS REQUIRED</p></footer></main></html>`;
fs.writeFileSync(path.join(here,'atlas-table.html'),table);
console.log('atlas-table.html',Buffer.byteLength(table),'bytes; 21 entities + 15 contributions');
