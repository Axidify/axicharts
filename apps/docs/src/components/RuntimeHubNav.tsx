import { NavLink } from "react-router-dom";
import type { ReactElement } from "react";

export const RUNTIME_HUB_LINKS = [
  { to: "/runtime", label: "Overview", end: true },
  { to: "/runtime/adapters", label: "Adapters" },
  { to: "/runtime/schema", label: "Schema" },
  { to: "/runtime/import", label: "Gallery" },
  { to: "/runtime/links", label: "Deep links" },
] as const;

/** In-page anchors on the runtime overview — surfaced in hub nav for quick jumps. */
export const RUNTIME_HUB_ANCHORS = [
  { to: "/runtime#share-import", label: "Share ↔ import" },
  { to: "/runtime#planner-http", label: "Planner HTTP" },
] as const;

export type RuntimeHubPage = (typeof RUNTIME_HUB_LINKS)[number]["to"];

const PAGE_TITLES: Record<RuntimeHubPage, string> = {
  "/runtime": "Overview",
  "/runtime/adapters": "Adapter cookbook",
  "/runtime/schema": "Schema & validation",
  "/runtime/import": "Import gallery",
  "/runtime/links": "Deep link index",
};

const tabStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  textDecoration: "none",
} as const;

export function RuntimeHubNav({
  page,
  showBreadcrumb = true,
}: {
  page: RuntimeHubPage;
  showBreadcrumb?: boolean;
}): ReactElement {
  return (
    <div style={{ marginBottom: 20 }}>
      {showBreadcrumb && page !== "/runtime" ? (
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b" }}>
          <NavLink to="/runtime" style={{ color: "#64748b", textDecoration: "none" }}>
            Runtime SDK
          </NavLink>
          {" / "}
          {PAGE_TITLES[page]}
        </p>
      ) : null}
      <nav
        aria-label="Runtime documentation"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {RUNTIME_HUB_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={"end" in link ? link.end : false}
            style={({ isActive }) => ({
              ...tabStyle,
              background: isActive ? "#dbeafe" : "#ffffff",
              borderColor: isActive ? "#93c5fd" : "#cbd5e1",
              color: isActive ? "#1e3a8a" : "#475569",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {link.label}
          </NavLink>
        ))}
        {RUNTIME_HUB_ANCHORS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={{
              ...tabStyle,
              background: "#f8fafc",
              borderStyle: "dashed",
              color: "#64748b",
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
