// Leonida Legend — hand-in program for the gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is this directory's app/ folder: plain static files (ES modules, CSS, one JSON data
// file) that a browser opens at app/index.html with the network off. This program hands the entry in:
// it copies app/ and screenshots/ from beside this file to the output directory, checks the copy the
// way the gate will (55 official trophies, every one with a guide, no more than 4 screenshots), and
// writes dossier.json there with the vendored make.fun library — byte for byte what the scorer's own
// copy of buildDossier writes from the same files. vendor/makefun-frontend.ts is left exactly as the
// kit issued it; if it changed, the dossiers would no longer match.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const EXPECTED_TROPHIES = 55;

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Check the copy that was just handed in, not the source it came from: the gate reads /output, so
// /output is what gets verified. The trophy file must name all 55 official trophies with a guide for
// each (the gate's trophies row), and the screenshot count must sit inside the gate's 3-to-4 window.
const trophyDoc = JSON.parse(readFileSync(join(out, 'app', 'data', 'trophies.json'), 'utf8'));
const trophies: Array<{ name?: unknown; guide?: unknown; sources?: unknown }> = Array.isArray(trophyDoc) ? trophyDoc : trophyDoc.trophies;
if (!Array.isArray(trophies) || trophies.length !== EXPECTED_TROPHIES) {
  throw new Error(`trophies.json must hold ${EXPECTED_TROPHIES} trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
}
const unguided = trophies.filter((t) => typeof t.guide !== 'string' || t.guide.trim() === '').map((t) => String(t.name));
if (unguided.length > 0) throw new Error(`trophies without a guide: ${unguided.join(', ')}`);
// A guide without its sources is half the entry's promise — the player is told, per trophy, where the
// facts were checked. Refuse the hand-in if any trophy's source list is missing or empty.
const unsourced = trophies
  .filter((t) => !Array.isArray(t.sources) || t.sources.length === 0)
  .map((t) => String(t.name));
if (unsourced.length > 0) throw new Error(`trophies without sources: ${unsourced.join(', ')}`);

const shots = readdirSync(join(out, 'screenshots')).filter((name) => !name.startsWith('.'));
if (shots.length < 3 || shots.length > 4) throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`handed in: ${trophies.length} trophies, all guided; ${shots.length} screenshots; dossier.json written to ${out}`);
