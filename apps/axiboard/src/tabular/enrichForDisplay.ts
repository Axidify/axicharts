import {
  enrichAttendance,
  enrichLedger,
  enrichSales,
  parseTabular,
  type TabularVerticalId,
} from "@axicharts/charts-spec";
import { formatHours, formatRm, type TabularEnrichment } from "@axicharts/charts-spec/planning";

export function enrichForDisplay(
  rawText: string,
  vertical: TabularVerticalId,
): TabularEnrichment | null {
  const rows = parseTabular(rawText);
  if (rows.length === 0) return null;

  switch (vertical) {
    case "ledger":
      return enrichLedger(rows);
    case "sales":
      return enrichSales(rows);
    case "attendance":
      return enrichAttendance(rows);
    default:
      return null;
  }
}

export function formatDisplaySummary(enrichment: TabularEnrichment): string {
  switch (enrichment.vertical) {
    case "ledger":
      return `${enrichment.kpis.transactionCount} transactions · net flow ${formatRm(enrichment.kpis.netFlow)}`;
    case "sales":
      return `${enrichment.kpis.opportunityCount} opportunities · pipeline ${formatRm(enrichment.kpis.totalPipeline)} · weighted ${formatRm(enrichment.kpis.weightedForecast)}`;
    case "attendance":
      return `${enrichment.kpis.headcount} employees · total hours ${formatHours(enrichment.kpis.totalHours)}`;
    default:
      return "";
  }
}
