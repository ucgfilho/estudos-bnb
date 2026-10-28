import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { handleApiRequest } from './app';
import { createAppContainer } from './container';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveStaticFile(distDir: string, req: IncomingMessage, res: ServerResponse): void {
  const rawUrl = (req.url ?? '/').split('?')[0];

  if (rawUrl === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('healthy\n');
    return;
  }

  const safeRelPath = normalize(decodeURIComponent(rawUrl)).replace(/^(\.\.(\/|\\|$))+/, '');
  let targetPath = join(distDir, safeRelPath);

  if (!targetPath.startsWith(distDir)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  if (!existsSync(targetPath) || statSync(targetPath).isDirectory()) {
    targetPath = join(distDir, 'index.html');
  }

  if (!existsSync(targetPath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Arquivo não encontrado.' }));
    return;
  }

  const ext = extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  if (rawUrl.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }

  createReadStream(targetPath).pipe(res);
}

export async function startServer(): Promise<void> {
  const container = createAppContainer();
  await container.seedReady;

  const distDir = resolve(process.cwd(), 'dist');

  const server = createServer(async (req, res) => {
    const handled = await handleApiRequest(container, req, res);
    if (!handled) {
      serveStaticFile(distDir, req, res);
    }
  });

  server.listen(container.env.port, '0.0.0.0', () => {
    console.log(
      `[Estudos BNB] Servidor ativo em http://0.0.0.0:${container.env.port} (DB: ${container.env.dbPath})`,
    );
  });
}

const isMainModule =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMainModule) {
  startServer().catch((err) => {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  });
}
