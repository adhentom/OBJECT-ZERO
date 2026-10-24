import * as Phaser from "phaser";
import { WAVES } from "../../content/balance";
import type { EnemyKind } from "../../content/enemies";
import { COLOR } from "../../content/palette";
import { distance, type Vec } from "../../core/math";
import { createRng, type Rng } from "../../core/rng";
import { spawnQueue, type WavePlan } from "../../core/waves";
import { DEPTH, TEX } from "../keys";

const EDGE_BAND = 90;
const MIN_PLAYER_DISTANCE = 240;

/** Feeds a wave's spawn queue into the arena with telegraphed spawn points near the edges. */
export class SpawnDirector {
  private queue: EnemyKind[] = [];
  private pending = 0;
  private timer: Phaser.Time.TimerEvent | null = null;
  private readonly rng: Rng = createRng(Date.now());

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: Phaser.Geom.Rectangle,
    private readonly aliveCount: () => number,
    private readonly playerPosition: () => Vec,
    private readonly onSpawn: (kind: EnemyKind, x: number, y: number) => void,
  ) {}

  start(plan: WavePlan): void {
    this.stop();
    this.queue = spawnQueue(plan, this.rng);
    const tick = () => this.spawnBatch(plan.spawnBatch);
    tick();
    this.timer = this.scene.time.addEvent({ delay: plan.spawnIntervalMs, loop: true, callback: tick });
  }

  get remaining(): number {
    return this.queue.length + this.pending;
  }

  get done(): boolean {
    return this.remaining === 0;
  }

  stop(): void {
    this.timer?.remove();
    this.timer = null;
    this.queue = [];
  }

  private spawnBatch(batch: number): void {
    for (let i = 0; i < batch; i++) {
      if (this.queue.length === 0 || this.aliveCount() + this.pending >= WAVES.maxAlive) return;
      const kind = this.queue.shift()!;
      const point = this.pickPoint();
      this.pending++;
      this.telegraph(point, kind === "drone" ? COLOR.drone : COLOR.gunner);
      this.scene.time.delayedCall(WAVES.spawnTelegraphMs, () => {
        this.pending--;
        this.onSpawn(kind, point.x, point.y);
      });
    }
  }

  private pickPoint(): Vec {
    const b = this.bounds;
    const player = this.playerPosition();
    let point: Vec = { x: b.centerX, y: b.top + EDGE_BAND / 2 };
    for (let attempt = 0; attempt < 12; attempt++) {
      const side = Math.floor(this.rng() * 4);
      const along = this.rng();
      const inset = 24 + this.rng() * (EDGE_BAND - 24);
      point =
        side === 0
          ? { x: b.left + along * b.width, y: b.top + inset }
          : side === 1
            ? { x: b.right - inset, y: b.top + along * b.height }
            : side === 2
              ? { x: b.left + along * b.width, y: b.bottom - inset }
              : { x: b.left + inset, y: b.top + along * b.height };
      point.x = Phaser.Math.Clamp(point.x, b.left + 24, b.right - 24);
      point.y = Phaser.Math.Clamp(point.y, b.top + 24, b.bottom - 24);
      if (distance(point, player) >= MIN_PLAYER_DISTANCE) break;
    }
    return point;
  }

  private telegraph(point: Vec, color: number): void {
    const ring = this.scene.add
      .image(point.x, point.y, TEX.ring)
      .setTint(color)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.6)
      .setAlpha(0.2)
      .setDepth(DEPTH.telegraph);
    const core = this.scene.add.image(point.x, point.y, TEX.glow).setTint(color).setBlendMode(Phaser.BlendModes.ADD).setScale(0.2).setDepth(DEPTH.telegraph);
    this.scene.tweens.add({ targets: ring, scale: 0.22, alpha: 0.9, duration: WAVES.spawnTelegraphMs, ease: "Quad.easeIn" });
    this.scene.tweens.add({
      targets: core,
      scale: 0.7,
      duration: WAVES.spawnTelegraphMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        ring.destroy();
        core.destroy();
      },
    });
  }
}
