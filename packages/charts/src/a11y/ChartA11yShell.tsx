"use client";

import { useId, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { ChartA11yFallback } from "./ChartA11yFallback";
import { ChartA11yTableView } from "./ChartA11yTableView";
import { ChartDataTableToggle } from "./ChartDataTableToggle";
import { ChartKeyboardExplorer } from "./ChartKeyboardExplorer";
import {
  isInteractiveA11y,
  resolveA11yDataTable,
  resolveA11yKeyboardNav,
  type ChartA11yOptions,
} from "./a11yOptions";
import { CHART_A11Y_ATTR, serializeA11yDescriptor } from "./serialize";
import type { ChartA11yDescriptor } from "./types";

export type ChartA11yShellProps = {
  descriptor: ChartA11yDescriptor;
  ariaLabel: string;
  style?: CSSProperties;
  children: ReactNode;
  a11y?: ChartA11yOptions;
  /** When false, skip SR-only table (e.g. SVG engine with inline a11y). */
  screenReaderTable?: boolean;
  orientation?: "vertical" | "horizontal";
  categoryCount?: number;
};

export function ChartA11yShell({
  descriptor,
  ariaLabel,
  style,
  children,
  a11y,
  screenReaderTable = true,
  orientation = "vertical",
  categoryCount,
}: ChartA11yShellProps): ReactElement {
  const interactive = isInteractiveA11y(a11y);
  const keyboard = resolveA11yKeyboardNav(a11y?.keyboardNavigation);
  const dataTable = resolveA11yDataTable(a11y?.dataTable);
  const tableId = useId();
  const [tableVisible, setTableVisible] = useState(dataTable.visible);

  return (
    <div
      role={interactive ? "group" : "img"}
      aria-label={ariaLabel}
      {...{ [CHART_A11Y_ATTR]: serializeA11yDescriptor(descriptor) }}
      style={{
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {dataTable.showToggle ? (
        <ChartDataTableToggle
          visible={tableVisible}
          onToggle={() => setTableVisible((value) => !value)}
          controlsId={tableId}
        />
      ) : null}
      {tableVisible ? (
        <ChartA11yTableView descriptor={descriptor} visible id={tableId} />
      ) : null}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {children}
        {keyboard.enabled ? (
          <ChartKeyboardExplorer
            descriptor={descriptor}
            mode={keyboard.mode}
            orientation={orientation}
            categoryCount={categoryCount}
          />
        ) : null}
      </div>
      {screenReaderTable ? <ChartA11yFallback descriptor={descriptor} /> : null}
    </div>
  );
}
