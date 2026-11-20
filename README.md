# Leonida Legend — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Baroosb/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Baroosb/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies — 1 platinum, 2 gold, 6 silver and 46 bronze. Every trophy is listed with its official name, description and grade exactly as PlayStation publishes them, alongside a guide written for this entry in its own words: what to do, where and how, and when the trophy can be missed, with the sources for each guide cited beside it (PowerPyx, PSNProfiles, Exophase and others, named per trophy in `app/data/trophies.json`).

Each trophy also carries structured data — its kind (story, collectibles, activities, or the missable kind), a missable flag (exactly one trophy is missable: *Positive Mental Attitude*, the Chapter 1 meditation at Jason's house), and its stage and order in a 7-stage roadmap that walks the list in the order the trophies are best earned, from the opening chapters to the platinum.

As a tracker, the checklist saves your progress in the browser's localStorage as you tick trophies off, shows a progress ring and per-grade counts, and can export your earned set to a JSON file and import it back. Filters by kind and grade plus a text search (which also searches the guide text) make any trophy a glance away, and a spoiler mode masks the names and descriptions of unearned story trophies until you earn them.

The app is plain static files under `app/` — HTML, CSS and vanilla JavaScript, system fonts, no build step, no dependencies — and it makes no network requests at run time: it works fully offline from its own files.

## Run it

Serve the `app/` folder with any static file server (with `app/` at the server's root) and open `index.html` in a desktop browser:

```sh
npx serve app
# or
python3 -m http.server -d app
```

The hand-in program `main.ts` at the repository root copies `app/` and `screenshots/` to the output directory (`/output`, or `$MAKEFUN_OUTPUT_DIR` outside the grader) and writes `dossier.json` there with `buildDossier` from `vendor/makefun-frontend.ts`.

Built for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) · referral code 5hnf181h
