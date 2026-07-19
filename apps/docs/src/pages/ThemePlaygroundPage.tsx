import { useMemo, useState, type ReactElement } from "react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import {
  cleanTheme,
  createTheme,
  industrialTheme,
  liveTheme,
  studioTheme,
  type ChartTheme,
} from "@axicharts/charts-theme";
import { docBodyStyle } from "../styles/docTokens";

const STARTERS = {
  clean: cleanTheme,
  live: liveTheme,
  studio: studioTheme,
  industrial: industrialTheme,
} as const;

const THEME_EXPORT_NAMES: Record<StarterKey, string> = {
  clean: "cleanTheme",
  live: "liveTheme",
  studio: "studioTheme",
  industrial: "industrialTheme",
};

type StarterKey = keyof typeof STARTERS;

const GLOSSARY = [
  { token: "grid.opacity", maps: "Grid line visibility / weight" },
  { token: "grid.vertical", maps: "Vertical time grid (liveTheme: on)" },
  { token: "line.strokeWidth", maps: "Line / area stroke thickness" },
  { token: "area.fillOpacity", maps: "Area fill under line (theme object)" },
  { token: "bar.radius", maps: "Bar corner radius" },
  { token: "values.monospace", maps: "Monospace tick values (live/industrial)" },
  { token: "svg.areaGradient", maps: "Studio editorial SVG gradient (studioTheme)" },
  { token: "CSS --chart-1…5", maps: "Series palette (tokens.css)" },
] as const;

const SAMPLE = {
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  series: [{ name: "Throughput", data: [42, 38, 55, 49, 62] }],
};

export function ThemePlaygroundPage(): ReactElement {
  const [starter, setStarter] = useState<StarterKey>("clean");
  const [areaOpacity, setAreaOpacity] = useState(0.24);

  const theme: ChartTheme = useMemo(
    () =>
      createTheme(STARTERS[starter], {
        name: `playground-${starter}`,
        area: { fillOpacity: areaOpacity },
      }),
    [starter, areaOpacity],
  );

  const exportCode = `import { ${THEME_EXPORT_NAMES[starter]}, createTheme } from "@axicharts/charts-theme";

export const appTheme = createTheme(${THEME_EXPORT_NAMES[starter]}, {
  name: "my-app",
  area: { fillOpacity: ${areaOpacity.toFixed(2)} },
});`;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Theme playground</h1>
      <p style={docBodyStyle()}>
        Pick a starter theme, tune a token, preview live, copy <code>createTheme</code> snippet.
        Precedence: CSS <code>--chart-*</code> → <code>ChartTheme</code> →{" "}
        <code>props.style</code> on spec panels.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {(Object.keys(STARTERS) as StarterKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStarter(key)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: starter === key ? "2px solid #3b82f6" : "1px solid #e2e8f0",
              background: starter === key ? "#eff6ff" : "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <label style={{ display: "block", fontSize: 13, marginBottom: 16 }}>
        area.fillOpacity: {areaOpacity.toFixed(2)}
        <input
          type="range"
          min={0.05}
          max={0.45}
          step={0.01}
          value={areaOpacity}
          onChange={(e) => setAreaOpacity(Number(e.target.value))}
          style={{ display: "block", width: "100%", maxWidth: 320, marginTop: 8 }}
        />
      </label>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          maxWidth: 560,
          marginBottom: 20,
        }}
      >
        <ChartContainer theme={theme} minHeight={220}>
          <LineChart categories={SAMPLE.categories} series={SAMPLE.series} fill />
        </ChartContainer>
      </div>

      <h2 style={{ fontSize: 16 }}>Export</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f1f5f9",
          fontSize: 12,
          overflow: "auto",
        }}
      >
        {exportCode}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Token glossary</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "8px 10px" }}>Token</th>
            <th style={{ padding: "8px 10px" }}>Visual effect</th>
          </tr>
        </thead>
        <tbody>
          {GLOSSARY.map((row) => (
            <tr key={row.token} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "10px", fontFamily: "monospace", fontSize: 12 }}>
                {row.token}
              </td>
              <td style={{ padding: "10px", color: "#475569" }}>{row.maps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
