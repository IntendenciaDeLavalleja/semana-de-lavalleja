import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../Semana-de-Lavalleja-53.html', import.meta.url);
const source = await readFile(sourcePath, 'utf8');

const outputDirectories = [
  new URL('../reference/', import.meta.url),
  new URL('../public/brand/', import.meta.url),
  new URL('../public/images/program/', import.meta.url),
  new URL('../public/images/social/', import.meta.url),
  new URL('../public/partners/', import.meta.url),
  new URL('../src/styles/', import.meta.url),
];

await Promise.all(outputDirectories.map((directory) => mkdir(directory, { recursive: true })));
await writeFile(new URL('../reference/Semana-de-Lavalleja-53.html', import.meta.url), source);

const resourceNames = [
  'public/images/social/semana-lavalleja-og.jpg',
  'public/favicon.svg',
  'public/brand/semana-lavalleja.svg',
  'public/brand/hero-emblem.svg',
  'public/images/program/programa-07.webp',
  'public/images/program/programa-08.webp',
  'public/images/program/programa-09.webp',
  'public/images/program/programa-10.webp',
  'public/images/program/programa-11.webp',
  'public/brand/semana-lavalleja-footer.svg',
  'public/partners/uruguay-natural-mintur.png',
  'public/partners/intendencia-lavalleja.png',
  'public/partners/mec.png',
];

const dataUris = [...source.matchAll(/data:([^;,]+)(;base64)?,([^"')\s]+)/g)];
if (dataUris.length !== resourceNames.length) {
  throw new Error(`Expected ${resourceNames.length} embedded resources, found ${dataUris.length}.`);
}

const checksums = [];
for (const [index, match] of dataUris.entries()) {
  const [, mimeType, base64, payload] = match;
  const bytes = base64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload));
  const relativePath = resourceNames[index];
  await writeFile(new URL(`../${relativePath}`, import.meta.url), bytes);
  checksums.push({
    path: relativePath,
    mimeType,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}

const styleBlocks = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
if (styleBlocks.length !== 1) {
  throw new Error(`Expected one style block, found ${styleBlocks.length}.`);
}

await writeFile(
  new URL('../src/styles/legacy.css', import.meta.url),
  `${styleBlocks[0][1].trim()}\n`,
);
await writeFile(
  new URL('../reference/assets-checksums.json', import.meta.url),
  `${JSON.stringify(checksums, null, 2)}\n`,
);

console.log(
  `Preserved the original template and extracted ${checksums.length} embedded resources.`,
);
