import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  dashboarderImportDeepLink,
  formatValidatePresetCommand,
  HOSTED_IMPORT_PRESETS,
  listImportDeepLinks,
  runtimeSchemaShareMetaDeepLink,
  runtimeShareImportDeepLink,
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_REFERENCE_PRESET,
  SHARE_EXPORT_SCHEMA_URL,
} from "@axicharts/charts-runtime/validation";
import { ValidateCommandCopy } from "../components/ValidateCommandCopy";
import { RuntimeHubNav } from "../components/RuntimeHubNav";
import { SHARE_IMPORT_TRACK_RELEASE_NOTES } from "../demos/runtimeSchemaDemo";

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
      <RuntimeHubNav page="/runtime/links" />
      <h1 style={{ marginTop: 0 }}>Deep link index</h1>
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
                    {entry.preset.adapter ? (
                      <>
                        {" · "}
                        <code>{entry.preset.adapter}</code>
                      </>
                    ) : null}
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

      <section style={{ marginTop: 28 }} id="share-import">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Share ↔ import round-trip</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Dashboarder <strong>Share</strong> exports portable JSON with planner <code>meta</code>;{" "}
          <strong>Import</strong> validates and restores layout, feed, template, and mosaic preset.
          Embed SDK JSON omits <code>meta</code> — use share exports for builder round-trip. Full
          flow:{" "}
          <Link to="/runtime#share-import">runtime overview § share-import</Link>
          {" · "}
          <a href={runtimeShareImportDeepLink()}>hosted anchor</a>
          {" · "}
          <Link to="/runtime/import#planner-track">planner track notes</Link>.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Step</th>
              <th style={cellStyle}>Preset</th>
              <th style={cellStyle}>Gallery</th>
              <th style={cellStyle}>Dashboarder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>Share dashboard + meta</td>
              <td style={cellStyle}>
                <code>{SHARE_EXPORT_REFERENCE_PRESET.dashboard}</code>
              </td>
              <td style={cellStyle}>
                <Link to={`/runtime/import?preset=${SHARE_EXPORT_REFERENCE_PRESET.dashboard}`}>
                  import gallery
                </Link>
              </td>
              <td style={cellStyle}>
                <a href={dashboarderImportDeepLink(SHARE_EXPORT_REFERENCE_PRESET.dashboard)}>
                  auto-import
                </a>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Share workspace bundle</td>
              <td style={cellStyle}>
                <code>{SHARE_EXPORT_REFERENCE_PRESET.workspace}</code>
              </td>
              <td style={cellStyle}>
                <Link to={`/runtime/import?preset=${SHARE_EXPORT_REFERENCE_PRESET.workspace}`}>
                  import gallery
                </Link>
              </td>
              <td style={cellStyle}>
                <a href={dashboarderImportDeepLink(SHARE_EXPORT_REFERENCE_PRESET.workspace)}>
                  auto-import
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#64748b" }}>
          Storybook: <code>Dashboarder/Share ↔ Import</code> — ShareDialog meta export and
          ImportDialog restore previews.
          {" · "}
          <Link to="/runtime/schema#share-meta">schema § meta</Link>
          {" · "}
          <a href={runtimeSchemaShareMetaDeepLink()}>hosted schema anchor</a>
        </p>
      </section>

      <section
        id="share-import-track"
        style={{
          marginTop: 28,
          padding: 14,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          maxWidth: 720,
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Share/import track release notes (C44–C46)</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          The C44–C46 hardening track closes the planner meta round-trip: Share exports{" "}
          <code>meta</code>, Import restores it, schema documents fields, and Dashboarder dialogs
          link to hosted docs. Started from C42 overview docs and C43 Storybook fixtures.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
          {SHARE_IMPORT_TRACK_RELEASE_NOTES.map((item) => (
            <li key={item.slice}>
              <strong>{item.slice}</strong> — {item.summary}
            </li>
          ))}
        </ul>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#64748b" }}>
          Planner track (C33–C43):{" "}
          <Link to="/runtime/import#planner-track">import gallery release notes</Link>
          {" · "}
          <a href={runtimeShareImportDeepLink()}>share ↔ import overview</a>
        </p>
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
          <li>
            Historian adapter →{" "}
            <Link to={`/runtime/import?preset=ops-historian`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-historian")?.label}
            </Link>
          </li>
          <li>
            REST adapter →{" "}
            <Link to={`/runtime/import?preset=ops-rest`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-rest")?.label}
            </Link>
          </li>
          <li>
            MQTT adapter →{" "}
            <Link to={`/runtime/import?preset=ops-mqtt`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-mqtt")?.label}
            </Link>
          </li>
          <li>
            WebSocket adapter →{" "}
            <Link to={`/runtime/import?preset=ops-websocket`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-websocket")?.label}
            </Link>
          </li>
          <li>
            Mock-live adapter →{" "}
            <Link to={`/runtime/import?preset=ops-mock-live`}>
              {HOSTED_IMPORT_PRESETS.find((item) => item.id === "ops-mock-live")?.label}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
