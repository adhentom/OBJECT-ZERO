export type Health = {
  hp: number;
  maxHp: number;
  invulnerableUntil: number;
};

export function createHealth(maxHp: number): Health {
  if (!(maxHp > 0)) throw new RangeError(`maxHp must be positive, got ${maxHp}`);
  return { hp: maxHp, maxHp, invulnerableUntil: 0 };
}

export function isAlive(health: Health): boolean {
  return health.hp > 0;
}

export function isInvulnerable(health: Health, now: number): boolean {
  return now < health.invulnerableUntil;
}

export type DamageResult = { health: Health; applied: boolean; killed: boolean };

/** Applies damage unless the target is dead or inside its invulnerability window. */
export function applyDamage(health: Health, amount: number, now: number, invulnerableMs: number): DamageResult {
  if (!isAlive(health) || isInvulnerable(health, now) || amount <= 0) {
    return { health, applied: false, killed: false };
  }
  const hp = Math.max(0, health.hp - amount);
  return {
    health: { ...health, hp, invulnerableUntil: now + invulnerableMs },
    applied: true,
    killed: hp === 0,
  };
}

/** Grants invulnerability without taking damage (used by the dash). */
export function grantInvulnerability(health: Health, until: number): Health {
  return until > health.invulnerableUntil ? { ...health, invulnerableUntil: until } : health;
}

export function heal(health: Health, amount: number): Health {
  if (!isAlive(health) || amount <= 0) return health;
  return { ...health, hp: Math.min(health.maxHp, health.hp + amount) };
}
