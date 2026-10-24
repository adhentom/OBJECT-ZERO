import type { EnemyKind } from "../content/enemies";
import { shuffle, type Rng } from "./rng";

export type WaveRules = {
  hpGrowthPerWave: number;
  speedGrowthPerWave: number;
  maxSpeedMultiplier: number;
  baseSpawnIntervalMs: number;
  spawnIntervalStepMs: number;
  minSpawnIntervalMs: number;
  maxSpawnBatch: number;
};

export type WavePlan = {
  wave: number;
  counts: Readonly<Record<EnemyKind, number>>;
  hpMultiplier: number;
  speedMultiplier: number;
  spawnIntervalMs: number;
  spawnBatch: number;
};

// Hand-authored opening waves teach one threat at a time; later waves follow a formula.
const AUTHORED: readonly Record<EnemyKind, number>[] = [
  { drone: 8, gunner: 0 },
  { drone: 10, gunner: 2 },
  { drone: 12, gunner: 3 },
  { drone: 8, gunner: 6 },
  { drone: 18, gunner: 5 },
];

function waveCounts(wave: number): Record<EnemyKind, number> {
  if (wave <= AUTHORED.length) return { ...AUTHORED[wave - 1] };
  const extra = wave - AUTHORED.length;
  return { drone: 18 + 3 * extra, gunner: 5 + Math.ceil(extra * 1.2) };
}

export function planWave(wave: number, rules: WaveRules): WavePlan {
  if (!Number.isInteger(wave) || wave < 1) throw new RangeError(`Wave must be a positive integer, got ${wave}`);
  const step = wave - 1;
  return {
    wave,
    counts: waveCounts(wave),
    hpMultiplier: 1 + rules.hpGrowthPerWave * step,
    speedMultiplier: Math.min(rules.maxSpeedMultiplier, 1 + rules.speedGrowthPerWave * step),
    spawnIntervalMs: Math.max(rules.minSpawnIntervalMs, rules.baseSpawnIntervalMs - rules.spawnIntervalStepMs * step),
    spawnBatch: Math.min(rules.maxSpawnBatch, 1 + Math.floor(step / 2)),
  };
}

export function totalEnemies(plan: WavePlan): number {
  return Object.values(plan.counts).reduce((sum, count) => sum + count, 0);
}

/** Spawn order for a wave. Gunners are kept out of the first few slots so each wave opens with a swarm. */
export function spawnQueue(plan: WavePlan, rng: Rng): EnemyKind[] {
  const drones: EnemyKind[] = Array(plan.counts.drone).fill("drone");
  const gunners: EnemyKind[] = Array(plan.counts.gunner).fill("gunner");
  const lead = drones.splice(0, Math.min(3, drones.length));
  return [...lead, ...shuffle([...drones, ...gunners], rng)];
}
