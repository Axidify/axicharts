import { useMemo, useState, type ReactElement } from "react";
import { Chart } from "@axicharts/charts-spec";
import {
  findScenario,
  LAYOUT_PRESETS,
  RENDER_SCENARIOS,
  SCENARIO_GROUPS,
  type LayoutPreset,
  type RenderScenario,
} from "./scenarios";

function layoutFromPreset(preset: LayoutPreset) {
  return {
    columns: preset.columns,
    chartHeight: preset.chartHeight,
    containerWidth: preset.containerWidth,
  };
}

function layoutFromScenario(scenario: RenderScenario) {
  return {
    columns: scenario.defaultLayout?.columns ?? 1,
    chartHeight: scenario.defaultLayout?.chartHeight ?? 280,
    containerWidth: scenario.defaultLayout?.containerWidth ?? 360,
  };
}

export function App(): ReactElement {
  const [scenarioId, setScenarioId] = useState(RENDER_SCENARIOS[0]!.id);
  const [presetId, setPresetId] = useState<string>("scenario-default");
  const [columns, setColumns] = useState(1);
  const [chartHeight, setChartHeight] = useState(280);
  const [containerWidth, setContainerWidth] = useState<number | "full">(360);

  const scenario = useMemo(() => findScenario(scenarioId), [scenarioId]);

  const applyScenarioDefaults = (next: RenderScenario) => {
    const defaults = layoutFromScenario(next);
    setPresetId("scenario-default");
    setColumns(defaults.columns);
    setChartHeight(defaults.chartHeight);
    setContainerWidth(defaults.containerWidth);
  };

  const onScenarioChange = (id: string) => {
    setScenarioId(id);
    applyScenarioDefaults(findScenario(id));
  };

  const onPresetChange = (id: string) => {
    setPresetId(id);
    if (id === "scenario-default") {
      applyScenarioDefaults(scenario);
      return;
    }
    const preset = LAYOUT_PRESETS.find((item) => item.id === id);
    if (preset) {
      const layout = layoutFromPreset(preset);
      setColumns(layout.columns);
      setChartHeight(layout.chartHeight);
      setContainerWidth(layout.containerWidth);
    }
  };

  const stageStyle =
    containerWidth === "full"
      ? { width: "100%" }
      : { width: containerWidth, maxWidth: "100%" };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="brand">Render sandbox</div>
          <p className="brand-sub">
            Visual regression harness for axicharts renderers. Uses live monorepo source via Vite
            aliases.
          </p>
        </header>

        {SCENARIO_GROUPS.map((group) => (
          <section key={group} className="nav-group">
            <h2>{group}</h2>
            <ul>
              {RENDER_SCENARIOS.filter((item) => item.group === group).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === scenarioId ? "nav-link active" : "nav-link"}
                    onClick={() => onScenarioChange(item.id)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </aside>

      <main className="main">
        <header className="scenario-header">
          <div>
            <h1>{scenario.title}</h1>
            <p>{scenario.description}</p>
            <div className="tag-row">
              {scenario.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="controls">
            <label>
              Layout preset
              <select value={presetId} onChange={(event) => onPresetChange(event.target.value)}>
                <option value="scenario-default">Scenario default</option>
                {LAYOUT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Columns
              <input
                type="number"
                min={1}
                max={4}
                value={columns}
                onChange={(event) => setColumns(Number(event.target.value) || 1)}
              />
            </label>
            <label>
              Chart height
              <input
                type="number"
                min={160}
                max={480}
                step={20}
                value={chartHeight}
                onChange={(event) => setChartHeight(Number(event.target.value) || 280)}
              />
            </label>
            <label>
              Container width
              <select
                value={containerWidth === "full" ? "full" : String(containerWidth)}
                onChange={(event) => {
                  const value = event.target.value;
                  setContainerWidth(value === "full" ? "full" : Number(value));
                }}
              >
                <option value="320">320px</option>
                <option value="360">360px (axiboard tile)</option>
                <option value="480">480px</option>
                <option value="640">640px</option>
                <option value="760">760px (2-col grid)</option>
                <option value="full">Full width</option>
              </select>
            </label>
          </div>
        </header>

        <section className="checks">
          <h2>Checklist</h2>
          <ul>
            {scenario.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </section>

        <section className="stage-wrap">
          <div className="stage-meta">
            {containerWidth === "full" ? "full width" : `${containerWidth}px`} · {columns} col ·{" "}
            {chartHeight}px charts · {scenario.panels.length} panel
            {scenario.panels.length === 1 ? "" : "s"}
          </div>
          <div className="stage" style={stageStyle}>
            <div
              className="chart-grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {scenario.panels.map((block) => (
                <article key={block.title} className="chart-card">
                  <h3>{block.title}</h3>
                  <Chart panel={block.panel} data={{ rows: block.rows }} height={chartHeight} />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
