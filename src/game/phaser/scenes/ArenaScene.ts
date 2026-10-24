import * as Phaser from "phaser";
import type { GameBus } from "../../bridge/events";
import { ARENA, BLASTER, PLAYER, SCORING, WAVES } from "../../content/balance";
import { ENEMIES, type EnemyKind, type GunnerDef } from "../../content/enemies";
import { COLOR, CSS } from "../../content/palette";
import { heal, type DamageResult } from "../../core/health";
import { normalize, type Vec } from "../../core/math";
import { beginCombat, clearWave, createRunFlow, endRun, nextWave, type RunFlow, type RunPhase } from "../../core/runFlow";
import { comboRemaining, createScore, currentMultiplier, registerKill, registerPlayerHit, registerWaveClear, waveBonus, type ScoreState } from "../../core/scoring";
import { planWave, type WavePlan } from "../../core/waves";
import { loadBestScore, saveBestScore } from "../../storage";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Effects } from "../fx/effects";
import { KeyboardMouse } from "../input/KeyboardMouse";
import { DEPTH, REGISTRY, SCENE, TEX } from "../keys";
import { SpawnDirector } from "../systems/SpawnDirector";
import { Weapons } from "../systems/Weapons";
import type { RunResult } from "./GameOverScene";
import type { HudScene } from "./HudScene";

export type HudSnapshot = {
  phase: RunPhase;
  wave: number;
  hp: number;
  maxHp: number;
  score: number;
  multiplier: number;
  comboRemaining: number;
  dashReadiness: number;
  hostiles: number;
};

type Shot = Phaser.Physics.Arcade.Sprite;

/** Gameplay scene: wires entities, systems and rules together. Outcomes are decided in `core/`. */
export class ArenaScene extends Phaser.Scene {
  private controls!: KeyboardMouse;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private weapons!: Weapons;
  private director!: SpawnDirector;
  private fx!: Effects;
  private telegraph!: Phaser.GameObjects.Graphics;
  private reticle!: Phaser.GameObjects.Image;
  private bounds!: Phaser.Geom.Rectangle;
  private flow: RunFlow = createRunFlow();
  private score: ScoreState = createScore();
  private plan!: WavePlan;
  /** Simulation clock in ms. Advances only while this scene updates, so pausing freezes all rules. */
  private simTime = 0;

  constructor() {
    super(SCENE.arena);
  }

  create() {
    const { width, height } = this.scale;
    this.flow = createRunFlow();
    this.score = createScore();
    this.simTime = 0;
    this.physics.resume();
    this.physics.world.timeScale = 1;

    this.bounds = new Phaser.Geom.Rectangle(ARENA.margin, ARENA.topMargin, width - ARENA.margin * 2, height - ARENA.topMargin - ARENA.margin);
    this.physics.world.setBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    this.drawArena();

    this.fx = new Effects(this);
    this.telegraph = this.add.graphics().setDepth(DEPTH.telegraph);
    this.player = new Player(this, this.bounds.centerX, this.bounds.centerY);
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: 64 });
    this.weapons = new Weapons(this, this.bounds);
    this.director = new SpawnDirector(
      this,
      this.bounds,
      () => this.enemies.countActive(true),
      () => ({ x: this.player.x, y: this.player.y }),
      (kind, x, y) => this.spawnEnemy(kind, x, y),
    );

    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.weapons.bullets, this.enemies, (bullet, enemy) => this.onBulletHit(bullet as unknown as Shot, enemy as unknown as Enemy));
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => this.onContact(enemy as unknown as Enemy));
    this.physics.add.overlap(this.player, this.weapons.bolts, (_player, bolt) => this.onBoltHit(bolt as unknown as Shot));

    this.controls = new KeyboardMouse(this);
    this.reticle = this.add.image(width / 2, height / 2, TEX.reticle).setTint(COLOR.trim).setDepth(DEPTH.reticle);
    this.input.setDefaultCursor("none");

    this.scene.launch(SCENE.hud);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.cameras.main.fadeIn(250, 2, 3, 5);
    // Launched scenes are created on the next step; the intro banner needs the HUD to exist.
    this.hud.events.once(Phaser.Scenes.Events.CREATE, () => this.startIntro());
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta, 50);
    this.simTime += dt;
    const now = this.simTime;
    this.telegraph.clear();
    if (this.flow.phase === "over") return;

    const actions = this.controls.read({ x: this.player.x, y: this.player.y });
    if (actions.pause) {
      this.openPause();
      return;
    }

    const { dashed } = this.player.tick(actions, now, dt / 1000);
    if (dashed) this.fx.ring(this.player.x, this.player.y, COLOR.player, 34, 200);

    if (actions.fire) {
      const muzzle = { x: this.player.x + actions.aim.x * 24, y: this.player.y + actions.aim.y * 24 };
      if (this.weapons.tryFireBlaster(muzzle, actions.aim, now)) this.fx.muzzle(muzzle.x, muzzle.y, COLOR.bullet);
    }

    const pointer = this.input.activePointer;
    if (actions.aimFromKeyboard) this.reticle.setPosition(this.player.x + actions.aim.x * 140, this.player.y + actions.aim.y * 140);
    else this.reticle.setPosition(pointer.worldX, pointer.worldY);

    const ctx = {
      now,
      target: { x: this.player.x, y: this.player.y },
      telegraph: this.telegraph,
      fireBolt: (from: Vec, dir: Vec, def: GunnerDef) => this.weapons.fireBolt(from, dir, def, now),
    };
    for (const enemy of this.enemies.getChildren() as Enemy[]) if (enemy.active) enemy.tick(ctx, dt / 1000);
    this.weapons.update(now);

    if (this.flow.phase === "combat" && this.director.done && this.enemies.countActive(true) === 0) this.onWaveCleared();
  }

  hudSnapshot(): HudSnapshot {
    const now = this.simTime;
    return {
      phase: this.flow.phase,
      wave: this.flow.wave,
      hp: this.player.health.hp,
      maxHp: this.player.health.maxHp,
      score: this.score.points,
      multiplier: currentMultiplier(this.score, now, SCORING),
      comboRemaining: comboRemaining(this.score, now, SCORING),
      dashReadiness: this.player.dashReadiness(now),
      hostiles: this.enemies.countActive(true) + (this.flow.phase === "combat" ? this.director.remaining : 0),
    };
  }

  private get hud(): HudScene {
    return this.scene.get(SCENE.hud) as HudScene;
  }

  private startIntro() {
    this.plan = planWave(this.flow.wave, WAVES);
    const { drone, gunner } = this.plan.counts;
    const parts = [`${drone} DRONES`];
    if (gunner > 0) parts.push(`${gunner} GUNNERS`);
    const hint = this.flow.wave === 1 ? "  ·  SURVIVE" : this.flow.wave === 2 ? "  ·  GUNNERS FIRE ALONG THE RED LINE" : "";
    this.hud.showBanner(`WAVE ${String(this.flow.wave).padStart(2, "0")}`, `INCOMING: ${parts.join(" · ")}${hint}`, CSS.cyan);
    this.emitStatus();
    this.time.delayedCall(WAVES.introMs, () => {
      const step = beginCombat(this.flow);
      if (!step.changed) return;
      this.flow = step.flow;
      this.director.start(this.plan);
    });
  }

  private onWaveCleared() {
    const step = clearWave(this.flow);
    if (!step.changed) return;
    this.flow = step.flow;
    this.director.stop();
    const bonus = waveBonus(this.flow.wave, SCORING);
    this.score = registerWaveClear(this.score, this.flow.wave, SCORING);
    this.player.health = heal(this.player.health, WAVES.clearRepair);
    this.hud.showBanner("WAVE CLEARED", `+${bonus} BONUS  ·  HULL +${WAVES.clearRepair}`, CSS.green);
    this.fx.ring(this.player.x, this.player.y, COLOR.heal, 120, 600);
    this.emitStatus();
    this.time.delayedCall(WAVES.clearedMs, () => {
      const next = nextWave(this.flow);
      if (!next.changed) return;
      this.flow = next.flow;
      this.startIntro();
    });
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number) {
    if (this.flow.phase !== "combat") return;
    const enemy = this.enemies.get(x, y) as Enemy | null;
    if (!enemy) return;
    enemy.spawn(ENEMIES[kind], x, y, this.plan.hpMultiplier, this.plan.speedMultiplier, this.simTime);
    this.fx.sparks(x, y, enemy.color, 6);
  }

  private onBulletHit(bullet: Shot, enemy: Enemy) {
    if (!bullet.active || !enemy.active) return;
    this.weapons.kill(bullet);
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const push = normalize({ x: bullet.body!.velocity.x, y: bullet.body!.velocity.y });
    const force = enemy.def.kind === "gunner" ? BLASTER.knockback * 0.5 : BLASTER.knockback;
    body.velocity.x += push.x * force;
    body.velocity.y += push.y * force;
    this.fx.sparks(bullet.x, bullet.y, enemy.color, 4);
    if (enemy.takeDamage(bullet.getData("damage") as number)) this.killEnemy(enemy, true);
    else this.fx.hitFlash(enemy);
  }

  private killEnemy(enemy: Enemy, scored: boolean) {
    const { x, y } = enemy;
    this.fx.explosion(x, y, enemy.color, enemy.def.kind === "gunner" ? 1.4 : 1);
    if (scored) {
      const before = this.score.points;
      this.score = registerKill(this.score, enemy.def.score, this.simTime, SCORING);
      const multiplied = this.score.multiplier > 1;
      this.fx.floatText(x, y - 10, `+${this.score.points - before}`, multiplied ? CSS.magenta : CSS.text, multiplied ? 18 : 15);
      this.fx.shake(60, 0.002);
    }
    enemy.despawn();
    this.emitStatus();
  }

  private onContact(enemy: Enemy) {
    if (!enemy.active || this.flow.phase === "over") return;
    const result = this.player.takeHit(enemy.def.contactDamage, this.simTime);
    if (!result.applied) return;
    const from = { x: enemy.x, y: enemy.y };
    if (enemy.def.kind === "drone") {
      // Drones are kamikaze units: they detonate on impact and award nothing.
      this.killEnemy(enemy, false);
    } else {
      const away = normalize({ x: enemy.x - this.player.x, y: enemy.y - this.player.y });
      (enemy.body as Phaser.Physics.Arcade.Body).setVelocity(away.x * 300, away.y * 300);
    }
    this.onPlayerDamaged(result, from);
  }

  private onBoltHit(bolt: Shot) {
    if (!bolt.active || this.flow.phase === "over") return;
    // Dashing through a bolt dodges it; the bolt flies on.
    if (this.player.isDashing(this.simTime)) return;
    const result = this.player.takeHit(bolt.getData("damage") as number, this.simTime);
    if (!result.applied) return;
    const from = { x: bolt.x, y: bolt.y };
    this.weapons.kill(bolt);
    this.fx.sparks(from.x, from.y, COLOR.bolt, 10);
    this.onPlayerDamaged(result, from);
  }

  private onPlayerDamaged(result: DamageResult, from: Vec) {
    this.score = registerPlayerHit(this.score);
    this.player.knockback(from, PLAYER.contactKnockback);
    this.fx.hitFlash(this.player, 90);
    this.fx.shake(160, 0.008);
    this.cameras.main.flash(110, 90, 0, 20);
    this.emitStatus();
    if (result.killed) this.onPlayerKilled();
  }

  private onPlayerKilled() {
    const step = endRun(this.flow);
    if (!step.changed) return;
    this.flow = step.flow;
    this.director.stop();
    this.telegraph.clear();
    this.fx.explosion(this.player.x, this.player.y, COLOR.player, 2.6);
    this.fx.explosion(this.player.x, this.player.y, COLOR.white, 1.2);
    this.fx.shake(420, 0.016);
    this.player.setVisible(false);
    this.player.arcadeBody.enable = false;
    this.reticle.setVisible(false);
    this.physics.world.timeScale = 4;
    this.emitStatus();
    this.time.delayedCall(1500, () => this.finishRun());
  }

  private finishRun() {
    const previousBest = loadBestScore();
    const newBest = this.score.points > previousBest;
    if (newBest) saveBestScore(this.score.points);
    const result: RunResult = {
      score: this.score.points,
      wave: this.flow.wave,
      kills: this.score.kills,
      bestMultiplier: this.score.bestMultiplier,
      survivedMs: this.simTime,
      best: Math.max(previousBest, this.score.points),
      newBest,
    };
    this.scene.stop(SCENE.hud);
    this.scene.start(SCENE.gameOver, result);
  }

  private openPause() {
    if (this.flow.phase === "over" || !this.scene.isActive()) return;
    this.scene.launch(SCENE.pause);
    this.scene.pause();
  }

  private onResume() {
    this.controls.releaseAll();
    this.input.setDefaultCursor("none");
  }

  private onBlur() {
    this.controls.releaseAll();
    this.openPause();
  }

  private emitStatus() {
    (this.registry.get(REGISTRY.bus) as GameBus | undefined)?.emit("status", {
      phase: this.flow.phase,
      wave: this.flow.wave,
      score: this.score.points,
      hp: this.player.health.hp,
      maxHp: this.player.health.maxHp,
    });
  }

  private cleanup() {
    this.controls.destroy();
    this.director.stop();
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur, this);
    this.input.setDefaultCursor("default");
  }

  private drawArena() {
    const b = this.bounds;
    this.add.tileSprite(b.x, b.y, b.width, b.height, TEX.floor).setOrigin(0).setDepth(DEPTH.floor);

    const deco = this.add.graphics().setDepth(DEPTH.decal);
    // Central emblem and lane markings, barely visible.
    deco.lineStyle(2, COLOR.trim, 0.07).strokeCircle(b.centerX, b.centerY, 120);
    deco.lineStyle(1, COLOR.trim, 0.05).strokeCircle(b.centerX, b.centerY, 76);
    deco.lineStyle(1, COLOR.trim, 0.04).lineBetween(b.centerX - 160, b.centerY, b.centerX + 160, b.centerY).lineBetween(b.centerX, b.centerY - 160, b.centerX, b.centerY + 160);
    deco.lineStyle(1, COLOR.trim, 0.05).strokeRect(b.x + 90, b.y + 70, b.width - 180, b.height - 140);

    // Hazard-striped border.
    const band = 12;
    this.add.tileSprite(b.x - band, b.y - band, b.width + band * 2, band, TEX.hazard).setOrigin(0).setDepth(DEPTH.decal);
    this.add.tileSprite(b.x - band, b.bottom, b.width + band * 2, band, TEX.hazard).setOrigin(0).setDepth(DEPTH.decal);
    this.add.tileSprite(b.x - band, b.y, band, b.height, TEX.hazard).setOrigin(0).setDepth(DEPTH.decal);
    this.add.tileSprite(b.right, b.y, band, b.height, TEX.hazard).setOrigin(0).setDepth(DEPTH.decal);

    // Neon trim with a soft glow and accent corner brackets.
    deco.lineStyle(8, COLOR.trim, 0.08).strokeRectShape(b);
    deco.lineStyle(2, COLOR.trim, 0.85).strokeRectShape(b);
    const arm = 28;
    deco.lineStyle(3, COLOR.drone, 0.9);
    for (const [cx, cy, sx, sy] of [
      [b.left, b.top, 1, 1],
      [b.right, b.top, -1, 1],
      [b.left, b.bottom, 1, -1],
      [b.right, b.bottom, -1, -1],
    ]) {
      deco.lineBetween(cx, cy, cx + arm * sx, cy).lineBetween(cx, cy, cx, cy + arm * sy);
    }

    // Pulsing floor lights along the walls.
    const lights: Phaser.GameObjects.Image[] = [];
    for (let i = 1; i < 8; i++) {
      const x = b.x + (b.width * i) / 8;
      lights.push(this.add.image(x, b.top + 6, TEX.glow).setTint(COLOR.trim).setScale(0.5, 0.25));
      lights.push(this.add.image(x, b.bottom - 6, TEX.glow).setTint(COLOR.trim).setScale(0.5, 0.25));
    }
    lights.forEach((light) => light.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.25).setDepth(DEPTH.decal));
    this.tweens.add({ targets: lights, alpha: 0.08, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // Slow ambient dust.
    this.add
      .particles(0, 0, TEX.spark, {
        x: { min: b.left, max: b.right },
        y: { min: b.top, max: b.bottom },
        lifespan: 4500,
        speed: { min: 4, max: 14 },
        scale: { start: 0.6, end: 0.2 },
        alpha: { start: 0.18, end: 0 },
        tint: COLOR.trim,
        frequency: 260,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(DEPTH.decal);
  }
}
