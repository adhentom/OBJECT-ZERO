import * as Phaser from "phaser";
import { COLOR, FONT } from "../content/palette";

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color: string,
  options: { bold?: boolean; spacing?: number; origin?: [number, number] } = {},
): Phaser.GameObjects.Text {
  const label = scene.add.text(x, y, value, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    fontStyle: options.bold ? "bold" : "normal",
  });
  label.setLetterSpacing(options.spacing ?? 0);
  const [ox, oy] = options.origin ?? [0, 0];
  return label.setOrigin(ox, oy);
}

/** Dark panel with chamfered corners and a neon outline. */
export function drawPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number = COLOR.trim,
  cut = 10,
): void {
  const points = [
    { x: x + cut, y },
    { x: x + width, y },
    { x: x + width, y: y + height - cut },
    { x: x + width - cut, y: y + height },
    { x, y: y + height },
    { x, y: y + cut },
  ];
  g.fillStyle(0x060910, 0.88).fillPoints(points, true);
  g.lineStyle(1.5, accent, 0.55).strokePoints(points, true);
  g.lineStyle(3, accent, 0.9).lineBetween(x + cut, y, x + cut + 28, y);
}

/** Animated floor backdrop with scanlines, shared by menu and game-over screens. */
export function addBackdrop(scene: Phaser.Scene, floorKey: string, scanKey: string): Phaser.GameObjects.TileSprite {
  const { width, height } = scene.scale;
  const floor = scene.add.tileSprite(0, 0, width, height, floorKey).setOrigin(0).setAlpha(0.55);
  scene.add.rectangle(0, 0, width, height, COLOR.void, 0.55).setOrigin(0);
  scene.add.tileSprite(0, 0, width, height, scanKey).setOrigin(0).setDepth(100);
  return floor;
}
