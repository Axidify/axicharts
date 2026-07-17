import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BenchApp } from "./App";
import { LeakBench } from "./LeakBench";
import { SoakBench } from "./SoakBench";
import type { BenchLib } from "./types";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") ?? "update";

const root = document.getElementById("root")!;

if (mode === "soak") {
  const fixture = params.get("fixture") ?? "large";
  const hz = Number(params.get("hz") ?? "1");
  const durationMs = Number(params.get("durationMs") ?? "60000");
  const points = params.get("points") ? Number(params.get("points")) : undefined;

  createRoot(root).render(
    <StrictMode>
      <SoakBench fixture={fixture} points={points} hz={hz} durationMs={durationMs} />
    </StrictMode>,
  );
} else if (mode === "leak") {
  createRoot(root).render(
    <StrictMode>
      <LeakBench />
    </StrictMode>,
  );
} else {
  const lib = (params.get("lib") ?? "axicharts") as BenchLib;
  const fixture = params.get("fixture") ?? "small";
  const panels = Number(params.get("panels") ?? "1");
  const points = params.get("points") ? Number(params.get("points")) : undefined;

  createRoot(root).render(
    <StrictMode>
      <BenchApp lib={lib} fixture={fixture} panels={panels} points={points} />
    </StrictMode>,
  );
}
