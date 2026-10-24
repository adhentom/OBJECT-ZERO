import * as Phaser from "phaser";
import { COLOR } from "../../content/palette";
import { TEX } from "../keys";

// All art is generated from vector shapes at boot: no asset files to load or license.
export function generateTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const bake = (key: string, width: number, height: number) => {
    g.generateTexture(key, width, height);
    g.clear();
  };

  // Soft radial glow, tinted at use.
  for (let r = 32; r > 0; r -= 2) {
    g.fillStyle(COLOR.white, 0.05 + (1 - r / 32) * 0.12);
    g.fillCircle(32, 32, r);
  }
  bake(TEX.glow, 64, 64);

  // Player: chevron hull pointing right (rotation 0).
  g.fillStyle(COLOR.player, 0.1).fillCircle(24, 24, 22);
  g.fillStyle(0x0a1b24, 1).fillPoints(
    [
      { x: 42, y: 24 },
      { x: 12, y: 8 },
      { x: 18, y: 24 },
      { x: 12, y: 40 },
    ],
    true,
  );
  g.lineStyle(2.5, COLOR.player, 1).strokePoints(
    [
      { x: 42, y: 24 },
      { x: 12, y: 8 },
      { x: 18, y: 24 },
      { x: 12, y: 40 },
    ],
    true,
  );
  g.lineStyle(2, COLOR.player, 0.6).lineBetween(8, 16, 14, 20).lineBetween(8, 32, 14, 28);
  g.fillStyle(COLOR.playerCore, 1).fillCircle(24, 24, 3.5);
  bake(TEX.player, 48, 48);

  // Drone: diamond core inside a rotor ring.
  g.lineStyle(2, COLOR.drone, 0.45).strokeCircle(16, 16, 13);
  g.fillStyle(0x24060f, 1).fillPoints(
    [
      { x: 16, y: 4 },
      { x: 27, y: 16 },
      { x: 16, y: 28 },
      { x: 5, y: 16 },
    ],
    true,
  );
  g.lineStyle(2, COLOR.drone, 1).strokePoints(
    [
      { x: 16, y: 4 },
      { x: 27, y: 16 },
      { x: 16, y: 28 },
      { x: 5, y: 16 },
    ],
    true,
  );
  g.fillStyle(COLOR.drone, 1).fillCircle(16, 16, 3);
  bake(TEX.drone, 32, 32);

  // Gunner: armoured hexagon with a barrel pointing right.
  const hex = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    return { x: 22 + Math.cos(angle) * 16, y: 22 + Math.sin(angle) * 16 };
  });
  g.fillStyle(COLOR.gunner, 0.08).fillCircle(22, 22, 21);
  g.fillStyle(0x221004, 1).fillPoints(hex, true);
  g.lineStyle(2.5, COLOR.gunner, 1).strokePoints(hex, true);
  g.fillStyle(COLOR.gunner, 1).fillRect(26, 19, 17, 6);
  g.lineStyle(1.5, COLOR.gunner, 0.7).strokeRect(16, 16, 12, 12);
  g.fillStyle(0xfff1dc, 1).fillCircle(22, 22, 2.5);
  bake(TEX.gunner, 44, 44);

  // Player bullet: bright streak.
  g.fillStyle(COLOR.player, 0.45).fillRoundedRect(0, 0, 24, 10, 5);
  g.fillStyle(COLOR.bullet, 1).fillRoundedRect(3, 2.5, 19, 5, 2.5);
  g.fillStyle(COLOR.white, 1).fillRoundedRect(10, 3.5, 11, 3, 1.5);
  bake(TEX.bullet, 24, 10);

  // Enemy bolt: hot orb.
  g.fillStyle(COLOR.bolt, 0.25).fillCircle(10, 10, 10);
  g.fillStyle(COLOR.bolt, 0.8).fillCircle(10, 10, 6);
  g.fillStyle(0xfff4e0, 1).fillCircle(10, 10, 3);
  bake(TEX.bolt, 20, 20);

  g.fillStyle(COLOR.white, 1).fillRect(0, 0, 4, 4);
  bake(TEX.spark, 4, 4);

  g.lineStyle(3, COLOR.white, 1).strokeCircle(64, 64, 60);
  bake(TEX.ring, 128, 128);

  // Reticle.
  g.lineStyle(2, COLOR.white, 0.9).strokeCircle(16, 16, 9);
  g.lineBetween(16, 0, 16, 6).lineBetween(16, 26, 16, 32).lineBetween(0, 16, 6, 16).lineBetween(26, 16, 32, 16);
  g.fillStyle(COLOR.white, 1).fillCircle(16, 16, 1.5);
  bake(TEX.reticle, 32, 32);

  // Floor panel tile: plate, seams, rivets, a little wear.
  g.fillStyle(COLOR.floorPanel, 1).fillRect(0, 0, 64, 64);
  g.fillStyle(COLOR.floor, 1).fillRect(2, 2, 60, 60);
  g.lineStyle(1, COLOR.seam, 1).strokeRect(0.5, 0.5, 63, 63);
  g.lineStyle(1, 0x111622, 1).lineBetween(2, 32, 62, 32);
  g.fillStyle(COLOR.rivet, 1);
  [6, 58].forEach((x) => [6, 58].forEach((y) => g.fillCircle(x, y, 1.5)));
  g.fillStyle(0x0c1019, 1).fillRect(40, 38, 14, 4);
  bake(TEX.floor, 64, 64);

  // Hazard stripe tile.
  g.fillStyle(COLOR.hazardDark, 1).fillRect(0, 0, 24, 12);
  g.fillStyle(COLOR.hazard, 0.75);
  g.fillPoints(
    [
      { x: 0, y: 12 },
      { x: 6, y: 0 },
      { x: 12, y: 0 },
      { x: 6, y: 12 },
    ],
    true,
  );
  g.fillPoints(
    [
      { x: 12, y: 12 },
      { x: 18, y: 0 },
      { x: 24, y: 0 },
      { x: 18, y: 12 },
    ],
    true,
  );
  bake(TEX.hazard, 24, 12);

  // Scanline overlay tile for menus.
  g.fillStyle(0x000000, 0.35).fillRect(0, 0, 4, 1);
  bake(TEX.scanlines, 4, 3);

  g.destroy();
}
