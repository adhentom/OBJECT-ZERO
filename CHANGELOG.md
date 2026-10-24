# Change log

## 2026-10-24T23:00:40+05:30 — Milestone 1: playable keyboard and mouse arena

- Changed:
  - added the Phaser game in `src/game/phaser/`: Boot, Menu, Arena, Hud, Pause and GameOver scenes; Player and Enemy entities; Weapons and SpawnDirector systems; procedural textures and effects; keyboard/mouse input adapter;
  - added a typed status bus (`src/game/bridge/events.ts`) and best-score storage (`src/game/storage.ts`);
  - updated `src/ui/GameShell.tsx` for an accessible status line;
  - added `heal` to `core/health.ts`;
  - added a favicon (`src/app/icon.svg`);
  - removed the bootstrap placeholder scene;
  - updated README controls, architecture and status.
- Why: deliver a complete keyboard/mouse game loop (menu, waves with two enemy types, HUD, pause, Game Over, restart) before any ability, webcam or AI work.
- Validation:
  - `npm test` passed (8 files, 31 tests);
  - `npm run typecheck`, `npm run lint` and `npm run build` passed;
  - Playwright scripts drove Chrome against `npm start` and confirmed:
    - menu → Enter → wave 1 banner;
    - IJKL keyboard fire, dash, and Esc pause/resume;
    - mouse fire, wave 1 clear → wave 2;
    - death → Game Over with stats and new best score → Enter restart at wave 1 with full hull;
    - exactly one canvas and no console errors.
  - The first run found a crash: the wave banner was called before the HUD scene existed. It was fixed and re-checked. A HUD panel overlap seen in screenshots was also fixed.
- Limitations:
  - balance has had only short scripted sessions, not real human play;
  - performance was checked only on the VM's software rendering;
  - no audio.

## 2026-10-24T22:52:54+05:30 — Milestone 1: pure game rules and content

- Changed: added Phaser-free game rules in `src/game/core/` (`math`, `rng`, `health`, `cooldown`, `scoring`, `runFlow`, `waves`, `steering`, `movement`), gameplay data in `src/game/content/` (`balance`, `enemies`, `palette`), and keyboard action mapping in `src/game/input/actions.ts`, each with Vitest tests.
- Why: keep outcomes (damage, invulnerability, combos, wave plans, enemy steering, movement) testable and independent of rendering, so Phaser scenes only render and route input.
- Validation: `npm test` passed (8 files, 30 tests); `npm run typecheck` passed; `npm run lint` passed.
- Limitations: not yet wired into Phaser scenes; balance numbers are untested in play.

## 2026-10-24T22:55:00+05:30 — Bootstrap OBJECT ZERO repository

- Changed: added the event documentation (`AGENTS.md`, `RULES.md`, `README.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, `.github/pull_request_template.md`) copied from the team's `adhentom/junk-arena` template, including the pending Devin Hack Kochi correction (junk-arena PR #2). Added a Next.js 16 + React 19 + TypeScript + Phaser 3.90 scaffold (`package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `src/app/*`, `src/ui/GameShell.tsx`, `src/game/phaser/*`) with a placeholder title scene.
- Why: start the OBJECT ZERO rebuild from a clean repository. The earlier junk-arena prototype is not copied; its toolchain choices and patterns (client-only Phaser import, StrictMode-safe teardown) were re-implemented here.
- Validation: `npm install` succeeded on Node 24.22.1 / npm 11.19.1; `npm run typecheck` passed; `npm run lint` passed; `npm run build` passed. `npm test` reports no test files yet (tests arrive with milestone 1 game rules).
- Limitations: no gameplay yet. The title screen was not checked in a browser in this commit.

## 2026-10-24T21:53:05+05:30 — Correct Devin Hack Kochi event guidance

- Changed: corrected the current event name and AI tool guidance in `.github/pull_request_template.md`, `AGENTS.md`, `AI_USAGE.md`, `CHANGELOG.md`, `README.md`, `RULES.md`, `SUBMISSION.md`.
- Why: the organizer shared an older event template; Devin Hack Kochi has no
  major AI usage constraints and the template must not require a particular AI provider.
- Scope: preserved project implementation and historical assistance records.
- Removed obsolete template logistics, participation limits, and credit promises; current organizer instructions remain authoritative.
- Validation: reviewed documentation diffs, checked whitespace with `git diff --check`, and checked local Markdown links for new breakage.
- Limitations: maintainer review is pending; application tests were not run for this documentation-only correction.

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

No project implementation has been recorded yet. Replace this sentence with entries as you build:

```text
## <actual timestamp> — <short change title>

- Changed: <feature or files changed>
- Why: <reason for the change>
- Validation: <commands or manual checks actually run, with results>
- Limitations: <known issues or "None identified in these checks">
```

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
