import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const allowed = ['index.html', 'estilos.css', 'dist/app.bundle.js'];
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req, res) => {
    try {
        if (!['GET', 'HEAD'].includes(req.method)) {
            res.writeHead(405, { Allow: 'GET, HEAD' }).end();
            return;
        }
        const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
        if (!allowed.includes(requested)) {
            res.writeHead(404).end('Arquivo não encontrado.');
            return;
        }
        const target = await realpath(path.join(root, requested));
        if (!target.startsWith(await realpath(root) + path.sep) || !(await stat(target)).isFile()) {
            res.writeHead(404).end();
            return;
        }
        const content = await readFile(target);
        res.writeHead(200, { 'Content-Type': mime[path.extname(target)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(req.method === 'HEAD' ? undefined : content);
    } catch {
        res.writeHead(400).end('Não foi possível carregar o arquivo.');
    }
});
server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Porta ${port} em uso. Defina PORT para usar outra porta.` : error.message);
    process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Preview local: http://127.0.0.1:${port}\nCtrl+C encerra o servidor.`));
