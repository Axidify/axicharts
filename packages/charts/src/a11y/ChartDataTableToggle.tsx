"use client";

import type { ReactElement } from "react";

export type ChartDataTableToggleProps = {
  visible: boolean;
  onToggle: () => void;
  controlsId: string;
};

export function ChartDataTableToggle({
  visible,
  onToggle,
  controlsId,
}: ChartDataTableToggleProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 4,
      }}
    >
      <button
        type="button"
        aria-expanded={visible}
        aria-controls={controlsId}
        onClick={onToggle}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          background: "#fff",
          color: "#334155",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          cursor: "pointer",
        }}
      >
        {visible ? "Hide data table" : "View data table"}
      </button>
    </div>
  );
}
