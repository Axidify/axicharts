"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import type { ChartA11yKeyboardNavMode } from "./a11yOptions";
import {
  buildA11yNavModel,
  getA11yNavPoint,
  getInitialA11yNavCursor,
  moveA11yNavCursor,
  type A11yNavCursor,
} from "./a11yNavigation";
import type { ChartA11yDescriptor } from "./types";

export type ChartKeyboardExplorerProps = {
  descriptor: ChartA11yDescriptor;
  mode?: ChartA11yKeyboardNavMode;
  orientation?: "vertical" | "horizontal";
  /** Category count for cartesian band highlight (defaults to descriptor categories). */
  categoryCount?: number;
};

export function ChartKeyboardExplorer({
  descriptor,
  mode = "normal",
  orientation = "vertical",
  categoryCount: categoryCountProp,
}: ChartKeyboardExplorerProps): ReactElement | null {
  const model = useMemo(() => buildA11yNavModel(descriptor), [descriptor]);
  const [cursor, setCursor] = useState<A11yNavCursor | null>(() =>
    getInitialA11yNavCursor(model),
  );
  const [announcement, setAnnouncement] = useState("");
  const regionRef = useRef<HTMLDivElement>(null);

  const activePoint = cursor ? getA11yNavPoint(model, cursor) : null;

  const announce = useCallback((nextCursor: A11yNavCursor) => {
    const point = getA11yNavPoint(model, nextCursor);
    if (point) {
      setAnnouncement(point.announcement);
    }
  }, [model]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!cursor) return;
      const navigationKeys = new Set([
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ]);
      if (!navigationKeys.has(event.key)) return;

      event.preventDefault();
      const next = moveA11yNavCursor(model, cursor, event.key, mode);
      setCursor(next);
      announce(next);
    },
    [announce, cursor, mode, model],
  );

  const handleFocus = useCallback(() => {
    const initial = cursor ?? getInitialA11yNavCursor(model);
    if (!initial) return;
    if (!cursor) setCursor(initial);
    announce(initial);
  }, [announce, cursor, model]);

  if (model.flatPoints.length === 0) {
    return null;
  }

  const categories =
    descriptor.kind === "cartesian"
      ? descriptor.categories
      : Array.from({ length: model.flatPoints.length }, (_, index) => String(index + 1));
  const bandCount = categoryCountProp ?? categories.length;
  const horizontal = orientation === "horizontal";
  const activeCategoryIndex =
    descriptor.kind === "cartesian" && activePoint
      ? activePoint.categoryIndex
      : activePoint?.categoryIndex ?? null;

  return (
    <>
      <div
        ref={regionRef}
        role="application"
        tabIndex={0}
        aria-label="Chart data points. Use arrow keys to explore."
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        style={FOCUS_REGION_STYLE}
      >
        {bandCount > 0 && activeCategoryIndex != null && descriptor.kind === "cartesian" ? (
          <div style={bandContainerStyle(horizontal)}>
            {categories.slice(0, bandCount).map((label, index) => {
              const selected = activeCategoryIndex === index;
              return (
                <div
                  key={`${label}-${index}`}
                  aria-hidden
                  style={bandStyle(horizontal, selected)}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      <div aria-live="polite" aria-atomic="true" style={SR_LIVE_STYLE}>
        {announcement}
      </div>
    </>
  );
}

const FOCUS_REGION_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  outline: "none",
};

const SR_LIVE_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function bandContainerStyle(horizontal: boolean): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: horizontal ? "column" : "row",
    pointerEvents: "none",
  };
}

function bandStyle(horizontal: boolean, selected: boolean): CSSProperties {
  return {
    flex: 1,
    background: selected ? "rgba(59, 130, 246, 0.14)" : "transparent",
    boxShadow: selected ? "inset 0 0 0 2px rgba(59, 130, 246, 0.55)" : undefined,
    borderRight: !horizontal ? "1px solid transparent" : undefined,
    borderBottom: horizontal ? "1px solid transparent" : undefined,
  };
}
