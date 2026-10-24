import { describe, expect, it } from "vitest";
import { SCORING } from "../content/balance";
import { comboRemaining, createScore, currentMultiplier, registerKill, registerPlayerHit, registerWaveClear } from "./scoring";

describe("scoring", () => {
  it("builds a combo inside the window and caps it", () => {
    let score = createScore();
    for (let i = 0; i < 20; i++) score = registerKill(score, 10, i * 100, SCORING);
    expect(score.multiplier).toBe(SCORING.maxMultiplier);
    expect(score.bestMultiplier).toBe(SCORING.maxMultiplier);
    expect(score.kills).toBe(20);
  });

  it("scores the kill at the raised multiplier", () => {
    let score = registerKill(createScore(), 10, 0, SCORING);
    expect(score.points).toBe(10);
    score = registerKill(score, 10, 500, SCORING);
    expect(score.points).toBe(25);
  });

  it("resets the combo after the window or a hit", () => {
    const score = registerKill(registerKill(createScore(), 10, 0, SCORING), 10, 100, SCORING);
    expect(currentMultiplier(score, 100 + SCORING.comboWindowMs + 1, SCORING)).toBe(1);
    expect(comboRemaining(score, 100 + SCORING.comboWindowMs + 1, SCORING)).toBe(0);
    expect(registerPlayerHit(score).multiplier).toBe(1);
    expect(registerKill(score, 10, 5000, SCORING).multiplier).toBe(1);
  });

  it("adds a wave bonus that grows with the wave", () => {
    expect(registerWaveClear(createScore(), 3, SCORING).points).toBe(300);
  });
});
