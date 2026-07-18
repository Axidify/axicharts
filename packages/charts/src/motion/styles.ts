import type { CSSProperties } from "react";
import type { CartesianMotionKind, ChartAnimateEnterConfig } from "./types";

const STYLE_ID = "axicharts-presentation-motion";
const CARTESIAN_STYLE_ID = "axicharts-cartesian-motion";
const LIVE_CROSSFADE_STYLE_ID = "axicharts-live-crossfade-motion";

export const LIVE_CROSSFADE_MS = 150;

const PRESENTATION_ENTER_MS = 620;
const PRESENTATION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

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

export function ensureCartesianMotionStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(CARTESIAN_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = CARTESIAN_STYLE_ID;
  style.textContent = `
    @keyframes axicharts-line-enter {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes axicharts-line-stroke {
      from { stroke-dashoffset: var(--axicharts-stroke-length, 1000); }
      to { stroke-dashoffset: 0; }
    }
    @keyframes axicharts-bar-enter {
      from { transform: scaleY(0); opacity: 0.35; }
      to { transform: scaleY(1); opacity: 1; }
    }
    @keyframes axicharts-area-enter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes axicharts-update-fade {
      from { opacity: 0.55; }
      to { opacity: 1; }
    }
    .axicharts-motion-line svg[data-engine="svg"] path[data-series-line] {
      stroke-dasharray: var(--axicharts-stroke-length, 1000);
      animation: axicharts-line-stroke var(--axicharts-enter-duration, 520ms) var(--axicharts-enter-easing, cubic-bezier(0.22, 1, 0.36, 1)) both;
      animation-delay: var(--axicharts-enter-delay, 0ms);
    }
  `;
  document.head.appendChild(style);
}

export function presentationEnterStyle(
  enabled: boolean,
  enter?: ChartAnimateEnterConfig | null,
): CSSProperties | undefined {
  if (!enabled) return undefined;
  const duration = enter?.duration ?? PRESENTATION_ENTER_MS;
  const easing = enter?.easing ?? PRESENTATION_EASING;
  const delay = enter?.delay ?? 0;
  return {
    animation: `axicharts-enter ${duration}ms ${easing} ${delay}ms both`,
  };
}

export function cartesianEnterStyle(
  kind: CartesianMotionKind,
  enter: ChartAnimateEnterConfig,
  options?: { presentationMode?: boolean },
): CSSProperties {
  const duration = enter.duration ?? 520;
  const easing = enter.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)";
  const delay = enter.delay ?? 0;
  const vars = {
    ["--axicharts-enter-duration" as string]: `${duration}ms`,
    ["--axicharts-enter-easing" as string]: easing,
    ["--axicharts-enter-delay" as string]: `${delay}ms`,
  } as CSSProperties;

  if (options?.presentationMode) {
    if (kind === "bar") {
      return {
        ...vars,
        transformOrigin: "bottom center",
        animation: `axicharts-bar-enter ${duration}ms ${easing} ${delay}ms both`,
      };
    }
    if (kind === "area" || kind === "combo") {
      return {
        ...vars,
        animation: `axicharts-area-enter ${duration}ms ${easing} ${delay}ms both`,
      };
    }
    return {
      ...vars,
      animation: `axicharts-line-stroke ${duration}ms ${easing} ${delay}ms both`,
    };
  }

  if (kind === "bar") {
    return {
      ...vars,
      transformOrigin: "bottom center",
      animation: `axicharts-bar-enter ${duration}ms ${easing} ${delay}ms both`,
    };
  }
  if (kind === "area" || kind === "combo") {
    return {
      ...vars,
      animation: `axicharts-area-enter ${duration}ms ${easing} ${delay}ms both`,
    };
  }
  return {
    ...vars,
    animation: `axicharts-line-enter ${duration}ms ${easing} ${delay}ms both`,
  };
}

export function cartesianUpdateStyle(durationMs: number): CSSProperties {
  return {
    animation: `axicharts-update-fade ${durationMs}ms ease-out both`,
  };
}

export function ensureLiveCrossfadeStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(LIVE_CROSSFADE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = LIVE_CROSSFADE_STYLE_ID;
  style.textContent = `
    @keyframes axicharts-live-crossfade {
      from { opacity: 0.55; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export function liveCrossfadeStyle(durationMs: number): CSSProperties {
  return {
    animation: `axicharts-live-crossfade ${durationMs}ms ease-out both`,
  };
}
