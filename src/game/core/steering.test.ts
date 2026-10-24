import { describe, expect, it } from "vitest";
import { length } from "./math";
import { chase, keepRange, rangeIntent } from "./steering";

describe("steering", () => {
  it("chases straight at the target at full speed", () => {
    const v = chase({ x: 0, y: 0 }, { x: 30, y: 40 }, 100);
    expect(v.x).toBeCloseTo(60);
    expect(v.y).toBeCloseTo(80);
  });

  it("does not produce NaN when already on the target", () => {
    expect(chase({ x: 5, y: 5 }, { x: 5, y: 5 }, 100)).toEqual({ x: 0, y: 0 });
  });

  it("approaches, retreats, or holds based on range", () => {
    const target = { x: 0, y: 0 };
    expect(rangeIntent({ x: 600, y: 0 }, target, 300, 50)).toBe("approach");
    expect(rangeIntent({ x: 100, y: 0 }, target, 300, 50)).toBe("retreat");
    expect(rangeIntent({ x: 300, y: 0 }, target, 300, 50)).toBe("hold");
  });

  it("strafes perpendicular to the target while holding range", () => {
    const v = keepRange({ x: 300, y: 0 }, { x: 0, y: 0 }, 100, 300, 50, 1);
    expect(v.x).toBeCloseTo(0);
    expect(Math.abs(v.y)).toBeCloseTo(60);
    const flipped = keepRange({ x: 300, y: 0 }, { x: 0, y: 0 }, 100, 300, 50, -1);
    expect(Math.sign(flipped.y)).toBe(-Math.sign(v.y));
  });

  it("retreats directly away when too close", () => {
    const v = keepRange({ x: 100, y: 0 }, { x: 0, y: 0 }, 100, 300, 50, 1);
    expect(v.x).toBeCloseTo(100);
    expect(length(v)).toBeCloseTo(100);
  });
});
