// Checklist rendering: the progress summary, the kind filter chips and the
// trophy cards themselves. Everything is built with DOM calls and textContent,
// so trophy text is always shown as text, never parsed as markup.

import { GRADES, KIND_LABELS, KIND_ORDER, countText, displayDescription, displayName, isMasked } from './data.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function pill(text, className) {
  return el('span', `pill ${className ?? ''}`.trim(), text);
}

export function trophyMetaPills(trophy) {
  const pills = [];
  pills.push(pill(KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.missable) pills.push(pill('MISSABLE', 'missable'));
  const count = countText(trophy);
  if (count) pills.push(pill(count, 'count'));
  pills.push(pill(`Roadmap stage ${trophy.stage}`));
  return pills;
}

export function renderSummary(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progress-count').textContent = String(done);
  document.getElementById('progress-line').textContent =
    `${done} of ${total} trophies earned — ${pct}% of the road to the platinum.`;
  const ring = document.getElementById('ring-fill');
  const circumference = 226.2;
  ring.style.strokeDashoffset = String(circumference * (1 - done / total));

  const chips = document.getElementById('grade-chips');
  chips.replaceChildren();
  for (const grade of GRADES) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    const li = el('li');
    li.append(`${grade[0].toUpperCase()}${grade.slice(1)} `);
    const b = el('b', null, `${got}/${inGrade.length}`);
    li.append(b);
    chips.append(li);
  }

  const alert = document.getElementById('missable-alert');
  const openMissables = trophies.filter((t) => t.missable && !earned.has(t.name));
  if (openMissables.length > 0) {
    alert.replaceChildren();
    const strong = el('strong', null, 'Missable watch: ');
    alert.append(
      strong,
      `${openMissables.map((t) => t.name).join(', ')} — one Chapter 1 meditation spot closes for good when the chapter ends. Meditate at Jason's house before you finish Chapter 1.`,
    );
  } else {
    alert.textContent = '';
  }
}

export function renderKindChips(trophies, activeKind, onPick) {
  const wrap = document.getElementById('kind-chips');
  wrap.replaceChildren();
  const counts = new Map(KIND_ORDER.map((k) => [k, 0]));
  for (const t of trophies) counts.set(t.kind, (counts.get(t.kind) ?? 0) + 1);
  const make = (kind, label, n) => {
    const button = el('button', `kind-chip${kind === activeKind ? ' is-active' : ''}`, label);
    button.type = 'button';
    const span = el('span', 'n', ` ${n}`);
    button.append(span);
    button.addEventListener('click', () => onPick(kind));
    return button;
  };
  wrap.append(make('all', 'All kinds', trophies.length));
  for (const kind of KIND_ORDER) wrap.append(make(kind, KIND_LABELS[kind], counts.get(kind) ?? 0));
}

export function filterTrophies(trophies, settings, matchesQuery) {
  const sorters = {
    roadmap: (a, b) => a.order - b.order,
    list: (a, b) => a.id - b.id,
    name: (a, b) => a.name.localeCompare(b.name),
    grade: (a, b) => a.gradeRank - b.gradeRank || a.order - b.order,
  };
  return trophies
    .filter((t) => settings.kind === 'all' || t.kind === settings.kind)
    .filter((t) => settings.grade === 'all' || t.grade === settings.grade)
    .filter((t) => matchesQuery(t, settings.query))
    .sort(sorters[settings.sort] ?? sorters.roadmap);
}

export function renderList(trophies, store, { onSelect, onToggle }) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  document.getElementById('list-count').textContent =
    `Showing ${trophies.length} of 55 trophies — click one to read its guide.`;
  document.getElementById('empty-note').hidden = trophies.length !== 0;

  for (const trophy of trophies) {
    const earned = store.earned.has(trophy.name);
    const masked = isMasked(trophy, store.settings, store.earned);

    const li = el('li', `card${earned ? ' is-earned' : ''}${masked ? ' masked' : ''}${store.settings.selectedId === trophy.id ? ' is-selected' : ''}`);
    li.tabIndex = 0;
    li.setAttribute('aria-label', `${displayName(trophy, masked)} — ${trophy.grade}`);

    const checkWrap = el('span', 'card-check');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.title = earned ? 'Mark as not earned' : 'Mark as earned';
    box.setAttribute('aria-label', `Mark ${trophy.name} as ${earned ? 'not earned' : 'earned'}`);
    box.addEventListener('change', () => onToggle(trophy));
    checkWrap.append(box);

    const main = el('div', 'card-main');
    const name = el('p', 'card-name');
    const order = el('span', 'order-no', `#${trophy.order}`);
    name.append(order, displayName(trophy, masked));
    const desc = el('p', 'card-desc', displayDescription(trophy, masked));
    const meta = el('div', 'card-meta');
    for (const p of trophyMetaPills(trophy)) meta.append(p);
    main.append(name, desc, meta);

    const grade = el('span', `card-grade grade-text-${trophy.grade}`, trophy.grade);

    li.append(checkWrap, main, grade);
    li.addEventListener('click', (event) => {
      if (event.target !== box) onSelect(trophy);
    });
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target === li) onSelect(trophy);
    });
    list.append(li);
  }
}
