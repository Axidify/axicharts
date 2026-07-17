"use client";

import type { ReactElement } from "react";
import { ConnectionBadge } from "./ConnectionBadge";
import type { ConnectionState } from "./types";

export type AdapterHealthItem = {
  id: string;
  label: string;
  connection: ConnectionState;
};

export type AdapterHealthStripProps = {
  items: AdapterHealthItem[];
};

export function AdapterHealthStrip({ items }: AdapterHealthStripProps): ReactElement {
  return (
    <div
      className="axicharts-adapter-health"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
      }}
    >
      {items.map((item) => (
        <span
          key={item.id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#64748b",
          }}
        >
          <ConnectionBadge connection={item.connection} compact />
          {item.label}
        </span>
      ))}
    </div>
  );
}
