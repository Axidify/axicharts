import {
  createCartesianPanel,
  type CreateCartesianPanelInput,
  type CreateCartesianPanelResult,
} from "./createCartesianPanel";
import {
  createDistributionPanel,
  type CreateDistributionPanelInput,
  type CreateDistributionPanelResult,
} from "./createDistributionPanel";
import { CARTESIAN_PANEL_SCHEMA_URL, DISTRIBUTION_PANEL_SCHEMA_URL } from "./schemaUrls";
import type { AgentChartFamily } from "./resolvePanelFamily";
import type { PanelSpec } from "./types";

export class UnsupportedPanelFamilyError extends Error {
  readonly family: AgentChartFamily;

  constructor(family: AgentChartFamily) {
    super(
      family === "matrix"
        ? "Matrix family is not agent-ready yet (RFC-004 C186+)"
        : `Unsupported panel family "${family}"`,
    );
    this.name = "UnsupportedPanelFamilyError";
    this.family = family;
  }
}

export type CreatePanelInput =
  | (CreateCartesianPanelInput & { family: "cartesian" })
  | (CreateDistributionPanelInput & { family: "distribution" })
  | { family: "matrix"; intent: string };

export type CreatePanelResult = {
  family: AgentChartFamily;
  schema: string;
  panel: PanelSpec;
  needsReview: boolean;
  matchedRules: string[];
  reviewReason?: string | null;
};

export function createPanel(input: CreatePanelInput): CreatePanelResult {
  switch (input.family) {
    case "cartesian": {
      const { family: _family, ...cartesianInput } = input;
      const result: CreateCartesianPanelResult = createCartesianPanel(cartesianInput);
      return {
        family: "cartesian",
        schema: CARTESIAN_PANEL_SCHEMA_URL,
        panel: result.panel,
        needsReview: result.needsReview,
        matchedRules: result.matchedRules,
        reviewReason: result.reviewReason,
      };
    }
    case "distribution": {
      const { family: _family, ...distributionInput } = input;
      const result: CreateDistributionPanelResult = createDistributionPanel(distributionInput);
      return {
        family: "distribution",
        schema: DISTRIBUTION_PANEL_SCHEMA_URL,
        panel: result.panel,
        needsReview: result.needsReview,
        matchedRules: result.matchedRules,
        reviewReason: result.reviewReason,
      };
    }
    case "matrix":
      throw new UnsupportedPanelFamilyError("matrix");
  }
}
