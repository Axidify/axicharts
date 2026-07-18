import { describe, expect, it } from "vitest";
import { buildDeckExportBundle } from "./deckExport";

const spec = {
  layout: "embed" as const,
  dashboard: {
    template: "finance-pnl" as const,
    title: "Board deck",
  },
};

describe("deck export bundle", () => {
  it("includes inferred deck metadata in export bundle", () => {
    const bundle = buildDeckExportBundle(spec, { presentation: true });
    expect(bundle.deck.slides.length).toBeGreaterThan(1);
    expect(bundle.deckJson).toContain("kpis");
    expect(bundle.inlineReactSnippet).toContain("presentation");
    expect(bundle.specJson).toContain("finance-pnl");
  });

  it("serializes explicit deck overrides", () => {
    const deck = {
      version: 1 as const,
      slides: [{ id: "intro", title: "Intro", section: "full" as const }],
    };
    const bundle = buildDeckExportBundle(spec, { deck });
    expect(bundle.deck.slides).toHaveLength(1);
    expect(JSON.parse(bundle.deckJson).slides[0].title).toBe("Intro");
  });
});
