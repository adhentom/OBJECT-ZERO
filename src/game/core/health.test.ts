import { describe, expect, it } from "vitest";
import { applyDamage, createHealth, grantInvulnerability, heal, isInvulnerable } from "./health";

describe("health", () => {
  it("rejects a non-positive max", () => {
    expect(() => createHealth(0)).toThrow(RangeError);
  });

  it("applies damage and opens an invulnerability window", () => {
    const { health, applied, killed } = applyDamage(createHealth(100), 30, 1000, 500);
    expect(applied).toBe(true);
    expect(killed).toBe(false);
    expect(health.hp).toBe(70);
    expect(isInvulnerable(health, 1499)).toBe(true);
    expect(isInvulnerable(health, 1500)).toBe(false);
  });

  it("ignores damage while invulnerable", () => {
    const first = applyDamage(createHealth(100), 30, 1000, 500).health;
    const second = applyDamage(first, 30, 1200, 500);
    expect(second.applied).toBe(false);
    expect(second.health.hp).toBe(70);
  });

  it("clamps at zero and reports the kill once", () => {
    const dead = applyDamage(createHealth(20), 50, 0, 0);
    expect(dead.health.hp).toBe(0);
    expect(dead.killed).toBe(true);
    expect(applyDamage(dead.health, 10, 5000, 0).applied).toBe(false);
  });

  it("only extends invulnerability", () => {
    const health = { ...createHealth(10), invulnerableUntil: 900 };
    expect(grantInvulnerability(health, 500).invulnerableUntil).toBe(900);
    expect(grantInvulnerability(health, 1200).invulnerableUntil).toBe(1200);
  });

  it("heals up to the maximum but never revives", () => {
    const hurt = applyDamage(createHealth(100), 40, 0, 0).health;
    expect(heal(hurt, 10).hp).toBe(70);
    expect(heal(hurt, 500).hp).toBe(100);
    const dead = applyDamage(createHealth(10), 10, 0, 0).health;
    expect(heal(dead, 50).hp).toBe(0);
  });
});
