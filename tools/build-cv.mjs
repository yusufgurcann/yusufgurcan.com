#!/usr/bin/env node
/**
 * Generates the CV PDFs from the site content.
 *
 *   npm run cv
 *
 * 1. builds the site,
 * 2. serves dist/ with a tiny built-in static server on a free port,
 * 3. prints /cv/ and /en/cv/ to PDF with headless Chrome,
 * 4. writes them to public/cv/ (picked up by the next build / deploy).
 *
 * Set CHROME_PATH to use a different Chromium-based browser.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');
const OUT_DIR = join(ROOT, 'public', 'cv');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

/** Route → output file. Keep in sync with `contact.cv` in src/config/site.ts. */
const TARGETS = [
  { route: '/cv/', file: 'yusuf-gurcan-cv.pdf' },
  { route: '/en/cv/', file: 'yusuf-gurcan-cv-en.pdf' },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function findChrome() {
  const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
  if (!chrome) throw new Error('No Chromium-based browser found. Set CHROME_PATH.');
  return chrome;
}

/** Serves dist/ on a random free port; resolves to { url, close }. */
function serveDist() {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let file = normalize(join(DIST_DIR, pathname));
    if (!file.startsWith(DIST_DIR)) {
      response.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

/** Runs a command to completion, blocking (fine before the server starts). */
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

/**
 * Runs a command without blocking the event loop — required while our own
 * HTTP server has to keep answering Chrome's requests.
 */
function runAsync(command, args, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'ignore' });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${command} timed out`));
    }, timeoutMs);
    child.on('error', reject);
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  const chrome = findChrome();

  console.log('› Building site…');
  run('npx', ['astro', 'build']);

  const server = await serveDist();
  const base = server.url;

  try {
    mkdirSync(OUT_DIR, { recursive: true });

    for (const { route, file } of TARGETS) {
      const output = join(OUT_DIR, file);
      console.log(`› Printing ${route} → public/cv/${file}`);
      await runAsync(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        `--print-to-pdf=${output}`,
        `${base}${route}`,
      ]);
    }
  } finally {
    server.close();
  }

  console.log('✓ CV PDFs updated. Run `npm run build` (or deploy) to publish them.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
