import { describe, expect, it } from "vitest";
import { WAVES } from "../content/balance";
import { createRng } from "./rng";
import { planWave, spawnQueue, totalEnemies } from "./waves";

describe("waves", () => {
  it("rejects invalid wave numbers", () => {
    expect(() => planWave(0, WAVES)).toThrow(RangeError);
    expect(() => planWave(1.5, WAVES)).toThrow(RangeError);
  });

  it("opens with drones only and introduces gunners on wave 2", () => {
    expect(planWave(1, WAVES).counts.gunner).toBe(0);
    expect(planWave(2, WAVES).counts.gunner).toBeGreaterThan(0);
  });

  it("gets harder every wave and respects the caps", () => {
    for (let wave = 1; wave < 30; wave++) {
      const current = planWave(wave, WAVES);
      const next = planWave(wave + 1, WAVES);
      expect(next.hpMultiplier).toBeGreaterThan(current.hpMultiplier);
      expect(next.spawnIntervalMs).toBeLessThanOrEqual(current.spawnIntervalMs);
      expect(next.speedMultiplier).toBeLessThanOrEqual(WAVES.maxSpeedMultiplier);
      expect(next.spawnBatch).toBeLessThanOrEqual(WAVES.maxSpawnBatch);
      expect(next.spawnIntervalMs).toBeGreaterThanOrEqual(WAVES.minSpawnIntervalMs);
      if (wave >= 5) expect(totalEnemies(next)).toBeGreaterThan(totalEnemies(current));
    }
  });

  it("queues every enemy exactly once and leads with drones", () => {
    const plan = planWave(4, WAVES);
    const queue = spawnQueue(plan, createRng(42));
    expect(queue).toHaveLength(totalEnemies(plan));
    expect(queue.filter((kind) => kind === "gunner")).toHaveLength(plan.counts.gunner);
    expect(queue.slice(0, 3)).toEqual(["drone", "drone", "drone"]);
  });

  it("is reproducible for a given seed", () => {
    const plan = planWave(6, WAVES);
    expect(spawnQueue(plan, createRng(7))).toEqual(spawnQueue(plan, createRng(7)));
  });
});
