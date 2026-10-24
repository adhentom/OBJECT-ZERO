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
- **Working demo:** local only for now — see below.
- **Technology stack:** Next.js 16 (App Router), React 19, TypeScript 5, Phaser 3.90, Vitest 5, ESLint 9.

### Run the project

1. Prerequisites: Node.js 22.12+ or 24 (`.nvmrc` pins 24) and npm.
2. Install: `npm install`
3. Environment: no environment variables are needed yet.
4. Start (development): `npm run dev`, then open http://localhost:3000
5. Production build: `npm run build && npm start`
6. Checks: `npm run typecheck`, `npm run lint`, `npm test`

### Architecture

- `src/app/` — Next.js page shell.
- `src/ui/` — React components around the game canvas (load errors; later the webcam scan panel).
- `src/game/phaser/` — Phaser game, scenes and rendering. Phaser is imported only in the browser.
- Planned: `src/game/core/` (pure, unit-tested game rules), `src/game/content/` (balance and data), `src/game/input/` (keyboard/mouse actions; later gestures).
- AI and webcam features will run outside the real-time game loop. The AI may only choose an id from the fixed ability catalogue; it never generates code or mechanics.

### Current status

- Working features: bootstrap only — a title screen renders in a Phaser canvas.
- Known limitations: no gameplay yet (milestone 1), no webcam, AI or gesture input.
- Libraries used: [Next.js](https://nextjs.org) (MIT), [React](https://react.dev) (MIT), [Phaser](https://phaser.io) (MIT), [Vitest](https://vitest.dev) (MIT). No external art or audio assets.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
