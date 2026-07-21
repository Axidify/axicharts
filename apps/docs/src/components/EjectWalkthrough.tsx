import type { ReactElement } from "react";
import {
  Chart,
  evaluatePlaygroundSpec,
  findPlaygroundPreset,
} from "@axicharts/charts-spec";

const ROWS = findPlaygroundPreset("revenue-target")?.rows ?? [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
];

const BAD_SPEC = `{
  "type": "cartesian",
  "encoding": { "x": { "field": "wek" } },
  "marks": [
    { "type": "bar", "field": "revenue" },
    { "type": "line", "field": "target" }
  ]
}`;

const FIXED_SPEC = `{
  "type": "cartesian",
  "encoding": { "x": { "field": "week" } },
  "marks": [
    { "type": "bar", "field": "revenue" },
    { "type": "line", "field": "target" }
  ]
}`;

const pane = (bg: string): React.CSSProperties => ({
  margin: 0,
  padding: 10,
  borderRadius: 6,
  fontSize: 11,
  lineHeight: 1.45,
  overflow: "auto",
  background: bg,
});

export function EjectWalkthrough(): ReactElement {
  const badEval = evaluatePlaygroundSpec(BAD_SPEC, ROWS);
  const fixedEval = evaluatePlaygroundSpec(FIXED_SPEC, ROWS);

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>1. Invalid spec</div>
        <pre style={pane("#fef2f2")}>{BAD_SPEC}</pre>
        <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
          {badEval.errors.map((error) => error.code).join(", ") || badEval.parseError}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>2. Apply fix patch</div>
        <pre style={pane("#f0fdf4")}>{FIXED_SPEC}</pre>
        <div style={{ fontSize: 12, color: "#15803d", marginTop: 6 }}>
          validatePanel strict → ok
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>3. Eject + render</div>
        {fixedEval.panel && fixedEval.canRender ? (
          <div style={{ height: 200, border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
            <Chart panel={fixedEval.panel} data={ROWS} height={180} />
          </div>
        ) : null}
        <pre style={{ ...pane("#f8fafc"), marginTop: 8, maxHeight: 160 }}>
          {fixedEval.ejected?.slice(0, 520) ?? ""}
          {(fixedEval.ejected?.length ?? 0) > 520 ? "\n…" : ""}
        </pre>
      </div>
    </div>
  );
}
