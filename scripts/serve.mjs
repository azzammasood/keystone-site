// Minimal static server for the exported site (out/), under the same base path Pages uses.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, posix } from "node:path";

const ROOT = "out";
const BASE = process.env.KEYSTONE_BASE_PATH ?? "";
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  if (BASE && !path.startsWith(BASE)) return send(res, 404, join(ROOT, "404.html"));
  path = posix.normalize(path.slice(BASE.length) || "/");
  if (path.includes("..")) return send(res, 400);
  let file = join(ROOT, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return send(res, 404, join(ROOT, "404.html"));
  send(res, 200, file);
}).listen(PORT, "127.0.0.1", () => console.log(`serving ${ROOT} at http://127.0.0.1:${PORT}${BASE}/`));

function send(res, code, file) {
  res.writeHead(code, { "Content-Type": (file && TYPES[extname(file)]) || "text/plain" });
  res.end(file && existsSync(file) ? readFileSync(file) : String(code));
}
