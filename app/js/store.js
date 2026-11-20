// Progress store: which trophies are earned, plus the tracker's own settings.
// Everything lives in this browser's localStorage under one key; export/import
// moves the same shape through a JSON file the player owns.

export const STORAGE_KEY = 'leonida-legend-tracker-v1';
export const EXPORT_APP_ID = 'leonida-legend-gta6-tracker';

const DEFAULT_SETTINGS = {
  spoilers: true,
  kind: 'all',
  grade: 'all',
  sort: 'roadmap',
  query: '',
  view: 'checklist',
  selectedId: 28,
};

export function loadStore() {
  let parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    parsed = null;
  }
  const earned = new Set(Array.isArray(parsed?.earned) ? parsed.earned.filter((n) => typeof n === 'string') : []);
  const settings = { ...DEFAULT_SETTINGS, ...(parsed?.settings ?? {}) };
  return { earned, settings };
}

export function saveStore(store) {
  const payload = { earned: [...store.earned], settings: store.settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable (private mode, quotas). The tracker keeps
    // working for the session; only persistence is lost.
  }
}

export function toggleEarned(store, name) {
  if (store.earned.has(name)) store.earned.delete(name);
  else store.earned.add(name);
  saveStore(store);
  return store.earned.has(name);
}

// The export file: self-describing, so an import can tell a tracker file from
// any other JSON a player might pick by mistake.
export function buildExport(store) {
  return JSON.stringify(
    {
      app: EXPORT_APP_ID,
      version: 1,
      game: 'Grand Theft Auto VI',
      platform: 'PlayStation 5',
      exportedAt: new Date().toISOString(),
      earned: [...store.earned].sort(),
    },
    null,
    2,
  );
}

// Accepts the export shape above, the starter tracker's bare array of names,
// or any object with an "earned" array. Unknown names are reported, not kept.
export function parseImport(text, validNames) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const names = Array.isArray(data) ? data : data?.earned;
  if (!Array.isArray(names) || names.some((n) => typeof n !== 'string')) {
    return { ok: false, error: 'That file does not hold a list of trophy names.' };
  }
  const kept = names.filter((n) => validNames.has(n));
  const dropped = names.length - kept.length;
  return { ok: true, earned: new Set(kept), dropped };
}
