export type EnemyKind = "drone" | "gunner";

type EnemyBase = {
  kind: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  radius: number;
  contactDamage: number;
  score: number;
};

export type DroneDef = EnemyBase & { kind: "drone" };

export type GunnerDef = EnemyBase & {
  kind: "gunner";
  preferredRange: number;
  rangeTolerance: number;
  fireIntervalMs: number;
  telegraphMs: number;
  boltSpeed: number;
  boltDamage: number;
};

export type EnemyDef = DroneDef | GunnerDef;

export const DRONE: DroneDef = {
  kind: "drone",
  name: "DRONE",
  hp: 20,
  speed: 170,
  radius: 13,
  contactDamage: 12,
  score: 10,
};

export const GUNNER: GunnerDef = {
  kind: "gunner",
  name: "GUNNER",
  hp: 50,
  speed: 115,
  radius: 17,
  contactDamage: 10,
  score: 25,
  preferredRange: 330,
  rangeTolerance: 70,
  fireIntervalMs: 2300,
  telegraphMs: 650,
  boltSpeed: 390,
  boltDamage: 14,
};

export const ENEMIES: Readonly<Record<EnemyKind, EnemyDef>> = { drone: DRONE, gunner: GUNNER };
