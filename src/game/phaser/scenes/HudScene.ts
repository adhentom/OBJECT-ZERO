import * as Phaser from "phaser";
import { COLOR, CSS } from "../../content/palette";
import { SCENE } from "../keys";
import { drawPanel, text } from "../ui";
import type { ArenaScene } from "./ArenaScene";

const TOP = 12;
const PANEL_H = 56;
const HP_SEGMENTS = 10;

/** In-canvas HUD drawn above the arena. Reads a snapshot from the arena every frame. */
export class HudScene extends Phaser.Scene {
  private bars!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private dashText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private hostilesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Container;
  private bannerTitle!: Phaser.GameObjects.Text;
  private bannerSubtitle!: Phaser.GameObjects.Text;
  private bannerBand!: Phaser.GameObjects.Graphics;
  private bannerTween: Phaser.Tweens.TweenChain | null = null;
  private displayedScore = 0;

  constructor() {
    super(SCENE.hud);
  }

  create() {
    const { width, height } = this.scale;
    this.displayedScore = 0;
    const frame = this.add.graphics();

    drawPanel(frame, 36, TOP, 300, PANEL_H);
    text(this, 52, TOP + 9, "HULL", 11, CSS.dim, { bold: true, spacing: 3 });
    this.hpText = text(this, 322, TOP + 32, "", 20, CSS.text, { bold: true, origin: [1, 0.5] });

    drawPanel(frame, 348, TOP, 140, PANEL_H, COLOR.player);
    text(this, 364, TOP + 9, "DASH", 11, CSS.dim, { bold: true, spacing: 3 });
    this.dashText = text(this, 472, TOP + 9, "", 11, CSS.cyan, { bold: true, spacing: 2, origin: [1, 0] });

    const centerX = width / 2;
    drawPanel(frame, centerX - 120, TOP, 240, PANEL_H, COLOR.hazard);
    text(this, centerX - 62, TOP + 9, "WAVE", 11, CSS.dim, { bold: true, spacing: 3, origin: [0.5, 0] });
    this.waveText = text(this, centerX - 62, TOP + 37, "", 26, CSS.amber, { bold: true, origin: [0.5, 0.5] });
    text(this, centerX + 56, TOP + 9, "HOSTILES", 11, CSS.dim, { bold: true, spacing: 3, origin: [0.5, 0] });
    this.hostilesText = text(this, centerX + 56, TOP + 37, "", 26, CSS.text, { bold: true, origin: [0.5, 0.5] });

    const right = width - 36;
    drawPanel(frame, right - 300, TOP, 300, PANEL_H, COLOR.drone);
    text(this, right - 284, TOP + 9, "SCORE", 11, CSS.dim, { bold: true, spacing: 3 });
    this.scoreText = text(this, right - 16, TOP + 30, "0", 28, CSS.text, { bold: true, origin: [1, 0.5] });
    this.comboText = text(this, right - 284, TOP + 28, "", 18, CSS.magenta, { bold: true });

    this.bars = this.add.graphics();
    this.buildBanner(width, height);
  }

  update() {
    const arena = this.scene.get(SCENE.arena) as ArenaScene;
    if (!arena.sys.isActive() && !arena.sys.isPaused()) return;
    const snap = arena.hudSnapshot();
    const g = this.bars.clear();
    const now = this.time.now;

    // Hull: segmented bar that turns red and pulses when low.
    const ratio = snap.hp / snap.maxHp;
    const low = ratio <= 0.3;
    const hullColor = low ? COLOR.warning : COLOR.player;
    const segW = 20;
    const filled = ratio * HP_SEGMENTS;
    for (let i = 0; i < HP_SEGMENTS; i++) {
      const x = 52 + i * (segW + 2);
      g.fillStyle(0x16202c, 1).fillRect(x, TOP + 30, segW, 14);
      const amount = Phaser.Math.Clamp(filled - i, 0, 1);
      if (amount > 0) g.fillStyle(hullColor, low ? 0.6 + 0.4 * Math.abs(Math.sin(now / 140)) : 0.95).fillRect(x, TOP + 30, segW * amount, 14);
    }
    this.hpText.setText(String(Math.ceil(snap.hp))).setColor(low ? CSS.red : CSS.text);

    // Dash meter.
    g.fillStyle(0x16202c, 1).fillRect(364, TOP + 34, 108, 8);
    g.fillStyle(COLOR.player, snap.dashReadiness >= 1 ? 1 : 0.45).fillRect(364, TOP + 34, 108 * snap.dashReadiness, 8);
    this.dashText.setText(snap.dashReadiness >= 1 ? "READY" : "").setColor(CSS.cyan);

    this.waveText.setText(String(snap.wave).padStart(2, "0"));
    this.hostilesText.setText(snap.phase === "combat" || snap.phase === "intro" ? String(snap.hostiles) : "—");

    // Score rolls up toward the real value.
    this.displayedScore += Math.ceil((snap.score - this.displayedScore) * 0.25);
    if (snap.score < this.displayedScore) this.displayedScore = snap.score;
    this.scoreText.setText(this.displayedScore.toLocaleString("en-US"));

    const right = this.scale.width - 36;
    if (snap.multiplier > 1) {
      this.comboText.setText(`x${snap.multiplier.toFixed(1)}`);
      g.fillStyle(COLOR.drone, 0.9).fillRect(right - 284, TOP + 48, 80 * snap.comboRemaining, 3);
    } else {
      this.comboText.setText("");
    }
  }

  showBanner(title: string, subtitle: string, color: string) {
    this.bannerTween?.stop();
    this.bannerTitle.setText(title).setColor(color);
    this.bannerSubtitle.setText(subtitle);
    this.banner.setAlpha(0).setScale(1, 0.6);
    this.bannerTween = this.tweens.chain({
      targets: this.banner,
      tweens: [
        { alpha: 1, scaleY: 1, duration: 220, ease: "Back.easeOut" },
        { alpha: 1, duration: 1050 },
        { alpha: 0, duration: 320 },
      ],
    });
  }

  private buildBanner(width: number, height: number) {
    const y = height * 0.4;
    this.bannerBand = this.add.graphics();
    this.bannerBand.fillStyle(0x000000, 0.55).fillRect(-width / 2, -62, width, 124);
    this.bannerBand.lineStyle(1, COLOR.trim, 0.5).lineBetween(-width / 2, -62, width / 2, -62).lineBetween(-width / 2, 62, width / 2, 62);
    this.bannerTitle = text(this, 0, -14, "", 60, CSS.cyan, { bold: true, spacing: 14, origin: [0.5, 0.5] });
    this.bannerSubtitle = text(this, 0, 36, "", 17, CSS.text, { spacing: 4, origin: [0.5, 0.5] });
    this.banner = this.add.container(width / 2, y, [this.bannerBand, this.bannerTitle, this.bannerSubtitle]).setAlpha(0);
  }
}
