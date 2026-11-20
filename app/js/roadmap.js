// The roadmap view: the seven stages this guide orders the 55 trophies into,
// from the opening mission to the platinum, with the missable warning where it
// belongs — inside stage 1, before Chapter 1 closes.

import { displayName, isMasked } from './data.js';

export const STAGES = [
  {
    n: 1,
    title: 'Play the story — Chapters 1 to 4',
    time: 'the campaign’s first stretch',
    blurb:
      'Work through the chapters and the named story missions in order; the story trophies land on their own as each one ends. Two habits start now and pay off for 200 hours: scan every new vehicle with the WAiNK app, and study animals through binoculars as you pass them. And one deadline hides in this stage — the Chapter 1 meditation at Jason’s house, the game’s only missable beat.',
  },
  {
    n: 2,
    title: 'The final mission',
    time: 'the gold at the end of Chapter 5',
    blurb:
      'Bank a manual save, then play the finale. Free roam continues after the credits and the 100% checklist unlocks, so nothing unfinished is lost — the finale is a beginning, not a point of no return.',
  },
  {
    n: 3,
    title: 'Strangers, freaks and character quests',
    time: 'about 10 hours',
    blurb:
      'Close out the five named strands — Andy (Lucia-only), Kenton, Billy, Randy and Tyrone (Jason-only) — plus Bret’s hunting quests, and finish eight full strands for the Strangers & Freaks silver. Quest givers tied to trophies return after the story, so anything skipped can be swept up here.',
  },
  {
    n: 4,
    title: 'Ranges, races and pastimes',
    time: 'skill grinds, at your pace',
    blurb:
      'The activity circuit: gold in all 42 Shooting Range challenges, a Top Fun win at all 14 drone locations, 20 different race wins, the activity sampler, and challenges banked toward 50. Everything in this stage is repeatable and nothing in it can be missed.',
  },
  {
    n: 5,
    title: 'Crime pays',
    time: 'the robbery circuit',
    blurb:
      'Robberies and free-roam feats: five bank vaults with clean escapes, one illegal operation from each of the 9 gangs, an armored truck, a silent jewelry store — and the partner trophies, which need Jason and Lucia together in free roam. Set the partner feats up deliberately; they are quick when planned and fiddly when improvised.',
  },
  {
    n: 6,
    title: 'Collections and the long grinds',
    time: 'spread across the whole run',
    blurb:
      'The counters that reward starting early: 3 card sets, 100 WAiNK locations, 100 vehicles discovered, all 52 areas explored, 500 choices, the money trophies and all 8 garages. Most of this stage should already be half done from habits built in stage 1.',
  },
  {
    n: 7,
    title: '100% completion — and the platinum',
    time: 'about 100 hours for the checklist',
    blurb:
      'Open Progress, then Stats, then 100% Completion, and work the in-game checklist down — it asks for roughly 60% of everything, with every robbery, range, drone race and Bret quest in full. When A Long Road lands, the platinum follows it into your account on its own.',
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, store, { onSelect }) {
  const view = document.getElementById('roadmap-view');
  view.replaceChildren();

  const intro = el('section', 'roadmap-intro');
  intro.append(el('h2', null, 'The road to Vice Got a Price!'));
  intro.append(
    el(
      'p',
      null,
      'One playthrough, about 200 hours, no difficulty settings and no online trophies — the platinum is a marathon of coverage, not a test of skill. The order below front-loads the story, protects the one missable, and turns the endgame into a checklist rather than a scavenger hunt. Estimated times follow the published roadmaps cited in each guide.',
    ),
  );
  const warn = el('p', 'warn');
  const strong = el('strong', null, 'Protect the run: ');
  warn.append(
    strong,
    'missions cannot be replayed, so keep manual saves at every chapter break — and never use a cheat code, because cheats disable trophies and saving. One trophy is flagged missable: Positive Mental Attitude, whose first meditation spot, at Jason’s house, is only offered during Chapter 1.',
  );
  intro.append(warn);
  view.append(intro);

  for (const stage of STAGES) {
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-no', `STAGE ${stage.n}`), el('h3', null, stage.title), el('span', 'stage-time', stage.time));
    section.append(head, el('p', 'stage-blurb', stage.blurb));

    const list = el('ul', 'stage-list');
    const inStage = trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.order - b.order);
    for (const trophy of inStage) {
      const earned = store.earned.has(trophy.name);
      const masked = isMasked(trophy, store.settings, store.earned);
      const item = el('button', `stage-item${earned ? ' is-earned' : ''}`);
      item.type = 'button';
      const name = el('span', 'card-name');
      const order = el('span', 'order-no', `#${trophy.order}`);
      name.append(order, displayName(trophy, masked));
      item.append(name);
      if (trophy.missable) {
        const flag = el('span', 'pill missable', 'MISSABLE');
        item.append(flag);
      }
      const right = el('span', earned ? 'done-mark' : `card-grade grade-text-${trophy.grade}`, earned ? 'Earned ✓' : trophy.grade);
      item.append(right);
      item.addEventListener('click', () => onSelect(trophy));
      const li = el('li');
      li.append(item);
      list.append(li);
    }
    section.append(list);
    view.append(section);
  }
}
