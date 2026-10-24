import * as Phaser from "phaser";
import { BLASTER } from "../../content/balance";
import type { GunnerDef } from "../../content/enemies";
import type { Vec } from "../../core/math";
import { DEPTH, TEX } from "../keys";

type Shot = Phaser.Physics.Arcade.Sprite;

/** Player blaster bullets and enemy bolts, both pooled. */
export class Weapons {
  readonly bullets: Phaser.Physics.Arcade.Group;
  readonly bolts: Phaser.Physics.Arcade.Group;
  private nextShotAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: Phaser.Geom.Rectangle,
  ) {
    this.bullets = scene.physics.add.group({ defaultKey: TEX.bullet, maxSize: 160 });
    this.bolts = scene.physics.add.group({ defaultKey: TEX.bolt, maxSize: 80 });
  }

  /** Fires if the blaster is off cooldown. Returns true when a shot left the barrel. */
  tryFireBlaster(from: Vec, aim: Vec, now: number): boolean {
    if (now < this.nextShotAt) return false;
    const bullet = this.bullets.get(from.x, from.y) as Shot | null;
    if (!bullet) return false;
    this.nextShotAt = now + BLASTER.fireIntervalMs;
    const angle = Math.atan2(aim.y, aim.x) + (Math.random() - 0.5) * BLASTER.spreadRadians * 2;
    this.launch(bullet, from, angle, BLASTER.bulletSpeed, now + BLASTER.lifetimeMs, DEPTH.bullet, 5);
    bullet.setData("damage", BLASTER.damage);
    return true;
  }

  fireBolt(from: Vec, dir: Vec, def: GunnerDef, now: number): void {
    const bolt = this.bolts.get(from.x, from.y) as Shot | null;
    if (!bolt) return;
    this.launch(bolt, from, Math.atan2(dir.y, dir.x), def.boltSpeed, now + 6000, DEPTH.bolt, 7);
    bolt.setData("damage", def.boltDamage);
  }

  private launch(shot: Shot, from: Vec, angle: number, speed: number, expiresAt: number, depth: number, radius: number): void {
    shot.setActive(true).setVisible(true).setDepth(depth).setRotation(angle).setBlendMode(Phaser.BlendModes.ADD);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(from.x, from.y);
    body.setCircle(radius, shot.width / 2 - radius, shot.height / 2 - radius);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    shot.setData("expiresAt", expiresAt);
  }

  kill(shot: Shot): void {
    shot.setActive(false).setVisible(false);
    (shot.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  /** Retires shots that expired or left the arena. */
  update(now: number): void {
    for (const group of [this.bullets, this.bolts]) {
      for (const child of group.getChildren() as Shot[]) {
        if (!child.active) continue;
        if (now >= (child.getData("expiresAt") as number) || !this.bounds.contains(child.x, child.y)) this.kill(child);
      }
    }
  }

  clear(): void {
    for (const group of [this.bullets, this.bolts]) (group.getChildren() as Shot[]).forEach((shot) => this.kill(shot));
  }
}
