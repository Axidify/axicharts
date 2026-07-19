"use client";

import type { ReactElement } from "react";

export function FlatZeroSeriesCaption(): ReactElement {
  return (
    <div
      className="axicharts-flat-zero-caption"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: 11,
        fontWeight: 500,
        color: "#94a3b8",
        pointerEvents: "none",
        zIndex: 2,
        padding: "4px 10px",
        borderRadius: 6,
        background: "rgba(248, 250, 252, 0.85)",
        border: "1px dashed #cbd5e1",
      }}
    >
      All values are zero
    </div>
  );
}
