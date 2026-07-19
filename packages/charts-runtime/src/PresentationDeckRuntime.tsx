"use client";

import { useMemo, type ReactElement } from "react";
import { PresentationDeck } from "./PresentationDeck";
import { buildDeckSlideContent } from "./presentationDeck/buildSlides";
import { resolvePresentationDeck } from "./presentationDeck/infer";
import type { PresentationDeckSpec } from "./presentationDeck/types";
import type { AdapterFixtureHrefResolver, RuntimeDashboardSpec } from "./types";

export type PresentationDeckRuntimeProps = {
  spec: RuntimeDashboardSpec;
  deck?: PresentationDeckSpec | null;
  title?: string;
  initialIndex?: number;
  onExit?: () => void;
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
  adapterFixtureHref?: AdapterFixtureHrefResolver;
};

export function PresentationDeckRuntime({
  spec,
  deck,
  title,
  initialIndex,
  onExit,
}: PresentationDeckRuntimeProps): ReactElement {
  const resolvedDeck = useMemo(() => resolvePresentationDeck(spec, deck), [spec, deck]);

  const slides = useMemo(
    () =>
      resolvedDeck.slides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        callout: slide.callout,
        content: buildDeckSlideContent(spec, slide, { presentation: true }),
      })),
    [resolvedDeck.slides, spec],
  );

  const deckTitle =
    title ??
    (spec.layout === "mosaic"
      ? spec.wall.title
      : spec.layout === "panels"
        ? spec.panels.title
        : spec.dashboard.title) ??
    "Presentation deck";

  return (
    <PresentationDeck
      slides={slides}
      title={deckTitle}
      initialIndex={initialIndex ?? resolvedDeck.startIndex}
      onExit={onExit}
    />
  );
}
