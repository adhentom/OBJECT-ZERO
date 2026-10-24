import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Phaser touches `window` at import time, so it must never load in server-rendered modules.
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const staticImports = (source: string) => source.match(/^import[^;]*;/gm) ?? [];

describe("client-only Phaser boundary", () => {
  it.each(["src/app/page.tsx", "src/app/layout.tsx"])("%s does not import Phaser or the game", (path) => {
    const source = read(path);
    expect(source).not.toMatch(/phaser/i);
    expect(source).not.toMatch(/createGame/);
  });

  it("GameShell is a client component that loads the game only through a dynamic import in an effect", () => {
    const source = read("src/ui/GameShell.tsx");
    expect(source.trimStart().startsWith('"use client";')).toBe(true);
    for (const line of staticImports(source)) {
      expect(line).not.toMatch(/phaser/i);
      expect(line).not.toMatch(/createGame/);
    }
    const effectAt = source.indexOf("useEffect(() =>");
    const dynamicImportAt = source.indexOf('import("@/game/phaser/createGame")');
    expect(effectAt).toBeGreaterThan(-1);
    expect(dynamicImportAt).toBeGreaterThan(effectAt);
  });
});
