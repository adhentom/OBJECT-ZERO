import * as Phaser from "phaser";
import { CSS } from "../../content/palette";
import { SCENE, TEX } from "../keys";
import { addBackdrop, drawPanel, text } from "../ui";

export type RunResult = {
  score: number;
  wave: number;
  kills: number;
  bestMultiplier: number;
  survivedMs: number;
  best: number;
  newBest: boolean;
};

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export class GameOverScene extends Phaser.Scene {
  private ready = false;

  constructor() {
    super(SCENE.gameOver);
  }

  create(result: RunResult) {
    const { width } = this.scale;
    this.ready = false;
    this.input.setDefaultCursor("default");
    addBackdrop(this, TEX.floor, TEX.scanlines);
    this.cameras.main.fadeIn(300, 2, 3, 5);

    const title = text(this, width / 2, 130, "SIGNAL LOST", 76, CSS.red, { bold: true, spacing: 12, origin: [0.5, 0.5] });
    this.tweens.add({ targets: title, alpha: 0.75, duration: 90, yoyo: true, repeat: -1, repeatDelay: 1800 });
    text(this, width / 2, 190, "YOUR UNIT WAS DESTROYED", 16, CSS.dim, { spacing: 6, origin: [0.5, 0.5] });

    const panelWidth = 520;
    const x = (width - panelWidth) / 2;
    const g = this.add.graphics();
    drawPanel(g, x, 236, panelWidth, 268);
    const rows: [string, string][] = [
      ["SCORE", result.score.toLocaleString("en-US")],
      ["WAVE REACHED", String(result.wave)],
      ["HOSTILES DESTROYED", String(result.kills)],
      ["BEST COMBO", `x${result.bestMultiplier.toFixed(1)}`],
      ["TIME SURVIVED", formatTime(result.survivedMs)],
      ["BEST SCORE", result.best.toLocaleString("en-US")],
    ];
    rows.forEach(([label, value], index) => {
      const y = 272 + index * 38;
      text(this, x + 36, y, label, 17, CSS.dim, { spacing: 3, origin: [0, 0.5] });
      text(this, x + panelWidth - 36, y, value, index === 0 ? 24 : 18, index === 0 ? CSS.cyan : CSS.text, { bold: true, origin: [1, 0.5] });
    });
    if (result.newBest) {
      const badge = text(this, width / 2, 528, "★ NEW BEST SCORE ★", 20, CSS.amber, { bold: true, spacing: 6, origin: [0.5, 0.5] });
      this.tweens.add({ targets: badge, scale: 1.08, duration: 420, yoyo: true, repeat: -1 });
    }

    const redeploy = text(this, width / 2 - 150, 600, "[ENTER] REDEPLOY", 22, CSS.cyan, { bold: true, spacing: 4, origin: [0.5, 0.5] });
    const menu = text(this, width / 2 + 160, 600, "[ESC] MAIN MENU", 22, CSS.text, { bold: true, spacing: 4, origin: [0.5, 0.5] });
    redeploy.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.go(SCENE.arena));
    menu.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.go(SCENE.menu));

    // Brief lockout so a held fire/dash key from the last moment of play doesn't skip this screen.
    this.time.delayedCall(700, () => (this.ready = true));
    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-ENTER", () => this.go(SCENE.arena));
    keyboard.on("keydown-ESC", () => this.go(SCENE.menu));
  }

  private go(scene: string) {
    if (!this.ready) return;
    this.ready = false;
    this.scene.start(scene);
  }
}
