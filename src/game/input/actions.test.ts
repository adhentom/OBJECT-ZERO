import { describe, expect, it } from "vitest";
import { isBoundKey, keyboardAim, moveVector } from "./actions";

describe("input actions", () => {
  it("normalises diagonal movement", () => {
    const v = moveVector(new Set(["KeyW", "KeyD"]));
    expect(v.x).toBeCloseTo(Math.SQRT1_2);
    expect(v.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it("cancels opposite keys and counts WASD + arrows for the same direction once", () => {
    expect(moveVector(new Set(["KeyA", "KeyD"]))).toEqual({ x: 0, y: 0 });
    expect(moveVector(new Set(["KeyW", "ArrowUp"]))).toEqual({ x: 0, y: -1 });
  });

  it("returns keyboard aim only while an aim key is held", () => {
    expect(keyboardAim(new Set(["KeyW"]))).toBeNull();
    expect(keyboardAim(new Set(["KeyL"]))).toEqual({ x: 1, y: 0 });
  });

  it("knows which keys the game owns", () => {
    expect(isBoundKey("Space")).toBe(true);
    expect(isBoundKey("KeyQ")).toBe(false);
  });
});
