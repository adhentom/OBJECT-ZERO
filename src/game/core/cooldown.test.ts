import { describe, expect, it } from "vitest";
import { createCooldown, isActive, readiness, tryUse } from "./cooldown";

describe("cooldown", () => {
  it("uses when ready and refuses until the cooldown ends", () => {
    const first = tryUse(createCooldown(), 1000, 1100, 150);
    expect(first.used).toBe(true);
    expect(isActive(first.cooldown, 1100)).toBe(true);
    expect(isActive(first.cooldown, 1150)).toBe(false);
    expect(tryUse(first.cooldown, 2099, 1100).used).toBe(false);
    expect(tryUse(first.cooldown, 2100, 1100).used).toBe(true);
  });

  it("reports readiness from 0 to 1", () => {
    const { cooldown } = tryUse(createCooldown(), 0, 1000);
    expect(readiness(cooldown, 0, 1000)).toBe(0);
    expect(readiness(cooldown, 500, 1000)).toBeCloseTo(0.5);
    expect(readiness(cooldown, 1000, 1000)).toBe(1);
  });
});
