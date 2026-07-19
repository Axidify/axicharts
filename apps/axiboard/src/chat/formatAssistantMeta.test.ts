import { describe, expect, it } from "vitest";
import { formatAssistantMeta } from "./formatAssistantMeta";
import { summarizeTabular } from "./summarizeTabular";

describe("chat UX helpers", () => {
  it("summarizes tabular attachments for bubble cards", () => {
    const preview = summarizeTabular(`| SKU | Stock |
| A | 1 |
| B | 2 |`);
    expect(preview.rowCount).toBe(2);
    expect(preview.columnCount).toBe(2);
    expect(preview.columns).toEqual(["SKU", "Stock"]);
  });

  it("formats assistant meta without internal layer ids", () => {
    const meta = formatAssistantMeta({
      assistantMessage: "Planned 2 charts and 2 KPIs.",
      followUpIntents: [],
      llm: { used: false },
      summary: { kpiCount: 2, chartCount: 2, needsReview: false },
    } as never);
    expect(meta).toBe("2 metrics · 2 charts · auto-planned");
    expect(meta).not.toContain("l4b");
  });
});
