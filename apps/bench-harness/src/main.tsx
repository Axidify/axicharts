import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BenchApp } from "./App";
import type { BenchLib } from "./types";

const params = new URLSearchParams(window.location.search);
const lib = (params.get("lib") ?? "axicharts") as BenchLib;
const fixture = params.get("fixture") ?? "small";
const panels = Number(params.get("panels") ?? "1");
const points = params.get("points") ? Number(params.get("points")) : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BenchApp lib={lib} fixture={fixture} panels={panels} points={points} />
  </StrictMode>,
);
