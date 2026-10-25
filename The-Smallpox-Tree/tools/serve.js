// 开发/游玩用静态服务器：对所有响应发 Cache-Control: no-store。
// 缘起 2026-10-25：python -m http.server 不发缓存头，Chrome 对刚改的 js/mod.js
// 走启发式缓存直接回旧文件，"刷新后修复不生效"（昨天的 css ?v=2 是同一类问题的手工绕法）。
// 用法：node tools/serve.js [port]   （默认 8395，根目录 = 游戏目录）
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2] || 8395);
const MIME = {
	".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
	".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json",
	".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
	let urlPath = decodeURIComponent(req.url.split("?")[0]);
	if (urlPath === "/") urlPath = "/index.html";
	const file = path.normalize(path.join(root, urlPath));
	if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
	fs.readFile(file, (err, data) => {
		if (err) { res.writeHead(404); return res.end("not found"); }
		res.writeHead(200, {
			"Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
			"Cache-Control": "no-store",
		});
		res.end(data);
	});
}).listen(port, "0.0.0.0", () => console.log(`serving ${root} on http://127.0.0.1:${port} (no-store)`));
