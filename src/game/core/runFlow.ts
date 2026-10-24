// Run lifecycle: intro (wave banner) -> combat -> cleared -> intro (next wave) ... -> over.
// Milestone 2 inserts a preparation phase between "cleared" and the next intro.
export type RunPhase = "intro" | "combat" | "cleared" | "over";

export type RunFlow = { phase: RunPhase; wave: number };

export type FlowStep = { flow: RunFlow; changed: boolean };

export function createRunFlow(): RunFlow {
  return { phase: "intro", wave: 1 };
}

const unchanged = (flow: RunFlow): FlowStep => ({ flow, changed: false });

export function beginCombat(flow: RunFlow): FlowStep {
  if (flow.phase !== "intro") return unchanged(flow);
  return { flow: { ...flow, phase: "combat" }, changed: true };
}

export function clearWave(flow: RunFlow): FlowStep {
  if (flow.phase !== "combat") return unchanged(flow);
  return { flow: { ...flow, phase: "cleared" }, changed: true };
}

export function nextWave(flow: RunFlow): FlowStep {
  if (flow.phase !== "cleared") return unchanged(flow);
  return { flow: { phase: "intro", wave: flow.wave + 1 }, changed: true };
}

export function endRun(flow: RunFlow): FlowStep {
  if (flow.phase === "over") return unchanged(flow);
  return { flow: { ...flow, phase: "over" }, changed: true };
}
