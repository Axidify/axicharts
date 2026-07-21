import {
  runCompositionSimulations,
  summarizeSimulations,
  type SimulationResult,
} from "./compositionSimulation";
import { runDistributionSimulations } from "./distributionSimulation";
import { runMatrixSimulations } from "./matrixSimulation";

export type AgentSimulationFamily = "cartesian" | "distribution" | "matrix";

export type AgentSimulationSummary = {
  family: AgentSimulationFamily;
  scenarios: number;
  works: number;
  throws: number;
  silent_bad: number;
  ignored: number;
  testCommand: string;
};

function toSummary(
  family: AgentSimulationFamily,
  results: SimulationResult[],
  testCommand: string,
): AgentSimulationSummary {
  const counts = summarizeSimulations(results);
  return {
    family,
    scenarios: results.length,
    works: counts.works,
    throws: counts.throws,
    silent_bad: counts.silent_bad,
    ignored: counts.ignored,
    testCommand,
  };
}

/** Live composition simulation counts for integrator docs (Track C4). */
export function getAgentSimulationSummaries(): AgentSimulationSummary[] {
  return [
    toSummary(
      "cartesian",
      runCompositionSimulations(),
      "pnpm --filter @axicharts/charts-spec test compositionSimulation",
    ),
    toSummary(
      "distribution",
      runDistributionSimulations(),
      "pnpm --filter @axicharts/charts-spec test distributionSimulation",
    ),
    toSummary(
      "matrix",
      runMatrixSimulations(),
      "pnpm --filter @axicharts/charts-spec test matrixSimulation",
    ),
  ];
}
