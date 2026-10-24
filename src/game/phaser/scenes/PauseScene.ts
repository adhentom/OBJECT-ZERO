import * as Phaser from "phaser";
import { CSS } from "../../content/palette";
import { SCENE } from "../keys";
import { drawPanel, text } from "../ui";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENE.pause);
  }

  create() {
    const { width, height } = this.scale;
    this.input.setDefaultCursor("default");
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.6).fillRect(0, 0, width, height);
    drawPanel(g, width / 2 - 220, height / 2 - 110, 440, 220);
    text(this, width / 2, height / 2 - 50, "PAUSED", 44, CSS.cyan, { bold: true, spacing: 10, origin: [0.5, 0.5] });
    text(this, width / 2, height / 2 + 20, "ESC / P / ENTER  RESUME", 16, CSS.text, { spacing: 3, origin: [0.5, 0.5] });
    text(this, width / 2, height / 2 + 54, "Q  QUIT TO MENU", 16, CSS.dim, { spacing: 3, origin: [0.5, 0.5] });

    const keyboard = this.input.keyboard!;
    const resume = () => {
      this.scene.resume(SCENE.arena);
      this.scene.stop();
    };
    keyboard.on("keydown-ESC", resume);
    keyboard.on("keydown-P", resume);
    keyboard.on("keydown-ENTER", resume);
    keyboard.on("keydown-Q", () => {
      this.scene.stop(SCENE.hud);
      this.scene.stop(SCENE.arena);
      this.scene.start(SCENE.menu);
    });
  }
}
