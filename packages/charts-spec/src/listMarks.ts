import {
  CARTESIAN_MARK_CATALOG,
  listCartesianMarks,
  type CartesianMarkCatalogEntry,
} from "./createCartesianPanel";
import {
  listDistributionMarks,
  type DistributionMarkCatalogEntry,
} from "./createDistributionPanel";
import { CARTESIAN_PANEL_SCHEMA_URL, DISTRIBUTION_PANEL_SCHEMA_URL } from "./schemaUrls";
import type { AgentChartFamily } from "./resolvePanelFamily";
import { UnsupportedPanelFamilyError } from "./createPanel";

export type MarkCatalogResult = {
  family: AgentChartFamily;
  schema: string;
  catalog: CartesianMarkCatalogEntry[] | DistributionMarkCatalogEntry[];
  closedSet: string[];
};

/**
 * List closed mark catalog for an agent-ready family (RFC-004 C180).
 */
export function listMarks(family: AgentChartFamily): MarkCatalogResult {
  switch (family) {
    case "cartesian": {
      const catalog = listCartesianMarks();
      return {
        family: "cartesian",
        schema: CARTESIAN_PANEL_SCHEMA_URL,
        catalog,
        closedSet: catalog.map((entry) => entry.mark),
      };
    }
    case "distribution": {
      const catalog = listDistributionMarks();
      return {
        family: "distribution",
        schema: DISTRIBUTION_PANEL_SCHEMA_URL,
        catalog,
        closedSet: catalog.map((entry) => entry.mark),
      };
    }
    case "matrix":
      throw new UnsupportedPanelFamilyError(family);
    default: {
      const exhaustive: never = family;
      throw new UnsupportedPanelFamilyError(exhaustive);
    }
  }
}

export { CARTESIAN_MARK_CATALOG };
