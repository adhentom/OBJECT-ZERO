const BEST_SCORE_KEY = "object-zero:best-score";

// localStorage can throw (privacy mode, disabled storage); a missing best score must not break the game.
export function loadBestScore(): number {
  try {
    const value = Number(window.localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(score)));
  } catch (error) {
    console.warn("Could not save best score", error);
  }
}
