export type ScoringRules = {
  comboWindowMs: number;
  comboStep: number;
  maxMultiplier: number;
  waveBonusPerWave: number;
};

export type ScoreState = {
  points: number;
  multiplier: number;
  bestMultiplier: number;
  kills: number;
  lastKillAt: number | null;
};

export function createScore(): ScoreState {
  return { points: 0, multiplier: 1, bestMultiplier: 1, kills: 0, lastKillAt: null };
}

function comboAlive(state: ScoreState, now: number, rules: ScoringRules): boolean {
  return state.lastKillAt !== null && now - state.lastKillAt <= rules.comboWindowMs;
}

/** Kills inside the combo window raise the multiplier; the kill itself is scored at the new multiplier. */
export function registerKill(state: ScoreState, baseValue: number, now: number, rules: ScoringRules): ScoreState {
  const multiplier = comboAlive(state, now, rules) ? Math.min(rules.maxMultiplier, state.multiplier + rules.comboStep) : 1;
  return {
    points: state.points + Math.round(baseValue * multiplier),
    multiplier,
    bestMultiplier: Math.max(state.bestMultiplier, multiplier),
    kills: state.kills + 1,
    lastKillAt: now,
  };
}

export function currentMultiplier(state: ScoreState, now: number, rules: ScoringRules): number {
  return comboAlive(state, now, rules) ? state.multiplier : 1;
}

/** Fraction of the combo window left, for the HUD decay bar. */
export function comboRemaining(state: ScoreState, now: number, rules: ScoringRules): number {
  if (!comboAlive(state, now, rules) || state.lastKillAt === null) return 0;
  return 1 - (now - state.lastKillAt) / rules.comboWindowMs;
}

export function registerPlayerHit(state: ScoreState): ScoreState {
  return { ...state, multiplier: 1, lastKillAt: null };
}

export function waveBonus(wave: number, rules: ScoringRules): number {
  return rules.waveBonusPerWave * wave;
}

export function registerWaveClear(state: ScoreState, wave: number, rules: ScoringRules): ScoreState {
  return { ...state, points: state.points + waveBonus(wave, rules) };
}
