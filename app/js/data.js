// Trophy data: loads app/data/trophies.json (the official list plus this
// guide's own layer) and holds the small vocabularies the UI shares.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

// The filter row is built from this list, in this order, so the Online kind is
// present even though GTA VI has no online trophies (its count reads 0).
export const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'online'];

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) throw new Error('trophies.json holds no trophies');
  return { doc, trophies };
}

// A trophy is spoiler-masked when the player asked for protection, the trophy
// is one of the hidden story set, and it has not been earned yet.
export function isMasked(trophy, settings, earned) {
  return Boolean(settings.spoilers && trophy.hidden && !earned.has(trophy.name));
}

export function displayName(trophy, masked) {
  return masked ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(trophy, masked) {
  return masked ? 'A story trophy, hidden until earned — spoiler protection is on.' : trophy.description;
}

// The count PlayStation tracks for a trophy, where the official list has one.
export function countText(trophy) {
  if (typeof trophy.count !== 'number') return null;
  if (trophy.count >= 10000) return `$${trophy.count.toLocaleString('en-US')} total`;
  return `${trophy.count} total`;
}

export function matchesQuery(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name}\n${trophy.description}\n${trophy.guide}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}
