// Content/build invariants for the public static artifact. Browser QA is separate.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(read('data.js').replace(/export\s*\{[^}]+\};?/,'')+';globalThis.data={M,E,FRAMES,PROGRAMS,LOTS}',ctx);
const {M,E,FRAMES,PROGRAMS,LOTS}=ctx.data;
assert.equal(E.length,21);assert.equal(M.length,8);assert.equal(FRAMES.length,3);
for(const e of E)for(const [k]of M)assert(Number.isInteger(e[k])&&e[k]>=0&&e[k]<=5,`${e.n}: ${k}`);
for(const f of FRAMES)for(const e of E)assert(f.score(e)>=0&&f.score(e)<=f.max);
assert.equal(PROGRAMS.length+LOTS.length,15);
const html=read('index.html'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate DOM id');
for(const tag of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 const target=tag[1].split(/[?#]/)[0];if(!target||/^(?:https?:|data:|mailto:)/.test(target))continue;
 assert(fs.existsSync(path.resolve(root,target)),`missing local resource ${target}`);
}
assert(!/<script[^>]+src="https?:/.test(html),'remote runtime script');
assert(!read('city.html').includes('src="./city.js"'),'offline bundle still imports city');
assert(!read('city.html').includes('href="./hud.css"'),'offline bundle still imports CSS');
assert.equal((read('atlas-table.html').match(/<article/g)||[]).length,36);
assert(read('NOTICE.md').includes('not affiliated with'));
assert(read('vendor/THREE-LICENSE.txt').includes('Permission is hereby granted'));
console.log('PASS: dataset ranges, frame bounds, DOM identity, local links, offline bundle, reading room, attribution and dependency license.');
