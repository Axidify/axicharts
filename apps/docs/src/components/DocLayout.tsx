import { NavLink, Outlet } from "react-router-dom";
import type { ReactElement } from "react";
import { docColors, docRadii, docShadow } from "../styles/docTokens";

const topLinks = [
  { to: "/", label: "Home" },
  { to: "/start", label: "Getting started" },
  { to: "/compare", label: "vs Recharts" },
  { to: "/shadcn", label: "shadcn gallery" },
  { to: "/verticals", label: "Verticals" },
  { to: "/spec", label: "Spec layer" },
] as const;

const runtimeLinks = [
  { to: "/runtime", label: "Overview", end: true },
  { to: "/runtime/adapters", label: "Adapter cookbook" },
  { to: "/runtime/schema", label: "Runtime schema" },
  { to: "/runtime/import", label: "Import gallery" },
  { to: "/runtime/links", label: "Deep links" },
] as const;

const bottomLinks = [
  { to: "/plugins", label: "Plugins" },
  { to: "/packages", label: "Packages" },
] as const;

function NavItem({
  to,
  label,
  end,
}: {
  to: string;
  label: string;
  end?: boolean;
}): ReactElement {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: "block",
        padding: "8px 10px",
        marginBottom: 4,
        borderRadius: docRadii.sm,
        fontSize: 13,
        textDecoration: "none",
        color: isActive ? docColors.text : docColors.muted,
        background: isActive ? "#e2e8f0" : "transparent",
        fontWeight: isActive ? 600 : 400,
        borderLeft: isActive ? `2px solid ${docColors.accent}` : "2px solid transparent",
        paddingLeft: 8,
      })}
    >
      {label}
    </NavLink>
  );
}

export function DocLayout(): ReactElement {
  return (
    <div style={{ minHeight: "100vh", background: docColors.bg, color: docColors.text }}>
      <header
        style={{
          borderBottom: `1px solid ${docColors.border}`,
          background: docColors.surface,
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: docShadow.header,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            AxiCharts
          </div>
          <div style={{ fontSize: 12, color: docColors.subtle }}>
            MIT · React dashboard charts
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#15803d",
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: docRadii.pill,
              padding: "3px 8px",
            }}
          >
            G–Q 5/5
          </span>
          <a
            href="https://github.com/Axidify/axicharts"
            style={{ fontSize: 12, color: docColors.accent, fontWeight: 500 }}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0 }}>
        <nav
          style={{
            borderRight: `1px solid ${docColors.border}`,
            background: docColors.surface,
            padding: "20px 16px",
            minHeight: "calc(100vh - 65px)",
          }}
        >
          {topLinks.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} end={link.to === "/"} />
          ))}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              marginTop: 16,
              marginBottom: 6,
              paddingLeft: 10,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Runtime
          </div>
          {runtimeLinks.map((link) => (
            <NavItem
              key={link.to}
              to={link.to}
              label={link.label}
              end={"end" in link ? link.end : false}
            />
          ))}
          <div style={{ marginTop: 16 }}>
            {bottomLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ))}
          </div>
        </nav>
        <main style={{ padding: "28px 32px", maxWidth: 960 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
