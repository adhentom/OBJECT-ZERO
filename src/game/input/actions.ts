import { normalize, type Vec } from "../core/math";

export type Direction = "up" | "down" | "left" | "right";

export const MOVE_KEYS: Readonly<Record<string, Direction>> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

// Keyboard-only aiming: holding any of these fires in that direction (twin-stick style).
export const AIM_KEYS: Readonly<Record<string, Direction>> = {
  KeyI: "up",
  KeyK: "down",
  KeyJ: "left",
  KeyL: "right",
};

export const DASH_KEYS = ["Space", "ShiftLeft", "ShiftRight"] as const;
export const PAUSE_KEYS = ["Escape", "KeyP"] as const;

const ALL_BOUND = new Set<string>([...Object.keys(MOVE_KEYS), ...Object.keys(AIM_KEYS), ...DASH_KEYS, ...PAUSE_KEYS]);

export function isBoundKey(code: string): boolean {
  return ALL_BOUND.has(code);
}

function directionVector(held: ReadonlySet<string>, bindings: Readonly<Record<string, Direction>>): Vec {
  let x = 0;
  let y = 0;
  const seen = new Set<Direction>();
  for (const code of held) {
    const direction = bindings[code];
    if (!direction || seen.has(direction)) continue;
    seen.add(direction);
    if (direction === "left") x -= 1;
    if (direction === "right") x += 1;
    if (direction === "up") y -= 1;
    if (direction === "down") y += 1;
  }
  return normalize({ x, y });
}

/** Unit (or zero) movement vector from held key codes. Opposite keys cancel out. */
export function moveVector(held: ReadonlySet<string>): Vec {
  return directionVector(held, MOVE_KEYS);
}

/** Unit aim vector from held aim keys, or null when no aim key is held (mouse aim applies). */
export function keyboardAim(held: ReadonlySet<string>): Vec | null {
  const aim = directionVector(held, AIM_KEYS);
  return aim.x === 0 && aim.y === 0 ? null : aim;
}
