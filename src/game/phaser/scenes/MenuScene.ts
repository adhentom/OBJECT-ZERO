import * as Phaser from "phaser";
import type { GameBus } from "../../bridge/events";
import { PLAYER } from "../../content/balance";
import { COLOR, CSS } from "../../content/palette";
import { loadBestScore } from "../../storage";
import { REGISTRY, SCENE, TEX } from "../keys";
import { addBackdrop, drawPanel, text } from "../ui";

const ITEMS = ["START", "CONTROLS"] as const;

const CONTROLS: [string, string][] = [
  ["MOVE", "W A S D  /  ARROWS"],
  ["AIM + FIRE", "MOUSE  (HOLD LEFT BUTTON)"],
  ["KEYBOARD FIRE", "I J K L  (AIMS AND FIRES)"],
  ["DASH", "SPACE  /  SHIFT"],
  ["PAUSE", "ESC  /  P"],
];

export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private itemLabels: Phaser.GameObjects.Text[] = [];
  private controlsPanel!: Phaser.GameObjects.Container;
  private floor!: Phaser.GameObjects.TileSprite;
  private drones: { image: Phaser.GameObjects.Image; angle: number; radius: number; speed: number }[] = [];

  constructor() {
    super(SCENE.menu);
  }

  create() {
    const { width, height } = this.scale;
    this.selected = 0;
    this.input.setDefaultCursor("default");
    (this.registry.get(REGISTRY.bus) as GameBus | undefined)?.emit("status", { phase: "menu", wave: 0, score: 0, hp: PLAYER.maxHp, maxHp: PLAYER.maxHp });

    this.floor = addBackdrop(this, TEX.floor, TEX.scanlines);
    this.spawnBackgroundDrones(width, height);

    // Title with chromatic offset copies and an occasional glitch jitter.
    const titleY = height * 0.3;
    const ghostA = text(this, width / 2 - 3, titleY, "OBJECT ZERO", 92, CSS.cyan, { bold: true, spacing: 10, origin: [0.5, 0.5] }).setAlpha(0.55);
    const ghostB = text(this, width / 2 + 3, titleY, "OBJECT ZERO", 92, CSS.magenta, { bold: true, spacing: 10, origin: [0.5, 0.5] }).setAlpha(0.55);
    ghostA.setBlendMode(Phaser.BlendModes.ADD);
    ghostB.setBlendMode(Phaser.BlendModes.ADD);
    text(this, width / 2, titleY, "OBJECT ZERO", 92, "#f2fdff", { bold: true, spacing: 10, origin: [0.5, 0.5] });
    this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        const dx = Phaser.Math.Between(4, 10);
        this.tweens.add({ targets: ghostA, x: width / 2 - dx, duration: 60, yoyo: true, repeat: 2 });
        this.tweens.add({ targets: ghostB, x: width / 2 + dx, duration: 60, yoyo: true, repeat: 2 });
      },
    });

    text(this, width / 2, titleY + 76, "REALITY IS YOUR ARSENAL.", 22, CSS.amber, { spacing: 8, origin: [0.5, 0.5] });
    const rule = this.add.graphics();
    rule.lineStyle(1, COLOR.trim, 0.5).lineBetween(width / 2 - 260, titleY + 106, width / 2 + 260, titleY + 106);

    this.itemLabels = ITEMS.map((item, index) => {
      const label = text(this, width / 2, height * 0.6 + index * 52, item, 30, CSS.text, { bold: true, spacing: 6, origin: [0.5, 0.5] });
      label.setInteractive({ useHandCursor: true });
      label.on("pointerover", () => this.select(index));
      label.on("pointerdown", () => this.activate(index));
      return label;
    });
    this.select(0);

    const best = loadBestScore();
    text(this, width / 2, height - 70, best > 0 ? `BEST SCORE  ${best.toLocaleString("en-US")}` : "NO RECORD YET", 16, CSS.dim, { spacing: 4, origin: [0.5, 0.5] });
    text(this, width / 2, height - 40, "↑ ↓ SELECT    ENTER CONFIRM    KEYBOARD + MOUSE", 13, CSS.dim, { spacing: 3, origin: [0.5, 0.5] });

    this.controlsPanel = this.buildControlsPanel(width, height);

    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-UP", () => this.move(-1));
    keyboard.on("keydown-W", () => this.move(-1));
    keyboard.on("keydown-DOWN", () => this.move(1));
    keyboard.on("keydown-S", () => this.move(1));
    keyboard.on("keydown-ENTER", () => this.activate(this.selected));
    keyboard.on("keydown-SPACE", () => this.activate(this.selected));
    keyboard.on("keydown-ESC", () => this.controlsPanel.setVisible(false));
  }

  update(_time: number, delta: number) {
    this.floor.tilePositionY -= delta * 0.02;
    for (const drone of this.drones) {
      drone.angle += drone.speed * delta * 0.001;
      drone.image.setPosition(this.scale.width / 2 + Math.cos(drone.angle) * drone.radius, this.scale.height * 0.55 + Math.sin(drone.angle) * drone.radius * 0.45);
      drone.image.rotation += delta * 0.004;
    }
  }

  private spawnBackgroundDrones(width: number, height: number) {
    this.drones = Array.from({ length: 7 }, (_, i) => {
      const image = this.add
        .image(width / 2, height / 2, i % 3 === 0 ? TEX.gunner : TEX.drone)
        .setAlpha(0.18)
        .setScale(1.2);
      return { image, angle: (Math.PI * 2 * i) / 7, radius: 360 + (i % 3) * 70, speed: 0.12 + (i % 2) * 0.06 };
    });
  }

  private buildControlsPanel(width: number, height: number): Phaser.GameObjects.Container {
    const panelWidth = 620;
    const panelHeight = 330;
    const x = (width - panelWidth) / 2;
    const y = (height - panelHeight) / 2;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.6).fillRect(0, 0, width, height);
    drawPanel(g, x, y, panelWidth, panelHeight);
    const items: Phaser.GameObjects.GameObject[] = [g, text(this, width / 2, y + 36, "CONTROLS", 26, CSS.cyan, { bold: true, spacing: 6, origin: [0.5, 0.5] })];
    CONTROLS.forEach(([action, keys], index) => {
      const rowY = y + 90 + index * 40;
      items.push(text(this, x + 48, rowY, action, 17, CSS.amber, { bold: true, spacing: 2, origin: [0, 0.5] }));
      items.push(text(this, x + panelWidth - 48, rowY, keys, 17, CSS.text, { spacing: 2, origin: [1, 0.5] }));
    });
    items.push(text(this, width / 2, y + panelHeight - 28, "ESC / ENTER TO CLOSE", 13, CSS.dim, { spacing: 3, origin: [0.5, 0.5] }));
    return this.add.container(0, 0, items).setDepth(50).setVisible(false);
  }

  private move(step: number) {
    if (this.controlsPanel.visible) return;
    this.select((this.selected + step + ITEMS.length) % ITEMS.length);
  }

  private select(index: number) {
    this.selected = index;
    this.itemLabels.forEach((label, i) => {
      label.setText(i === index ? `▸ ${ITEMS[i]} ◂` : ITEMS[i]);
      label.setColor(i === index ? CSS.cyan : CSS.dim);
    });
  }

  private activate(index: number) {
    if (this.controlsPanel.visible) {
      this.controlsPanel.setVisible(false);
      return;
    }
    if (ITEMS[index] === "START") {
      this.cameras.main.fadeOut(220, 2, 3, 5);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(SCENE.arena));
    } else {
      this.controlsPanel.setVisible(true);
    }
  }
}
