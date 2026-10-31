import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.argv[2] || 5173);
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.markdown': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
    }

    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const filePath = resolve(siteRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
        if (!filePath.startsWith(`${siteRoot}${sep}`) || pathname.split('/').some((part) => part.startsWith('.'))) {
            response.writeHead(404);
            response.end();
            return;
        }

        const content = await readFile(filePath);
        response.writeHead(200, {
            'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        });
        response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'EISDIR') {
            const content = await readFile(resolve(siteRoot, '404.html')).catch(() => '<h1>Page not found</h1>');
            response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            response.end(request.method === 'HEAD' ? undefined : content);
        } else {
            response.writeHead(500);
            response.end('Unable to load the page.');
        }
    }
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Local: http://127.0.0.1:${port}`);
});
