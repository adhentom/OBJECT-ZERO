export type Vec = { x: number; y: number };

export const ZERO: Vec = Object.freeze({ x: 0, y: 0 });

export function length(v: Vec): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec): Vec {
  const len = length(v);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

export function scale(v: Vec, factor: number): Vec {
  return { x: v.x * factor, y: v.y * factor };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function distance(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rotates a vector 90° counter-clockwise (screen space: y points down). */
export function perpendicular(v: Vec): Vec {
  return { x: v.y, y: -v.x };
}

/** Moves `current` toward `target` by at most `maxDelta` (per component vector distance). */
export function moveToward(current: Vec, target: Vec, maxDelta: number): Vec {
  const diff = sub(target, current);
  const dist = length(diff);
  if (dist <= maxDelta || dist === 0) return { x: target.x, y: target.y };
  return { x: current.x + (diff.x / dist) * maxDelta, y: current.y + (diff.y / dist) * maxDelta };
}
