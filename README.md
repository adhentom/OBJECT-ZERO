# OBJECT ZERO — Devin Hack Kochi

OBJECT ZERO is an AI-powered arcade survival game built at Devin Hack Kochi. The event guidance and documentation scaffolding below come from the organizer template.

**[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

Devin Hack Kochi has no major AI usage constraints. Participants may use Devin and other AI tools, models, and providers; this template does not require Codex or restrict AI usage to OpenAI. AI usage notes are project documentation, not an additional event eligibility requirement.

The organizer shared an older event template. Follow the current organizer announcements for logistics, participation format, eligibility, submission timing, and credits; the older template's details do not apply. See [RULES.md](RULES.md).

## Use this template

1. Select **Use this template → Create a new repository** on GitHub. Create your own project repository and clone it.
2. Read [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) before building. Follow the organizers' current project-start instructions.
3. Fill in the project overview below as you build. Use any suitable language or framework, keeping the implementation simple.
4. Record meaningful changes in [CHANGELOG.md](CHANGELOG.md) and, if maintained, your actual AI assistance in [AI_USAGE.md](AI_USAGE.md). Commit after completed milestones; aim for a meaningful checkpoint about every 30 minutes.
5. Complete [SUBMISSION.md](SUBMISSION.md) with your code repository, short project description, and working demo. Follow submission instructions announced by the organizers.

This template has no application code or required technology stack. The documentation and commit cadence are repository workflow guidance; the event participation rules are in [RULES.md](RULES.md).

## Project overview

- **Project name:** OBJECT ZERO
- **Tagline:** Reality Is Your Arsenal.
- **Short description:** A top-down 2D sci-fi arena survival game. Players survive waves of hostile machines; in later milestones they scan everyday objects with a webcam and an AI picks a matching ability from a fixed, approved catalogue.
- **Team:** TODO — participant names and GitHub handles.
- **Working demo:** local only for now; see below.
- **Technology stack:** Next.js 16 (App Router), React 19, TypeScript 5, Phaser 3.90, Vitest 5, ESLint 9.

### Run the project

1. Prerequisites: Node.js 22.12+ or 24 (`.nvmrc` pins 24) and npm.
2. Install: `npm install`
3. Environment: no environment variables are needed yet.
4. Start (development): `npm run dev`, then open http://localhost:3000
5. Production build: `npm run build && npm start`
6. Checks: `npm run typecheck`, `npm run lint`, `npm test`

### Controls

| Action | Keys |
| --- | --- |
| Move | W A S D or arrow keys |
| Aim and fire | Mouse; hold the left button |
| Keyboard-only aim and fire | I J K L (aims in that direction and fires) |
| Dash (brief invulnerability) | Space or Shift |
| Pause | Esc or P (Q quits to menu while paused) |
| Menus | Up/Down, Enter, Esc, or the mouse |

### Architecture

- `src/app/` — Next.js page shell.
- `src/ui/GameShell.tsx` — mounts the Phaser canvas in the browser, shows load errors, and mirrors game status in a screen-reader line.
- `src/game/core/` — pure, unit-tested rules with no Phaser or DOM: health and invulnerability, cooldowns, combo scoring, run flow, wave plans, enemy steering, movement.
- `src/game/content/` — balance numbers, enemy definitions, palette.
- `src/game/input/` — key bindings mapped to movement and aim vectors.
- `src/game/bridge/` — low-frequency typed events from the game to React.
- `src/game/phaser/` — scenes (Boot, Menu, Arena, Hud, Pause, GameOver), entities (Player, Enemy), systems (Weapons, SpawnDirector), and procedural textures and effects.
- AI and webcam features (later milestones) will run outside the real-time game loop. The AI may only choose an id from a fixed ability catalogue; it never generates code or mechanics.

### Current status

- Working features (milestone 1):
  - main menu with a controls panel;
  - top-down arena with acceleration-based movement, a dash, and mouse or IJKL aimed fire;
  - two enemy types: Drones chase and detonate on contact; Gunners keep their distance and fire after showing a red aim line;
  - waves that get harder (wave 1 is drones only, Gunners join from wave 2), with spawn warnings and a hull repair after each cleared wave;
  - HUD with hull, dash meter, wave, hostiles left, score, and combo multiplier;
  - pause (it also auto-pauses when the window loses focus);
  - Game Over screen with run stats and a best score kept in `localStorage`; Enter restarts.
- Known limitations:
  - no abilities, preparation phase, or third enemy yet (milestone 2);
  - no audio;
  - balance has had only short automated play sessions;
  - no webcam, AI, or gesture input.
- Libraries used: [Next.js](https://nextjs.org) (MIT), [React](https://react.dev) (MIT), [Phaser](https://phaser.io) (MIT), [Vitest](https://vitest.dev) (MIT). All art is drawn in code; there are no external assets.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
