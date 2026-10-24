import * as Phaser from "phaser";
import { CSS, FONT } from "../../content/palette";
import { DEPTH, TEX } from "../keys";

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

/** Short-lived visual feedback: sparks, explosions, rings, floating text, screen shake. */
export class Effects {
  private readonly emitters = new Map<number, Emitter>();

  constructor(private readonly scene: Phaser.Scene) {}

  private emitter(color: number): Emitter {
    let emitter = this.emitters.get(color);
    if (!emitter) {
      emitter = this.scene.add.particles(0, 0, TEX.spark, {
        speed: { min: 90, max: 360 },
        lifespan: { min: 200, max: 520 },
        scale: { start: 1.3, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: color,
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
      emitter.setDepth(DEPTH.fx);
      this.emitters.set(color, emitter);
    }
    return emitter;
  }

  sparks(x: number, y: number, color: number, count = 8): void {
    this.emitter(color).explode(count, x, y);
  }

  glow(x: number, y: number, color: number, scale: number, durationMs: number): void {
    const image = this.scene.add
      .image(x, y, TEX.glow)
      .setTint(color)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(scale)
      .setDepth(DEPTH.fx);
    this.scene.tweens.add({
      targets: image,
      alpha: 0,
      scale: scale * 1.6,
      duration: durationMs,
      onComplete: () => image.destroy(),
    });
  }

  ring(x: number, y: number, color: number, radius: number, durationMs = 320): void {
    const ring = this.scene.add
      .image(x, y, TEX.ring)
      .setTint(color)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.1)
      .setDepth(DEPTH.fx);
    this.scene.tweens.add({
      targets: ring,
      scale: radius / 60,
      alpha: 0,
      duration: durationMs,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
  }

  explosion(x: number, y: number, color: number, size = 1): void {
    this.sparks(x, y, color, Math.round(14 * size));
    this.sparks(x, y, 0xffffff, Math.round(5 * size));
    this.glow(x, y, color, 0.9 * size, 260);
    this.ring(x, y, color, 46 * size, 300);
  }

  muzzle(x: number, y: number, color: number): void {
    this.glow(x, y, color, 0.32, 70);
  }

  floatText(x: number, y: number, text: string, color: string = CSS.text, size = 16): void {
    const label = this.scene.add
      .text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(DEPTH.fx + 1);
    this.scene.tweens.add({
      targets: label,
      y: y - 34,
      alpha: 0,
      duration: 650,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  shake(durationMs: number, intensity: number): void {
    this.scene.cameras.main.shake(durationMs, intensity);
  }

  /** Briefly paints a sprite solid white to confirm a hit. */
  hitFlash(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, durationMs = 55): void {
    sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(durationMs, () => {
      if (sprite.active) sprite.clearTint();
    });
  }
}
