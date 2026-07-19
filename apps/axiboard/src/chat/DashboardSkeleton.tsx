import type { ReactElement } from "react";

function SendIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DashboardSkeleton(): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }} aria-busy="true" aria-label="Building dashboard">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="axi-skeleton-block" style={{ flex: "1 1 140px", height: 72, minWidth: 120 }} />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="axi-skeleton-block" style={{ height: 220 }} />
        ))}
      </div>
    </div>
  );
}

export { SendIcon };
