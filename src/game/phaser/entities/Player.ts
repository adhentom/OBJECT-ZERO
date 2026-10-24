import * as Phaser from "phaser";
import { DASH, PLAYER } from "../../content/balance";
import { COLOR } from "../../content/palette";
import { createCooldown, isActive, readiness, tryUse, type Cooldown } from "../../core/cooldown";
import { applyDamage, createHealth, grantInvulnerability, isInvulnerable, type DamageResult, type Health } from "../../core/health";
import { normalize, type Vec } from "../../core/math";
import { steerVelocity } from "../../core/movement";
import { DEPTH, TEX } from "../keys";
import type { FrameActions } from "../input/KeyboardMouse";

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: Health = createHealth(PLAYER.maxHp);
  private dash: Cooldown = createCooldown();
  private dashDir: Vec = { x: 1, y: 0 };
  private lastTrailAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.player);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.player);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(PLAYER.radius, this.width / 2 - PLAYER.radius, this.height / 2 - PLAYER.radius);
    body.setCollideWorldBounds(true);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  isDashing(now: number): boolean {
    return isActive(this.dash, now);
  }

  dashReadiness(now: number): number {
    return readiness(this.dash, now, DASH.cooldownMs);
  }

  tick(actions: FrameActions, now: number, dtSeconds: number): { dashed: boolean } {
    this.setRotation(Math.atan2(actions.aim.y, actions.aim.x));
    let dashed = false;

    if (actions.dash) {
      const used = tryUse(this.dash, now, DASH.cooldownMs, DASH.durationMs);
      if (used.used) {
        this.dash = used.cooldown;
        const hasMove = actions.move.x !== 0 || actions.move.y !== 0;
        this.dashDir = normalize(hasMove ? actions.move : actions.aim);
        this.health = grantInvulnerability(this.health, now + DASH.durationMs + 60);
        dashed = true;
      }
    }

    const body = this.arcadeBody;
    if (this.isDashing(now)) {
      body.setVelocity(this.dashDir.x * DASH.speed, this.dashDir.y * DASH.speed);
      if (now - this.lastTrailAt > 22) {
        this.lastTrailAt = now;
        this.spawnAfterimage();
      }
    } else {
      const v = steerVelocity({ x: body.velocity.x, y: body.velocity.y }, actions.move, dtSeconds, PLAYER);
      body.setVelocity(v.x, v.y);
    }

    // Blink while invulnerable from damage (not during a dash, which has its own trail).
    const blinking = isInvulnerable(this.health, now) && !this.isDashing(now);
    this.setAlpha(blinking ? (Math.floor(now / 70) % 2 === 0 ? 0.35 : 1) : 1);
    return { dashed };
  }

  takeHit(amount: number, now: number): DamageResult {
    const result = applyDamage(this.health, amount, now, PLAYER.invulnerableMs);
    this.health = result.health;
    return result;
  }

  knockback(from: Vec, force: number): void {
    const dir = normalize({ x: this.x - from.x, y: this.y - from.y });
    this.arcadeBody.velocity.x += dir.x * force;
    this.arcadeBody.velocity.y += dir.y * force;
  }

  private spawnAfterimage(): void {
    const ghost = this.scene.add
      .image(this.x, this.y, TEX.player)
      .setRotation(this.rotation)
      .setTint(COLOR.player)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.45)
      .setDepth(DEPTH.player - 1);
    this.scene.tweens.add({ targets: ghost, alpha: 0, scale: 0.8, duration: 220, onComplete: () => ghost.destroy() });
  }
}
