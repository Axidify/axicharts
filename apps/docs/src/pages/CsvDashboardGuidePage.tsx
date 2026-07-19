import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";
import {
  INSTALL_FULL_CODE,
  INSTALL_MINIMAL_CODE,
  PARSE_CSV_CODE,
  PLAN_CODE,
  PROFILE_FROM_ROWS_CODE,
  RENDER_PANELS_CODE,
  SAMPLE_CSV,
} from "../demos/csvDashboardDemo";

const codeBlock = (bg: string, color: string) => ({
  padding: 14,
  borderRadius: 8,
  fontSize: 11,
  lineHeight: 1.5,
  overflow: "auto" as const,
  background: bg,
  color,
});

export function CsvDashboardGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>CSV → dashboard (Path 2)</h1>
      <p style={docBodyStyle()}>
        Upload a spreadsheet snapshot → profile → <code>planFromIntent</code> → per-panel{" "}
        <code>&lt;Chart /&gt;</code>. This is the <strong>dynamic dashboard</strong> path — parallel to{" "}
        <Link to="/start">hand-built cartesian</Link> (Path 1), not a replacement.
      </p>

      <div style={{ ...docCardStyle(), padding: 16, marginBottom: 20, boxShadow: "none" }}>
        <strong style={{ fontSize: 14 }}>When to use this path</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>
          <li>User uploads CSV / exports a batch snapshot — no live historian feed</li>
          <li>You want one metric → one panel without hand-writing panel JSON</li>
          <li>You are fine with cartesian line/bar panels (planner rules)</li>
        </ul>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Prefer <Link to="/runtime">RuntimeDashboard</Link> only for live ops walls with adapters.
          For CSV dashboards, per-panel <code>Chart</code> is the stable default (see{" "}
          <Link to="/guides/troubleshooting">troubleshooting</Link>).
        </p>
      </div>

      <h2 style={{ fontSize: 16 }}>Pipeline</h2>
      <pre style={codeBlock("#f1f5f9", "#0f172a")}>
        {`CSV text → parse rows → DataProfile → planFromIntent → Chart per panel`}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>1. Install (minimal CSV path)</h2>
      <pre style={codeBlock("#0f172a", "#e2e8f0")}>{INSTALL_MINIMAL_CODE}</pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Lockstep: planner <code>0.2.1+</code> peers spec/charts <code>0.4.3+</code> — install spec at
        the app level. See{" "}
        <Link to="/guides/troubleshooting">version mismatch</Link>.
      </p>
      <details style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>
        <summary style={{ cursor: "pointer", fontWeight: 500 }}>Full bundle note</summary>
        <pre style={{ ...codeBlock("#f1f5f9", "#0f172a"), marginTop: 8 }}>{INSTALL_FULL_CODE}</pre>
        <p style={{ margin: "8px 0 0" }}>
          Only add <code>charts-full</code> when you need non-cartesian types or runtime embed SDK in
          the same app.
        </p>
      </details>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>2. Parse CSV → rows</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        No CSV helper ships in core packages yet — parse in your app (or use Papa Parse). Sample data:
      </p>
      <pre style={codeBlock("#f1f5f9", "#0f172a")}>{SAMPLE_CSV}</pre>
      <pre style={{ ...codeBlock("#0f172a", "#e2e8f0"), marginTop: 12 }}>{PARSE_CSV_CODE}</pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>3. Build a DataProfile</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Include <code>fields</code> so the planner infers <code>encoding.x.field</code> (e.g.{" "}
        <code>week</code> — not hardcoded <code>time</code>).
      </p>
      <pre style={codeBlock("#0f172a", "#e2e8f0")}>{PROFILE_FROM_ROWS_CODE}</pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>4. Plan panels from intent</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Mention <strong>CSV</strong> or <strong>static snapshot</strong> in intent so{" "}
        <code>feed</code> is <code>static</code>. Planner delegates to{" "}
        <code>planPanelsFromProfile</code> in spec.
      </p>
      <pre style={codeBlock("#0f172a", "#e2e8f0")}>{PLAN_CODE}</pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        More planner examples: <Link to="/spec#phase-3-planner">Spec § Phase 3</Link> ·{" "}
        <Link to="/runtime/import#planner-feeds">static feed gallery</Link>.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>5. Render with Chart (per panel)</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Pass the same <code>rows</code> array to every panel. Empty first paint shows a loading shell
        (v0.4.3+) — no <code>EMPTY_DATA</code> throw before data arrives.
      </p>
      <pre style={codeBlock("#0f172a", "#e2e8f0")}>{RENDER_PANELS_CODE}</pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Import <code>@axicharts/charts-spec/cartesian</code> when you only need cartesian panels —
        smaller than the full spec entry.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>6. Runnable example</h2>
      <p style={docBodyStyle()}>
        Monorepo app: <code>apps/csv-dashboard</code> — file upload, sample CSV, planner grid.
      </p>
      <pre style={codeBlock("#f1f5f9", "#0f172a")}>
        {`git clone https://github.com/Axidify/axicharts
cd axicharts
pnpm install
pnpm csv-dashboard   # http://localhost:3002`}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Defer / follow-on</h2>
      <ul style={{ fontSize: 14, lineHeight: 1.8, color: "#475569" }}>
        <li>
          <code>planFromCsv(text, intent?)</code> one-shot API — not shipped; compose parse + profile +
          plan in app code for now
        </li>
        <li>OHLC / candlestick column groups from trading CSVs — needs richer profiling</li>
        <li>
          <code>RuntimeDashboard</code> stability with static CSV + React 19 — use per-panel{" "}
          <code>Chart</code> until fixed
        </li>
      </ul>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Path picker: <Link to="/guides/choosing-your-path">Choosing your path</Link> · Path 1:{" "}
        <Link to="/start">Start here</Link>
      </p>
    </div>
  );
}
