// Tunable gameplay numbers that are not tied to one enemy type.
export const ARENA = {
  width: 1280,
  height: 720,
  /** Playable floor inset from the canvas edge; the border is hazard trim and HUD space. */
  margin: 36,
  topMargin: 84,
} as const;

export const PLAYER = {
  maxHp: 100,
  radius: 14,
  maxSpeed: 300,
  acceleration: 2600,
  deceleration: 2200,
  invulnerableMs: 750,
  contactKnockback: 260,
} as const;

export const DASH = {
  speed: 920,
  durationMs: 150,
  cooldownMs: 1100,
} as const;

export const BLASTER = {
  fireIntervalMs: 110,
  bulletSpeed: 980,
  damage: 10,
  lifetimeMs: 650,
  spreadRadians: 0.05,
  knockback: 60,
} as const;

export const WAVES = {
  introMs: 1700,
  clearedMs: 1900,
  spawnTelegraphMs: 750,
  maxAlive: 36,
  hpGrowthPerWave: 0.1,
  speedGrowthPerWave: 0.04,
  maxSpeedMultiplier: 1.5,
  baseSpawnIntervalMs: 900,
  spawnIntervalStepMs: 55,
  minSpawnIntervalMs: 340,
  maxSpawnBatch: 4,
} as const;

export const SCORING = {
  comboWindowMs: 1800,
  comboStep: 0.5,
  maxMultiplier: 5,
  waveBonusPerWave: 100,
} as const;
