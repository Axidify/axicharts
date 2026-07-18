import { serializeRuntimeSpec } from "../runtimeSpec";
import { buildEmbedBundle, type EmbedBundle, type EmbedSnippetOptions } from "../embedSnippet";
import { inferPresentationDeck } from "./infer";
import type { PresentationDeckSpec } from "./types";
import type { RuntimeDashboardSpec } from "../types";
import type { SavedDashboard } from "../workspace/types";

export type DeckExportBundle = EmbedBundle & {
  deckJson: string;
  deck: PresentationDeckSpec;
};

export type DeckExportOptions = EmbedSnippetOptions & {
  deck?: PresentationDeckSpec | null;
  inferDeck?: boolean;
};

export function buildDeckExportBundle(
  spec: RuntimeDashboardSpec,
  options: DeckExportOptions = {},
): DeckExportBundle {
  const deck =
    options.deck ??
    (options.inferDeck === false ? { version: 1 as const, slides: [] } : inferPresentationDeck(spec));
  const embed = buildEmbedBundle(spec, options);

  return {
    ...embed,
    deck,
    deckJson: JSON.stringify(deck, null, 2),
  };
}

export function presentationDeckFromMeta(
  meta?: SavedDashboard["meta"],
): PresentationDeckSpec | undefined {
  return meta?.presentationDeck;
}

export function mergeDeckMeta(
  meta: SavedDashboard["meta"] | undefined,
  deck: PresentationDeckSpec,
): NonNullable<SavedDashboard["meta"]> {
  return {
    layout: meta?.layout ?? "embed",
    feed: meta?.feed ?? "static",
    ...meta,
    presentation: true,
    presentationDeck: deck,
  };
}

export function serializeDeckSidecar(deck: PresentationDeckSpec, pretty = true): string {
  return JSON.stringify(deck, null, pretty ? 2 : undefined);
}

export function attachDeckToPortableSpec(
  spec: RuntimeDashboardSpec,
  deck: PresentationDeckSpec,
): { specJson: string; deckJson: string } {
  return {
    specJson: serializeRuntimeSpec(spec, true, { schema: true }),
    deckJson: serializeDeckSidecar(deck),
  };
}
