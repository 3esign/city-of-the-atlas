/* serve.js — one static server on the LAN so the phone can open the city.
   node serve.js [port]   →  http://<your ip>:8788/   (no dependency) */
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const ROOT = __dirname, PORT = +(process.argv[2] || 8787);
const TYPES = { ".html": "text/html;charset=utf-8", ".js": "text/javascript", ".css":"text/css", ".svg":"image/svg+xml",
  ".png": "image/png", ".md": "text/plain;charset=utf-8", ".json": "application/json" };

http.createServer((q, s) => {
  if (!['GET','HEAD'].includes(q.method)) return s.writeHead(405, {allow:'GET, HEAD'}).end();
  let f;
  try { f = decodeURIComponent(q.url.split("?")[0].split("#")[0]); }
  catch (_) { return s.writeHead(400).end('Invalid path'); }
  if (f.includes('\0') || f.includes('\\')) return s.writeHead(400).end('Invalid path');
  if (f === "/") f = "/index.html";
  const p = path.resolve(ROOT, "." + f);
  const relative = path.relative(ROOT, p);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(p) || !fs.statSync(p).isFile())
    return s.writeHead(404, { "content-type": "text/plain" }).end("not here");
  s.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream",
                     "cache-control": "no-store", "x-content-type-options":"nosniff",
                     "content-length":fs.statSync(p).size });
  if(q.method === 'HEAD') return s.end();
  fs.createReadStream(p).on('error',()=>s.destroy()).pipe(s);
}).listen(PORT, "0.0.0.0", () => {
  const ips = Object.values(os.networkInterfaces()).flat()
    .filter(n => n.family === "IPv4" && !n.internal).map(n => n.address);
  console.log("city of the atlas — on:", ips.map(i => `http://${i}:${PORT}/`).join("  "));
});
