import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { docColors, docRadii } from "../styles/docTokens";

const tabs = [
  { to: "/compare/design", label: "Design parity" },
  { to: "/compare", label: "Live performance", end: true },
] as const;

export function CompareNav(): ReactElement {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={"end" in tab ? tab.end : false}
          style={({ isActive }) => ({
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: docRadii.md,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            color: isActive ? docColors.accent : docColors.muted,
            background: isActive ? docColors.accentSoft : docColors.surface,
            border: `1px solid ${isActive ? "#bfdbfe" : docColors.border}`,
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
