import { distance, normalize, perpendicular, scale, sub, type Vec } from "./math";

/** Straight pursuit at full speed. */
export function chase(position: Vec, target: Vec, speed: number): Vec {
  return scale(normalize(sub(target, position)), speed);
}

export type RangeIntent = "approach" | "retreat" | "hold";

export function rangeIntent(position: Vec, target: Vec, preferredRange: number, tolerance: number): RangeIntent {
  const dist = distance(position, target);
  if (dist > preferredRange + tolerance) return "approach";
  if (dist < preferredRange - tolerance) return "retreat";
  return "hold";
}

/**
 * Keeps a preferred distance from the target: closes in, backs off, or strafes sideways
 * (`strafeSign` picks the direction) while holding range.
 */
export function keepRange(
  position: Vec,
  target: Vec,
  speed: number,
  preferredRange: number,
  tolerance: number,
  strafeSign: 1 | -1,
): Vec {
  const toTarget = normalize(sub(target, position));
  switch (rangeIntent(position, target, preferredRange, tolerance)) {
    case "approach":
      return scale(toTarget, speed);
    case "retreat":
      return scale(toTarget, -speed);
    case "hold":
      return scale(perpendicular(toTarget), speed * 0.6 * strafeSign);
  }
}
