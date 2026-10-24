// `import * as` is required: the default export breaks the Next.js production build.
import * as Phaser from "phaser";
import type { GameBus } from "../bridge/events";
import { ARENA } from "../content/balance";
import { REGISTRY } from "./keys";
import { ArenaScene } from "./scenes/ArenaScene";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { MenuScene } from "./scenes/MenuScene";
import { PauseScene } from "./scenes/PauseScene";

export function createGame(parent: HTMLElement, bus: GameBus): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: ARENA.width,
    height: ARENA.height,
    backgroundColor: "#020305",
    disableContextMenu: true,
    physics: { default: "arcade", arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    // Order sets draw order for scenes running together: HUD above arena, pause above both.
    scene: [BootScene, MenuScene, ArenaScene, HudScene, PauseScene, GameOverScene],
    callbacks: {
      preBoot: (game) => game.registry.set(REGISTRY.bus, bus),
    },
  });
}
