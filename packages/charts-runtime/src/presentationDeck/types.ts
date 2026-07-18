export type PresentationDeckSlideSection =
  | "kpis"
  | "waterfall"
  | "revenue"
  | "trend"
  | "cell"
  | "full";

export type PresentationDeckSlideSpec = {
  id: string;
  title?: string;
  subtitle?: string;
  callout?: string;
  section?: PresentationDeckSlideSection;
  cellIndex?: number;
};

export type PresentationDeckSpec = {
  version?: 1;
  slides: PresentationDeckSlideSpec[];
  startIndex?: number;
};
