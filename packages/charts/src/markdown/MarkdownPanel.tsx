import type { CSSProperties, ReactElement } from "react";
import type { StatSurface } from "../stat/Stat";
import { markdownSurfaceStyles, parseMarkdownBlocks } from "./parseMarkdown";

export type MarkdownPanelProps = {
  /** Markdown source — primary prop. */
  content?: string;
  /** Alias for `content` (spec / legacy). */
  markdown?: string;
  surface?: StatSurface;
  title?: string;
  style?: CSSProperties;
};

export function MarkdownPanel({
  content,
  markdown,
  surface = "dark",
  title,
  style,
}: MarkdownPanelProps): ReactElement {
  const source = (content ?? markdown ?? "").trim();
  const muted = surface === "dark" ? "#94a3b8" : "#64748b";

  return (
    <article
      style={{
        display: "grid",
        gap: 4,
        fontSize: 13,
        ...markdownSurfaceStyles(surface),
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: muted,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
      ) : null}
      {source ? (
        <div>{parseMarkdownBlocks(source, surface)}</div>
      ) : (
        <p style={{ margin: 0, color: muted, fontStyle: "italic" }}>No content</p>
      )}
    </article>
  );
}
