import type { ReactElement } from "react";
import {
  PLANNER_FEED_ROWS,
  feedAdapterGalleryDeepLink,
  plannerFeedGalleryIndexDeepLink,
} from "@axicharts/charts-runtime/validation";
import type { FeedMode, LayoutMode } from "./runtime/buildRuntimeSpec";

const panelStyle = {
  position: "absolute" as const,
  top: "100%",
  right: 0,
  marginTop: 6,
  width: "min(420px, 92vw)",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  boxShadow: "0 12px 32px rgba(2, 6, 23, 0.45)",
  zIndex: 30,
};

const rowButtonStyle = {
  display: "block",
  width: "100%",
  textAlign: "left" as const,
  padding: "8px 10px",
  marginBottom: 4,
  borderRadius: 6,
  border: "1px solid transparent",
  background: "transparent",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: 1.5,
};

export type FeedIntentGlossaryProps = {
  feed: FeedMode;
  layout: LayoutMode;
  onSelectFeed: (feed: FeedMode) => void;
};

export function FeedIntentGlossary({
  feed,
  layout,
  onSelectFeed,
}: FeedIntentGlossaryProps): ReactElement {
  return (
    <details style={{ position: "relative", fontSize: 11 }}>
      <summary
        style={{
          cursor: "pointer",
          color: "#93c5fd",
          listStyle: "none",
        }}
      >
        Glossary
      </summary>
      <div style={panelStyle}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
          Planner feed intents
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
          Sample intents from <code>@axicharts/charts-planner</code> — click a row to switch the
          builder feed.
        </p>
        {PLANNER_FEED_ROWS.map((row) => {
          const active = row.feed === feed;
          return (
            <button
              key={row.feed}
              type="button"
              onClick={() => onSelectFeed(row.feed as FeedMode)}
              style={{
                ...rowButtonStyle,
                borderColor: active ? "#475569" : "transparent",
                background: active ? "#1e293b" : "transparent",
              }}
            >
              <div>
                <code>{row.feed}</code>
                {active ? <span style={{ color: "#4ade80", marginLeft: 8 }}>active</span> : null}
              </div>
              <div style={{ color: "#94a3b8", marginTop: 4 }}>{row.intentSample}</div>
              <div style={{ marginTop: 4 }}>
                <a
                  href={feedAdapterGalleryDeepLink(row.feed, layout)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#93c5fd" }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {row.presetId}
                </a>
              </div>
            </button>
          );
        })}
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "#64748b" }}>
          <a
            href={plannerFeedGalleryIndexDeepLink()}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#93c5fd" }}
          >
            Docs planner feed index
          </a>
        </p>
      </div>
    </details>
  );
}
