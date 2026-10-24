export type Cooldown = { readyAt: number; activeUntil: number };

export function createCooldown(): Cooldown {
  return { readyAt: 0, activeUntil: 0 };
}

export function isReady(cooldown: Cooldown, now: number): boolean {
  return now >= cooldown.readyAt;
}

export function isActive(cooldown: Cooldown, now: number): boolean {
  return now < cooldown.activeUntil;
}

/** Starts the effect if ready. Cooldown is measured from activation, not from when the effect ends. */
export function tryUse(
  cooldown: Cooldown,
  now: number,
  cooldownMs: number,
  durationMs = 0,
): { cooldown: Cooldown; used: boolean } {
  if (!isReady(cooldown, now)) return { cooldown, used: false };
  return { cooldown: { readyAt: now + cooldownMs, activeUntil: now + durationMs }, used: true };
}

/** 0 right after use, 1 when ready again. */
export function readiness(cooldown: Cooldown, now: number, cooldownMs: number): number {
  if (cooldownMs <= 0 || isReady(cooldown, now)) return 1;
  return 1 - (cooldown.readyAt - now) / cooldownMs;
}
