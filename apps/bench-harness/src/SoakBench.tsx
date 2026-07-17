import {
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { flushSync } from "react-dom";
import { AxiPanel } from "./charts/AxiPanel";
import { FIXTURE_POINTS, percentile, shiftValues, sinWaveSeries } from "./data";

export type SoakBenchParams = {
  fixture: string;
  points?: number;
  hz: number;
  durationMs: number;
};

export function SoakBench({
  fixture,
  points,
  hz,
  durationMs,
}: SoakBenchParams): ReactElement {
  const pointCount = points ?? FIXTURE_POINTS[fixture] ?? 10_000;
  const initial = useMemo(() => sinWaveSeries(pointCount), [pointCount]);
  const [state, setState] = useState({
    categories: initial.categories,
    values: initial.values,
  });

  useEffect(() => {
    const seeded = sinWaveSeries(pointCount);
    setState({ categories: seeded.categories, values: seeded.values });
  }, [fixture, pointCount]);

  useEffect(() => {
    window.__benchReady = false;
    delete window.__runSoakBench;

    const timer = window.setTimeout(() => {
      window.__benchReady = true;
      window.__runSoakBench = async (options: {
        durationMs: number;
        hz: number;
      }) => {
        const intervalMs = 1000 / options.hz;
        const times: number[] = [];
        const endAt = performance.now() + options.durationMs;

        while (performance.now() < endAt) {
          const start = performance.now();
          flushSync(() => {
            setState((current) => ({
              ...current,
              values: shiftValues(current.values),
            }));
          });
          times.push(performance.now() - start);

          const elapsed = performance.now() - start;
          const waitMs = Math.max(0, intervalMs - elapsed);
          if (waitMs > 0) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, waitMs);
            });
          }
        }

        times.sort((a, b) => a - b);
        return {
          p95Ms: percentile(times, 0.95),
          updates: times.length,
          durationMs: options.durationMs,
          hz: options.hz,
        };
      };
    }, 250);

    return () => {
      window.clearTimeout(timer);
      window.__benchReady = false;
      delete window.__runSoakBench;
    };
  }, [fixture, pointCount, hz, durationMs]);

  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8" }}>
        soak · axicharts · {fixture} · {pointCount} pts · {hz} Hz · {durationMs / 1000}s
      </p>
      <div className="panel">
        <AxiPanel categories={state.categories} values={state.values} />
      </div>
    </div>
  );
}
