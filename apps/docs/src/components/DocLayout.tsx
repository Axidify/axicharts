import { NavLink, Outlet } from "react-router-dom";
import type { ReactElement } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/start", label: "Getting started" },
  { to: "/verticals", label: "Verticals" },
  { to: "/spec", label: "Spec layer" },
  { to: "/runtime", label: "Runtime" },
  { to: "/runtime/schema", label: "Runtime schema" },
  { to: "/runtime/import", label: "Import gallery" },
  { to: "/runtime/links", label: "Deep links" },
  { to: "/plugins", label: "Plugins" },
  { to: "/packages", label: "Packages" },
] as const;

export function DocLayout(): ReactElement {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>AxiCharts</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>MIT · React dashboard charts</div>
        </div>
        <a
          href="https://github.com/Axidify/axicharts"
          style={{ fontSize: 12, color: "#2563eb" }}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0 }}>
        <nav
          style={{
            borderRight: "1px solid #e2e8f0",
            background: "#ffffff",
            padding: "20px 16px",
            minHeight: "calc(100vh - 65px)",
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              style={({ isActive }) => ({
                display: "block",
                padding: "8px 10px",
                marginBottom: 4,
                borderRadius: 6,
                fontSize: 13,
                textDecoration: "none",
                color: isActive ? "#0f172a" : "#475569",
                background: isActive ? "#e2e8f0" : "transparent",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main style={{ padding: "28px 32px", maxWidth: 960 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
