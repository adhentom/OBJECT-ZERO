import { describe, expect, it } from "vitest";
import { length } from "./math";
import { steerVelocity } from "./movement";

const rules = { maxSpeed: 300, acceleration: 2400, deceleration: 2000 };

describe("movement", () => {
  it("accelerates toward the input direction without overshooting max speed", () => {
    let v = { x: 0, y: 0 };
    v = steerVelocity(v, { x: 1, y: 0 }, 0.05, rules);
    expect(v.x).toBeCloseTo(120);
    for (let i = 0; i < 20; i++) v = steerVelocity(v, { x: 1, y: 0 }, 0.05, rules);
    expect(length(v)).toBeCloseTo(300);
  });

  it("brakes to a full stop without input", () => {
    let v = { x: 300, y: 0 };
    v = steerVelocity(v, { x: 0, y: 0 }, 0.1, rules);
    expect(v.x).toBeCloseTo(100);
    v = steerVelocity(v, { x: 0, y: 0 }, 0.1, rules);
    expect(v).toEqual({ x: 0, y: 0 });
  });
});
