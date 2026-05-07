#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS = resolve(ROOT, 'assets');
const SOURCE_SVG = resolve(ASSETS, 'icon.svg');
const ICONSET = resolve(ASSETS, 'icon.iconset');
const OUT_PNG = resolve(ASSETS, 'icon.png');
const OUT_ICNS = resolve(ASSETS, 'icon.icns');
const WEBSITE_SVG = resolve(ROOT, 'website', 'src', 'app', 'icon.svg');

const ICONSET_VARIANTS = [
  { size: 16, name: 'icon_16x16.png' },
  { size: 32, name: 'icon_16x16@2x.png' },
  { size: 32, name: 'icon_32x32.png' },
  { size: 64, name: 'icon_32x32@2x.png' },
  { size: 128, name: 'icon_128x128.png' },
  { size: 256, name: 'icon_128x128@2x.png' },
  { size: 256, name: 'icon_256x256.png' },
  { size: 512, name: 'icon_256x256@2x.png' },
  { size: 512, name: 'icon_512x512.png' },
  { size: 1024, name: 'icon_512x512@2x.png' },
];

async function renderPng(svgBuffer, size, outPath) {
  await sharp(svgBuffer, { density: Math.max(72, Math.ceil(size / 1024 * 72 * 4)) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

async function main() {
  const svg = readFileSync(SOURCE_SVG);

  rmSync(ICONSET, { recursive: true, force: true });
  mkdirSync(ICONSET, { recursive: true });

  for (const { size, name } of ICONSET_VARIANTS) {
    await renderPng(svg, size, resolve(ICONSET, name));
  }

  await renderPng(svg, 1024, OUT_PNG);

  try {
    execFileSync('iconutil', ['-c', 'icns', ICONSET, '-o', OUT_ICNS], { stdio: 'inherit' });
  } catch (err) {
    console.error('iconutil failed (macOS only). Skipping .icns generation.', err);
  }

  rmSync(ICONSET, { recursive: true, force: true });

  copyFileSync(SOURCE_SVG, WEBSITE_SVG);

  console.log('Icons generated:');
  console.log(`  ${OUT_PNG}`);
  console.log(`  ${OUT_ICNS}`);
  console.log(`  ${WEBSITE_SVG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
