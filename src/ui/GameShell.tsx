"use client";

import { useEffect, useRef, useState } from "react";

export default function GameShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let game: { destroy(removeCanvas: boolean): void } | null = null;
    let cancelled = false;

    // Phaser touches `window` at import time, so it is loaded only in the browser.
    import("@/game/phaser/createGame")
      .then(({ createGame }) => {
        if (!cancelled) game = createGame(parent);
      })
      .catch((error: unknown) => {
        console.error("Failed to load the game", error);
        setLoadError("The game failed to load. Reload the page to try again.");
      });

    // React StrictMode mounts twice in development; destroying here keeps exactly one canvas.
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="game-container" data-testid="game-container" />
      {loadError && (
        <p className="load-error" role="alert">
          {loadError}
        </p>
      )}
    </>
  );
}
