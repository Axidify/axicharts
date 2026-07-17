import type { CSSProperties } from "react";

const STYLE_ID = "axicharts-presentation-motion";

export function ensurePresentationStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes axicharts-enter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export function presentationEnterStyle(enabled: boolean): CSSProperties | undefined {
  if (!enabled) return undefined;
  return {
    animation: "axicharts-enter 620ms cubic-bezier(0.22, 1, 0.36, 1) both",
  };
}
