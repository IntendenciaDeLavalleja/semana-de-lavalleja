import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(new URL('../reference/', import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const mime = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
  const requested = resolve(root, pathname.replace(/^\/+/, ''));
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = await stat(requested);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': mime[extname(requested)] || 'application/octet-stream',
    });
    createReadStream(requested).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log('Reference server: http://127.0.0.1:4173'));
