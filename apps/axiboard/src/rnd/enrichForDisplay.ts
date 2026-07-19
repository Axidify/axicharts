import type { TabularVerticalId } from "@axicharts/charts-spec";
import { enrichAttendance, formatHours } from "./attendanceEnrich";
import { enrichLedger, formatRm } from "./ledgerEnrich";
import { enrichPipeline } from "./pipelineEnrich";
import { parseTabular } from "./parseTabular";

export type TabularDisplayEnrichment =
  | { vertical: "ledger"; enrichment: ReturnType<typeof enrichLedger> }
  | { vertical: "sales"; enrichment: ReturnType<typeof enrichPipeline> }
  | { vertical: "attendance"; enrichment: ReturnType<typeof enrichAttendance> };

export function enrichForDisplay(
  rawText: string,
  vertical: TabularVerticalId,
): TabularDisplayEnrichment | null {
  const rows = parseTabular(rawText);
  if (rows.length === 0) return null;

  switch (vertical) {
    case "ledger":
      return { vertical: "ledger", enrichment: enrichLedger(rows) };
    case "sales":
      return { vertical: "sales", enrichment: enrichPipeline(rows) };
    case "attendance":
      return { vertical: "attendance", enrichment: enrichAttendance(rows) };
    default:
      return null;
  }
}

export function formatDisplaySummary(display: TabularDisplayEnrichment): string {
  switch (display.vertical) {
    case "ledger":
      return `${display.enrichment.kpis.transactionCount} transactions · net flow ${formatRm(display.enrichment.kpis.netFlow)}`;
    case "sales":
      return `${display.enrichment.kpis.opportunityCount} opportunities · pipeline ${formatRm(display.enrichment.kpis.totalPipeline)} · weighted ${formatRm(display.enrichment.kpis.weightedForecast)}`;
    case "attendance":
      return `${display.enrichment.kpis.headcount} employees · total hours ${formatHours(display.enrichment.kpis.totalHours)}`;
    default:
      return "";
  }
}
