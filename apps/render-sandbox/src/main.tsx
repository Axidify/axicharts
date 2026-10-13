import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@axicharts/charts-andon/register";
import "@axicharts/charts-tank/register";
import { App } from "./App";
import "./global.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
