// Leonida Legend — entry point. Loads the trophy data, restores the player's
// progress, wires the controls, and keeps the checklist, the detail panel and
// the roadmap in step with one shared store.

import { GRADE_ORDER, loadTrophies, matchesQuery } from './data.js';
import { buildExport, loadStore, parseImport, saveStore, toggleEarned } from './store.js';
import { filterTrophies, renderKindChips, renderList, renderSummary } from './render.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';

const store = loadStore();
let trophies = [];
let byId = new Map();

function selectedTrophy() {
  return byId.get(store.settings.selectedId) ?? trophies[0] ?? null;
}

function note(message) {
  document.getElementById('io-note').textContent = message;
}

function renderAll() {
  renderSummary(trophies, store.earned);
  renderKindChips(trophies, store.settings.kind, (kind) => {
    store.settings.kind = kind;
    saveStore(store);
    renderAll();
  });
  const visible = filterTrophies(trophies, store.settings, matchesQuery);
  renderList(visible, store, { onSelect: selectTrophy, onToggle: toggle });
  renderDetail(selectedTrophy(), store, { onToggle: toggle });
  renderRoadmap(trophies, store, { onSelect: selectTrophy });
  applyView();
}

function applyView() {
  const roadmap = store.settings.view === 'roadmap';
  document.getElementById('checklist-view').hidden = roadmap;
  document.getElementById('roadmap-view').hidden = !roadmap;
  document.getElementById('tab-checklist').classList.toggle('is-active', !roadmap);
  document.getElementById('tab-roadmap').classList.toggle('is-active', roadmap);
  document.getElementById('tab-checklist').setAttribute('aria-selected', String(!roadmap));
  document.getElementById('tab-roadmap').setAttribute('aria-selected', String(roadmap));
}

function setView(view) {
  store.settings.view = view;
  saveStore(store);
  applyView();
}

function selectTrophy(trophy) {
  store.settings.selectedId = trophy.id;
  if (store.settings.view !== 'checklist') store.settings.view = 'checklist';
  saveStore(store);
  renderAll();
  document.getElementById('detail').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function toggle(trophy) {
  const nowEarned = toggleEarned(store, trophy.name);
  note(nowEarned ? `Marked “${trophy.name}” as earned.` : `Marked “${trophy.name}” as not earned.`);
  renderAll();
}

function wireControls() {
  document.getElementById('tab-checklist').addEventListener('click', () => setView('checklist'));
  document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));

  const search = document.getElementById('search');
  search.value = store.settings.query;
  search.addEventListener('input', () => {
    store.settings.query = search.value;
    saveStore(store);
    renderAll();
  });

  const grade = document.getElementById('grade-filter');
  grade.value = store.settings.grade;
  grade.addEventListener('change', () => {
    store.settings.grade = grade.value;
    saveStore(store);
    renderAll();
  });

  const sort = document.getElementById('sort');
  sort.value = store.settings.sort;
  sort.addEventListener('change', () => {
    store.settings.sort = sort.value;
    saveStore(store);
    renderAll();
  });

  const spoilers = document.getElementById('spoiler-toggle');
  spoilers.checked = store.settings.spoilers;
  spoilers.addEventListener('change', () => {
    store.settings.spoilers = spoilers.checked;
    saveStore(store);
    renderAll();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([buildExport(store)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leonida-legend-progress.json';
    link.click();
    URL.revokeObjectURL(link.href);
    note(`Exported ${store.earned.size} earned trophies to leonida-legend-progress.json.`);
  });

  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const result = parseImport(await file.text(), new Set(trophies.map((t) => t.name)));
    if (!result.ok) {
      note(`Import failed: ${result.error}`);
      return;
    }
    store.earned = result.earned;
    saveStore(store);
    renderAll();
    note(
      `Imported ${result.earned.size} earned trophies.` +
        (result.dropped > 0 ? ` ${result.dropped} name(s) in the file are not on the official list and were ignored.` : ''),
    );
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!window.confirm('Clear every earned tick and start the tracker over?')) return;
    store.earned = new Set();
    saveStore(store);
    renderAll();
    note('Progress cleared.');
  });
}

async function boot() {
  try {
    const { trophies: loaded } = await loadTrophies();
    trophies = loaded.map((t) => ({ ...t, gradeRank: GRADE_ORDER[t.grade] ?? 99 }));
    byId = new Map(trophies.map((t) => [t.id, t]));
    if (!byId.has(store.settings.selectedId)) store.settings.selectedId = trophies[0].id;
    wireControls();
    renderAll();
  } catch (error) {
    document.getElementById('list-count').textContent =
      'The trophy data could not be loaded. Serve this folder with any static file server (for example the kit’s serve.ts) and reload.';
    console.error(error);
  }
}

boot();
