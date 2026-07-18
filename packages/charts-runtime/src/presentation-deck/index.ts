export { PresentationDeck, type PresentationDeckProps, type PresentationDeckSlide } from "../PresentationDeck";
export {
  PresentationDeckRuntime,
  type PresentationDeckRuntimeProps,
} from "../PresentationDeckRuntime";
export {
  buildDeckExportBundle,
  mergeDeckMeta,
  presentationDeckFromMeta,
  serializeDeckSidecar,
  attachDeckToPortableSpec,
  type DeckExportBundle,
  type DeckExportOptions,
} from "../presentationDeck/deckExport";
export { inferPresentationDeck, resolvePresentationDeck } from "../presentationDeck/infer";
export { buildDeckSlideContent } from "../presentationDeck/buildSlides";
export type {
  PresentationDeckSlideSection,
  PresentationDeckSlideSpec,
  PresentationDeckSpec,
} from "../presentationDeck/types";
