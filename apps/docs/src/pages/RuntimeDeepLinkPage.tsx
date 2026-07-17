import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  formatValidatePresetCommand,
  HOSTED_IMPORT_PRESETS,
  listImportDeepLinks,
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
} from "@axicharts/charts-runtime/validation";
import { ValidateCommandCopy } from "../components/ValidateCommandCopy";

const base = import.meta.env.BASE_URL;

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 13,
};

const cellStyle = {
  borderBottom: "1px solid #e2e8f0",
  padding: "10px 12px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
};

export function RuntimeDeepLinkPage(): ReactElement {
  const deepLinks = listImportDeepLinks(base);

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Deep link index
      </p>
      <h1 style={{ marginTop: 8 }}>Deep link index</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Canonical URLs for schemas, shipped import presets, docs gallery routes, and Dashboarder
        auto-import query params. Use these in README snippets, issue templates, and CI fixtures.
        Every preset CLI command is copyable — same shortcuts as{" "}
        <Link to="/runtime/schema">schema validation</Link> and{" "}
        <Link to="/runtime/import">import gallery</Link>.
      </p>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>JSON Schema</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Resource</th>
              <th style={cellStyle}>URL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>Runtime spec</td>
              <td style={cellStyle}>
                <a href={RUNTIME_SPEC_SCHEMA_URL}>{RUNTIME_SPEC_SCHEMA_URL}</a>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Share export</td>
              <td style={cellStyle}>
                <a href={SHARE_EXPORT_SCHEMA_URL}>{SHARE_EXPORT_SCHEMA_URL}</a>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Docs mirror (runtime)</td>
              <td style={cellStyle}>
                <a href={`${base}schema/runtime-spec.schema.json`}>
                  {`${base}schema/runtime-spec.schema.json`}
                </a>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Docs mirror (share)</td>
              <td style={cellStyle}>
                <a href={`${base}schema/share-export.schema.json`}>
                  {`${base}schema/share-export.schema.json`}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Import presets</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Preset</th>
              <th style={cellStyle}>Gallery</th>
              <th style={cellStyle}>Dashboarder</th>
              <th style={cellStyle}>CLI</th>
              <th style={cellStyle}>Fixture</th>
            </tr>
          </thead>
          <tbody>
            {deepLinks.map((entry) => (
              <tr key={entry.preset.id}>
                <td style={cellStyle}>
                  <strong>{entry.preset.label}</strong>
                  <div style={{ color: "#64748b", marginTop: 4 }}>
                    <code>{entry.preset.id}</code> · {entry.preset.kind}
                  </div>
                </td>
                <td style={cellStyle}>
                  <Link to={entry.galleryPath}>{entry.galleryPath}</Link>
                </td>
                <td style={cellStyle}>
                  <a href={entry.dashboarderUrl}>{entry.dashboarderUrl}</a>
                </td>
                <td style={cellStyle}>
                  <ValidateCommandCopy
                    compact
                    command={formatValidatePresetCommand(entry.preset.id)}
                  />
                </td>
                <td style={cellStyle}>
                  <a href={entry.localMirrorPath} style={{ display: "block" }}>
                    Docs mirror
                  </a>
                  <a href={entry.hostedUrl} style={{ display: "block", marginTop: 4 }}>
                    GitHub Pages
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Share export references</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Dashboarder Share export maps each tab to a shipped preset for comparison and import
          testing.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.8 }}>
          <li>
            Dashboard tab →{" "}
            <Link to={`/runtime/import?preset=ops-dashboard`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-dashboard")?.label}
            </Link>
          </li>
          <li>
            Workspace tab →{" "}
            <Link to={`/runtime/import?preset=ops-workspace`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-workspace")?.label}
            </Link>
          </li>
          <li>
            Embed layout →{" "}
            <Link to={`/runtime/import?preset=ops-embed`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-embed")?.label}
            </Link>
          </li>
          <li>
            Mosaic layout →{" "}
            <Link to={`/runtime/import?preset=ops-mosaic`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-mosaic")?.label}
            </Link>
          </li>
        </ul>
      </section>

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime/import" style={{ color: "#2563eb" }}>
          Import gallery
        </Link>
        {" · "}
        <Link to="/runtime/schema" style={{ color: "#2563eb" }}>
          Runtime schema
        </Link>
      </p>
    </div>
  );
}
