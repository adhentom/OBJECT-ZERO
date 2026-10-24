export const SCENE = {
  boot: "Boot",
  menu: "Menu",
  arena: "Arena",
  hud: "Hud",
  pause: "Pause",
  gameOver: "GameOver",
} as const;

export const TEX = {
  player: "player",
  drone: "drone",
  gunner: "gunner",
  bullet: "bullet",
  bolt: "bolt",
  spark: "spark",
  glow: "glow",
  ring: "ring",
  reticle: "reticle",
  floor: "floor",
  hazard: "hazard",
  scanlines: "scanlines",
} as const;

export const DEPTH = {
  floor: 0,
  decal: 2,
  telegraph: 5,
  enemy: 10,
  bullet: 12,
  bolt: 13,
  player: 15,
  fx: 20,
  reticle: 50,
} as const;

export const REGISTRY = { bus: "bus" } as const;
