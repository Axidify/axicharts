import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ADAPTER_OVERVIEW,
  BUILD_HISTORIAN_URL,
  CUSTOM_MAP_RESPONSE,
  HISTORIAN_FIELD_ROWS,
  HISTORIAN_SPEC,
  HISTORIAN_TAG_PAYLOAD,
  MQTT_FIELD_ROWS,
  MQTT_PORTABLE_SPEC,
  MQTT_SPEC,
  MQTT_SPARKPLUG_PAYLOAD,
  REST_EMBED_SPEC,
  REST_FIELD_ROWS,
  REST_OPS_PAYLOAD,
  WEBSOCKET_FIELD_ROWS,
  WEBSOCKET_MOSAIC_SPEC,
  WEBSOCKET_PARSE_MESSAGE,
  WEBSOCKET_TELEMETRY_FRAME,
  type AdapterFieldRow,
} from "../demos/runtimeAdapterDemo";
import { ADAPTER_FIXTURE_PRESETS } from "@axicharts/charts-runtime/validation";

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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      style={{
        marginTop: 28,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <strong>{title}</strong>
        {subtitle ? (
          <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>{subtitle}</span>
        ) : null}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function CodeBlock({ children, dark = false }: { children: string; dark?: boolean }): ReactElement {
  return (
    <pre
      style={{
        margin: 0,
        padding: 14,
        background: dark ? "#0f172a" : "#f8fafc",
        color: dark ? "#e2e8f0" : "#0f172a",
        fontSize: 11,
        lineHeight: 1.5,
        overflow: "auto",
        borderRadius: 8,
      }}
    >
      {children}
    </pre>
  );
}

function FieldTable({ rows }: { rows: AdapterFieldRow[] }): ReactElement {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={cellStyle}>Field</th>
          <th style={cellStyle}>Type</th>
          <th style={cellStyle}>Required</th>
          <th style={cellStyle}>Default</th>
          <th style={cellStyle}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.field}>
            <td style={cellStyle}>
              <code>{row.field}</code>
            </td>
            <td style={cellStyle}>
              <code>{row.type}</code>
            </td>
            <td style={cellStyle}>{row.required ? "yes" : "no"}</td>
            <td style={cellStyle}>{row.defaultValue ? <code>{row.defaultValue}</code> : "—"}</td>
            <td style={{ ...cellStyle, color: "#475569" }}>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RuntimeAdaptersPage(): ReactElement {
  return (
    <div>
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Adapter cookbook
      </p>
      <h1 style={{ marginTop: 8 }}>Adapter cookbook</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Runtime dashboards bind live data through <code>dataSource</code> (embed) or{" "}
        <code>dataSources</code> + <code>dataSourceId</code> (mosaic). Each adapter exposes a small
        JSON surface in the portable runtime spec — validated by{" "}
        <Link to="/runtime/schema">JSON Schema + semantic gates</Link>.
      </p>

      <Section title="Adapter overview" subtitle="connectSource registry">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>Use case</th>
              <th style={cellStyle}>Key fields</th>
            </tr>
          </thead>
          <tbody>
            {ADAPTER_OVERVIEW.map((row) => (
              <tr key={row.type}>
                <td style={cellStyle}>
                  <code>{row.type}</code>
                </td>
                <td style={{ ...cellStyle, color: "#475569" }}>{row.useCase}</td>
                <td style={{ ...cellStyle, color: "#64748b", fontSize: 12 }}>{row.fields}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="REST adapter" subtitle="poll · mapResponse · alarms">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Polls <code>url</code> on <code>intervalMs</code>. Responses must be JSON objects. Template
          data lives at the top level; optional <code>alarms</code> arrays merge automatically via{" "}
          <code>mergeAdapterExtras</code>.
        </p>
        <FieldTable rows={REST_FIELD_ROWS} />
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Example payload</strong> (ops-2x2)
        </p>
        <CodeBlock dark>{REST_OPS_PAYLOAD}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Runtime spec</strong>
        </p>
        <CodeBlock>{REST_EMBED_SPEC}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Custom mapResponse</strong>
        </p>
        <CodeBlock>{CUSTOM_MAP_RESPONSE}</CodeBlock>
      </Section>

      <Section title="WebSocket adapter" subtitle="push · merge frames · reconnect">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Opens a persistent socket and merges each JSON frame into the running data object. Malformed
          frames are ignored. Set <code>reconnectDelayMs</code> for automatic reconnect after close.
        </p>
        <FieldTable rows={WEBSOCKET_FIELD_ROWS} />
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Example frame</strong>
        </p>
        <CodeBlock dark>{WEBSOCKET_TELEMETRY_FRAME}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Mosaic spec</strong>
        </p>
        <CodeBlock>{WEBSOCKET_MOSAIC_SPEC}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Tag-per-frame parseMessage</strong>
        </p>
        <CodeBlock>{WEBSOCKET_PARSE_MESSAGE}</CodeBlock>
      </Section>

      <Section title="Historian adapter" subtitle="rolling tag window">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          REST poller that appends <code>from</code>, <code>to</code>, and <code>tags</code> query
          params via <code>buildHistorianUrl</code>. <code>defaultHistorianMapper</code> normalizes
          tag arrays into <code>cells</code> or <code>series</code> for line-overview and ops
          templates.
        </p>
        <FieldTable rows={HISTORIAN_FIELD_ROWS} />
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Example historian response</strong>
        </p>
        <CodeBlock dark>{HISTORIAN_TAG_PAYLOAD}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Runtime spec</strong>
        </p>
        <CodeBlock>{HISTORIAN_SPEC}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>buildHistorianUrl</strong>
        </p>
        <CodeBlock>{BUILD_HISTORIAN_URL}</CodeBlock>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Shipped fixture:{" "}
          <Link to={`/runtime/import?preset=${ADAPTER_FIXTURE_PRESETS.historian}`}>
            ops-historian.runtime.json
          </Link>
        </p>
      </Section>

      <Section title="MQTT adapter" subtitle="inject connect factory">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Browser bundles do not ship an MQTT client — provide <code>connect</code> (e.g. mqtt.js) and
          optional <code>parsePayload</code>. Subscribes to <code>topic</code> on connect. Portable
          JSON fixtures omit <code>connect</code>; inject it when mounting{" "}
          <code>RuntimeDashboard</code>.
        </p>
        <FieldTable rows={MQTT_FIELD_ROWS} />
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Portable JSON fixture</strong>
        </p>
        <CodeBlock>{MQTT_PORTABLE_SPEC}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Example Sparkplug payload</strong>
        </p>
        <CodeBlock dark>{MQTT_SPARKPLUG_PAYLOAD}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>RuntimeDashboard wiring</strong>
        </p>
        <CodeBlock>{MQTT_SPEC}</CodeBlock>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Shipped fixture:{" "}
          <Link to={`/runtime/import?preset=${ADAPTER_FIXTURE_PRESETS.mqtt}`}>
            ops-mqtt.runtime.json
          </Link>
        </p>
      </Section>

      <Section title="Static & mock-live" subtitle="fixtures · synthetic drift">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          <code>static</code> embeds fixture data inline for Storybook and offline demos.{" "}
          <code>mock-live</code> clones <code>data</code> and optionally applies <code>mutate</code> on
          each tick for dev panels without a backend.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          See shipped fixtures in the{" "}
          <Link to="/runtime/import">import gallery</Link> and live embed on the{" "}
          <Link to="/runtime">runtime SDK page</Link>.
        </p>
      </Section>

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime" style={{ color: "#2563eb" }}>
          Runtime SDK
        </Link>
        {" · "}
        <Link to="/runtime/schema" style={{ color: "#2563eb" }}>
          Schema & validation
        </Link>
        {" · "}
        <Link to="/runtime/import" style={{ color: "#2563eb" }}>
          Import gallery
        </Link>
      </p>
    </div>
  );
}
