import * as Phaser from "phaser";
import { normalize, sub, type Vec } from "../../core/math";
import { DASH_KEYS, PAUSE_KEYS, isBoundKey, keyboardAim, moveVector } from "../../input/actions";

export type FrameActions = {
  move: Vec;
  aim: Vec;
  aimFromKeyboard: boolean;
  fire: boolean;
  dash: boolean;
  pause: boolean;
};

/**
 * Reads keyboard and mouse into per-frame actions. Window listeners are used so held keys
 * survive scene pauses predictably; everything is released when the window loses focus.
 */
export class KeyboardMouse {
  private readonly held = new Set<string>();
  private dashQueued = false;
  private pauseQueued = false;
  private lastAim: Vec = { x: 1, y: 0 };

  constructor(private readonly scene: Phaser.Scene) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.releaseAll);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!isBoundKey(event.code)) return;
    event.preventDefault();
    this.held.add(event.code);
    if (event.repeat) return;
    if ((DASH_KEYS as readonly string[]).includes(event.code)) this.dashQueued = true;
    if ((PAUSE_KEYS as readonly string[]).includes(event.code)) this.pauseQueued = true;
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.held.delete(event.code);
  };

  releaseAll = () => {
    this.held.clear();
    this.clearEdges();
  };

  clearEdges(): void {
    this.dashQueued = false;
    this.pauseQueued = false;
  }

  /** Consumes one-shot presses (dash, pause) so each press acts once. */
  read(origin: Vec): FrameActions {
    const pointer = this.scene.input.activePointer;
    const keyAim = keyboardAim(this.held);
    let aim = keyAim;
    if (!aim) {
      const toPointer = sub({ x: pointer.worldX, y: pointer.worldY }, origin);
      aim = toPointer.x === 0 && toPointer.y === 0 ? this.lastAim : normalize(toPointer);
    }
    this.lastAim = aim;
    const actions: FrameActions = {
      move: moveVector(this.held),
      aim,
      aimFromKeyboard: keyAim !== null,
      fire: keyAim !== null || pointer.leftButtonDown(),
      dash: this.dashQueued,
      pause: this.pauseQueued,
    };
    this.clearEdges();
    return actions;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.releaseAll);
  }
}
