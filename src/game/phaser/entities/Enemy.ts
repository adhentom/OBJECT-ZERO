import * as Phaser from "phaser";
import type { EnemyDef, GunnerDef } from "../../content/enemies";
import { COLOR } from "../../content/palette";
import { normalize, perpendicular, sub, type Vec } from "../../core/math";
import { chase, keepRange } from "../../core/steering";
import { DEPTH, TEX } from "../keys";

export type EnemyContext = {
  now: number;
  target: Vec;
  telegraph: Phaser.GameObjects.Graphics;
  fireBolt: (from: Vec, dir: Vec, def: GunnerDef) => void;
};

/** Pooled enemy. `spawn` configures it for a kind; behaviour runs from pure steering rules. */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def!: EnemyDef;
  hp = 0;
  private speed = 0;
  private strafeSign: 1 | -1 = 1;
  private wobbleSeed = 0;
  private nextFireAt = 0;
  private telegraphStart = 0;
  private aimDir: Vec = { x: 1, y: 0 };

  spawn(def: EnemyDef, x: number, y: number, hpMultiplier: number, speedMultiplier: number, now: number): this {
    this.def = def;
    this.hp = Math.round(def.hp * hpMultiplier);
    this.speed = def.speed * speedMultiplier;
    this.strafeSign = Math.random() < 0.5 ? 1 : -1;
    this.wobbleSeed = Math.random() * Math.PI * 2;
    this.telegraphStart = 0;
    this.nextFireAt = def.kind === "gunner" ? now + 900 + Math.random() * def.fireIntervalMs : 0;

    this.setTexture(def.kind === "drone" ? TEX.drone : TEX.gunner);
    this.setActive(true).setVisible(true).setAlpha(1).setScale(1).clearTint();
    this.setDepth(DEPTH.enemy);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
    body.setCircle(def.radius, this.width / 2 - def.radius, this.height / 2 - def.radius);
    body.setCollideWorldBounds(true);
    body.setBounce(0.4);

    // Arrival pop.
    this.setScale(0.2);
    this.scene.tweens.add({ targets: this, scale: 1, duration: 180, ease: "Back.easeOut" });
    return this;
  }

  get color(): number {
    return this.def.kind === "drone" ? COLOR.drone : COLOR.gunner;
  }

  tick(ctx: EnemyContext, dtSeconds: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const position = { x: this.x, y: this.y };
    let desired: Vec;

    if (this.def.kind === "drone") {
      const pursuit = chase(position, ctx.target, this.speed);
      const side = perpendicular(normalize(pursuit));
      const wobble = Math.sin(ctx.now / 260 + this.wobbleSeed) * this.speed * 0.35;
      desired = { x: pursuit.x + side.x * wobble, y: pursuit.y + side.y * wobble };
      this.rotation += dtSeconds * 6;
    } else {
      desired = this.gunnerTick(ctx, position, this.def);
    }

    // Ease toward the desired velocity so knockback reads before steering takes over.
    const blend = Math.min(1, dtSeconds * 6);
    body.setVelocity(body.velocity.x + (desired.x - body.velocity.x) * blend, body.velocity.y + (desired.y - body.velocity.y) * blend);
  }

  private gunnerTick(ctx: EnemyContext, position: Vec, def: GunnerDef): Vec {
    const toTarget = normalize(sub(ctx.target, position));
    const telegraphing = this.telegraphStart > 0;

    if (!telegraphing && ctx.now >= this.nextFireAt) this.telegraphStart = ctx.now;

    if (this.telegraphStart > 0) {
      const elapsed = ctx.now - this.telegraphStart;
      const lockAt = def.telegraphMs - 180;
      if (elapsed < lockAt) this.aimDir = toTarget;
      this.drawTelegraph(ctx.telegraph, elapsed / def.telegraphMs, elapsed >= lockAt);
      if (elapsed >= def.telegraphMs) {
        ctx.fireBolt({ x: this.x + this.aimDir.x * 22, y: this.y + this.aimDir.y * 22 }, this.aimDir, def);
        this.telegraphStart = 0;
        this.nextFireAt = ctx.now + def.fireIntervalMs * (0.85 + Math.random() * 0.3);
      }
      this.rotation = Math.atan2(this.aimDir.y, this.aimDir.x);
      return { x: 0, y: 0 };
    }

    this.rotation = Math.atan2(toTarget.y, toTarget.x);
    return keepRange(position, ctx.target, this.speed, def.preferredRange, def.rangeTolerance, this.strafeSign);
  }

  private drawTelegraph(g: Phaser.GameObjects.Graphics, progress: number, locked: boolean): void {
    const length = 1400;
    const endX = this.x + this.aimDir.x * length;
    const endY = this.y + this.aimDir.y * length;
    g.lineStyle(locked ? 3 : 1.5, COLOR.warning, locked ? 0.85 : 0.2 + progress * 0.4);
    g.lineBetween(this.x, this.y, endX, endY);
    g.fillStyle(COLOR.warning, 0.35 + progress * 0.5).fillCircle(this.x + this.aimDir.x * 22, this.y + this.aimDir.y * 22, 3 + progress * 4);
  }

  /** Returns true when this hit destroys the enemy. */
  takeDamage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }

  despawn(): void {
    this.scene.tweens.killTweensOf(this);
    this.telegraphStart = 0;
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
  }
}
