# MALABAR — Hot Coast

[Play the live game](https://malabar-hot-coast.vercel.app/)

MALABAR is a browser-based 3D arcade racing prototype set on a stylized, fictionalized Kerala coast. The live game offers racing, free exploration, car customization, story events, and arcade driving abilities.

> **Source version note:** The live page currently identifies itself as **MALABAR V17**. This repository contains two separate source snapshots: a standalone **V10** game and a **V11.1 multiplayer alpha**. They are preserved in their own directories; this repository does not claim either snapshot is the exact source of the current V17 deployment.

## What you can do

- Race in **Coast Sprint**, **Hot Pursuit**, and **Time Attack**, or drive freely in **Explore**.
- Pick a car, visit the garage and shop, and build or tune cars in the workshop.
- Play story chapters, collect fictional coins, unlock cars, and buy upgrades.
- Use boost, ultra burst, fictional flight, and arcade kickflips.
- View the on-device leaderboard and coin balance. These are local game features; coins have no real-money value.
- Play with keyboard or touch controls. Landscape orientation gives mobile players a wider view.

The help panel describes the route as Kappil-derived and remixed with fictional Kerala districts; it is not an exact geographic reconstruction.

## Controls

| Input | Action |
| --- | --- |
| **W A S D** or **arrow keys** | Accelerate, brake/reverse, and steer |
| **Space** | Brake |
| **Shift** | Hold regular boost |
| **B** | Trigger ultra burst |
| **F**, **Q**, **E** | Toggle fictional flight and adjust lift |
| **X** | Arcade kickflip when airborne and charged |
| **C** / mouse | Change camera / orbit the view |
| **L** | Look at the selected Explore landmark |
| **R** | Recover to the road; races add a time penalty |
| **Escape** | Pause or resume |

On touch screens, use the on-screen GO, steering, BRAKE, and REV controls.

## Run the standalone source snapshot

The standalone source is in [`Car-game-main/`](Car-game-main/). It requires Node.js 20 or later, npm, Python 3 for the local server, and a browser with WebGL 2. Blender is only needed for editing or regenerating the authoring assets.

```sh
cd Car-game-main/web
npm ci
npm run serve
```

Open [http://localhost:8080](http://localhost:8080). To build a self-contained HTML version, run `npm run build` from `Car-game-main/web`; the output is written under `dist/`. These instructions run the included V10 snapshot, not the live V17 deployment. See [`Car-game-main/README.md`](Car-game-main/README.md) for tests, authoring, and limitations.

## Run the multiplayer alpha

The separate Node.js and WebSocket multiplayer source is in [`Car-game-multiplayer-public-alpha/`](Car-game-multiplayer-public-alpha/). To start its local service:

```sh
cd Car-game-multiplayer-public-alpha
npm ci --ignore-scripts
npm run build
PORT=8787 npm start
```

Then open [http://127.0.0.1:8787](http://127.0.0.1:8787). This is an experimental two-driver alpha, not the live V17 game. Its README and `docs/acceptance.md` describe its protocol, setup, and outstanding acceptance limits.

## Repository layout

- [`Car-game-main/`](Car-game-main/) — standalone V10 browser game, editable Blender assets, tests, and authoring tools.
- [`Car-game-multiplayer-public-alpha/`](Car-game-multiplayer-public-alpha/) — V11.1 multiplayer client/server source, runtime assets, tests, and acceptance records.

Each project keeps its own README, dependency files, manifests, and license notices. Read those files before building or redistributing a project.
