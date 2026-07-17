import { useEffect, useRef, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import { sinWaveSeries } from "./data";

const CYCLES = 100;

export function LeakBench(): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.__benchReady = false;
    delete window.__runLeakCheck;

    const timer = window.setTimeout(() => {
      window.__benchReady = true;
      window.__runLeakCheck = (cycles = CYCLES) => {
        const host = hostRef.current;
        if (!host) {
          throw new Error("Leak bench host missing");
        }

        const heapBefore = performance.memory?.usedJSHeapSize ?? 0;
        const { categories, values } = sinWaveSeries(2000);

        for (let i = 0; i < cycles; i++) {
          const slot = document.createElement("div");
          slot.style.width = "320px";
          slot.style.height = "120px";
          host.appendChild(slot);

          const root = createRoot(slot);
          root.render(
            <ChartContainer theme={cleanTheme} mode="live" width={320} height={120}>
              <LineChart
                categories={categories}
                series={[{ name: "y", data: values }]}
                showAxes={false}
              />
            </ChartContainer>,
          );
          root.unmount();
          slot.remove();
        }

        const leftoverUplot = document.querySelectorAll(".axicharts-uplot").length;
        const heapAfter = performance.memory?.usedJSHeapSize ?? 0;

        return {
          cycles,
          leftoverUplot,
          heapDeltaMb: (heapAfter - heapBefore) / (1024 * 1024),
          passed: leftoverUplot === 0,
        };
      };
    }, 250);

    return () => {
      window.clearTimeout(timer);
      window.__benchReady = false;
      delete window.__runLeakCheck;
    };
  }, []);

  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8" }}>
        leak · axicharts · {CYCLES} mount/unmount cycles
      </p>
      <div ref={hostRef} />
    </div>
  );
}
