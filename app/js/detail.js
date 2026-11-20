// The detail panel: one trophy at a time — its official name, description and
// grade, this guide's own-words walkthrough, and the sources the guide's facts
// were checked against, named and linked beside it.

import { KIND_LABELS, countText, displayDescription, displayName, isMasked } from './data.js';
import { trophyMetaPills } from './render.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderDetail(trophy, store, { onToggle }) {
  const pane = document.getElementById('detail');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'detail-hint', 'Pick a trophy from the checklist to read its guide.'));
    return;
  }

  const earned = store.earned.has(trophy.name);
  const masked = isMasked(trophy, store.settings, store.earned);

  const gradePill = el('span', `pill grade-${trophy.grade}`, trophy.grade.toUpperCase());
  const title = el('h2', null, displayName(trophy, masked));
  const official = el('p', 'detail-official', displayDescription(trophy, masked));

  const meta = el('div', 'detail-meta');
  for (const p of trophyMetaPills(trophy)) meta.append(p);
  const count = countText(trophy);
  if (count) meta.append(el('span', 'pill', `PlayStation tracks: ${count.replace(' total', '')}`));

  pane.append(gradePill, title, official, meta);

  pane.append(el('h3', null, 'Guide'));
  if (masked) {
    pane.append(
      el(
        'p',
        'detail-guide',
        'This guide is hidden while spoiler protection is on, because it talks about the story. Earn the trophy to reveal it, or turn “Hide spoilers” off in the controls.',
      ),
    );
  } else {
    pane.append(el('p', 'detail-guide', trophy.guide));
  }

  if (trophy.missable) {
    pane.append(el('h3', null, 'Missable'));
    pane.append(
      el(
        'p',
        'detail-guide',
        'Flagged missable: one of this trophy\'s spots — the meditation at Jason\'s house — is only offered during Chapter 1 and closes when the chapter ends. Do that spot inside Chapter 1 and keep a manual save from before the chapter break.',
      ),
    );
  }

  pane.append(el('h3', null, 'Sources'));
  const sources = el('ul', 'sources-list');
  for (const source of trophy.sources ?? []) {
    const li = el('li');
    if (source.url) {
      const a = el('a', null, source.name);
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.append(a);
    } else {
      li.append(source.name);
    }
    sources.append(li);
  }
  if ((trophy.sources ?? []).length === 0) {
    sources.append(el('li', null, 'The official PlayStation trophy list.'));
  }
  pane.append(sources);
  pane.append(
    el('p', 'detail-hint', 'Guides are written for this tracker in its own words; sources are cited, never copied. Links open only when you follow them — this page itself loads nothing from the network.'),
  );

  const button = el('button', `detail-earn${earned ? ' is-earned' : ''}`, earned ? 'Earned — tap to undo' : 'Mark as earned');
  button.type = 'button';
  button.addEventListener('click', () => onToggle(trophy));
  pane.append(button);

  pane.dataset.trophyId = String(trophy.id);
}
