"use client";

import { useEffect, useRef, useState } from "react";
import { createGameBus, type StatusEvent } from "@/game/bridge/events";

function describe(status: StatusEvent | null): string {
  if (!status || status.phase === "menu") return "Main menu.";
  if (status.phase === "over") return `Game over. Wave ${status.wave}. Score ${status.score}.`;
  return `Wave ${status.wave}. Score ${status.score}. Hull ${status.hp} of ${status.maxHp}.`;
}

export default function GameShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<StatusEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const bus = createGameBus();
    const offStatus = bus.on("status", setStatus);
    let game: { destroy(removeCanvas: boolean): void } | null = null;
    let cancelled = false;

    // Phaser touches `window` at import time, so it is loaded only in the browser.
    import("@/game/phaser/createGame")
      .then(({ createGame }) => {
        if (!cancelled) game = createGame(parent, bus);
      })
      .catch((error: unknown) => {
        console.error("Failed to load the game", error);
        setLoadError("The game failed to load. Reload the page to try again.");
      });

    // React StrictMode mounts twice in development; destroying here keeps exactly one canvas.
    return () => {
      cancelled = true;
      offStatus();
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
      <p className="sr-only" aria-live="polite" data-testid="game-status">
        {describe(status)}
      </p>
    </>
  );
}
