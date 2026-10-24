import { describe, expect, it } from "vitest";
import { beginCombat, clearWave, createRunFlow, endRun, nextWave } from "./runFlow";

describe("run flow", () => {
  it("cycles intro -> combat -> cleared -> next intro", () => {
    let flow = createRunFlow();
    flow = beginCombat(flow).flow;
    expect(flow.phase).toBe("combat");
    flow = clearWave(flow).flow;
    expect(flow.phase).toBe("cleared");
    flow = nextWave(flow).flow;
    expect(flow).toEqual({ phase: "intro", wave: 2 });
  });

  it("ignores out-of-order transitions so a wave cannot advance twice", () => {
    const combat = beginCombat(createRunFlow()).flow;
    expect(beginCombat(combat).changed).toBe(false);
    expect(nextWave(combat).changed).toBe(false);
    const cleared = clearWave(combat).flow;
    const next = nextWave(cleared).flow;
    expect(nextWave(next).changed).toBe(false);
    expect(next.wave).toBe(2);
  });

  it("freezes once the run is over", () => {
    const over = endRun(beginCombat(createRunFlow()).flow).flow;
    expect(endRun(over).changed).toBe(false);
    expect(clearWave(over).changed).toBe(false);
    expect(nextWave(over).changed).toBe(false);
    expect(beginCombat(over).changed).toBe(false);
  });
});
