import { moveToward, scale, type Vec } from "./math";

export type MovementRules = { maxSpeed: number; acceleration: number; deceleration: number };

/**
 * Accelerates toward the input direction (a unit or zero vector) and brakes when there is no input,
 * which gives responsive but non-instant movement.
 */
export function steerVelocity(velocity: Vec, inputDir: Vec, dtSeconds: number, rules: MovementRules): Vec {
  const hasInput = inputDir.x !== 0 || inputDir.y !== 0;
  const target = hasInput ? scale(inputDir, rules.maxSpeed) : { x: 0, y: 0 };
  const rate = hasInput ? rules.acceleration : rules.deceleration;
  return moveToward(velocity, target, rate * dtSeconds);
}
