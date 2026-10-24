// `import * as` is required: the default export breaks the Next.js production build.
import * as Phaser from "phaser";
import { TitleScene } from "./scenes/TitleScene";

export const VIEW = { width: 1280, height: 720 } as const;

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: VIEW.width,
    height: VIEW.height,
    backgroundColor: "#05060a",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [TitleScene],
  });
}
