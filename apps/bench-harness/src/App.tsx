import {
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { flushSync } from "react-dom";
import { AxiPanel } from "./charts/AxiPanel";
import { EChartsPanel } from "./charts/EChartsPanel";
import { RechartsPanel } from "./charts/RechartsPanel";
import { FIXTURE_POINTS, percentile, shiftValues, sinWaveSeries } from "./data";
import type { BenchLib, BenchParams } from "./types";

type PanelState = {
  categories: string[];
  values: number[];
};

function Panel({
  lib,
  state,
}: {
  lib: BenchLib;
  state: PanelState;
}): ReactElement {
  switch (lib) {
    case "recharts":
      return <RechartsPanel categories={state.categories} values={state.values} />;
    case "echarts":
      return <EChartsPanel categories={state.categories} values={state.values} />;
    default:
      return <AxiPanel categories={state.categories} values={state.values} />;
  }
}

export function BenchApp({ lib, fixture, panels, points }: BenchParams): ReactElement {
  const pointCount = points ?? FIXTURE_POINTS[fixture] ?? 500;
  const initial = useMemo(() => sinWaveSeries(pointCount), [pointCount]);
  const [panelStates, setPanelStates] = useState<PanelState[]>(() =>
    Array.from({ length: panels }, () => ({
      categories: initial.categories,
      values: initial.values,
    })),
  );

  useEffect(() => {
    const seeded = sinWaveSeries(pointCount);
    setPanelStates(
      Array.from({ length: panels }, () => ({
        categories: seeded.categories,
        values: seeded.values,
      })),
    );
  }, [fixture, panels, pointCount]);

  useEffect(() => {
    window.__benchReady = false;

    const timer = window.setTimeout(() => {
      window.__benchReady = true;
      window.__runUpdateBench = (updates: number) => {
        const times: number[] = [];

        for (let frame = 0; frame < updates; frame++) {
          const start = performance.now();
          flushSync(() => {
            setPanelStates((current) =>
              current.map((panel) => ({
                ...panel,
                values: shiftValues(panel.values),
              })),
            );
          });
          times.push(performance.now() - start);
        }

        times.sort((a, b) => a - b);
        return { p95Ms: percentile(times, 0.95), updates };
      };
    }, 250);

    return () => {
      window.clearTimeout(timer);
      window.__benchReady = false;
      delete window.__runUpdateBench;
    };
  }, [lib, fixture, panels, pointCount]);

  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8" }}>
        {lib} · {fixture} · {panels} panel{panels === 1 ? "" : "s"} · {pointCount} pts
      </p>
      <div className={panels > 1 ? "panel-grid" : undefined}>
        {panelStates.map((state, index) => (
          <div key={index} className="panel">
            <Panel lib={lib} state={state} />
          </div>
        ))}
      </div>
    </div>
  );
}
