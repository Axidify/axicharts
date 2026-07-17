import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { useEffect, type ReactElement, type ReactNode } from "react";
import { cleanTheme } from "@axicharts/charts-theme";
import { ChartLayoutContext } from "../container/ChartLayoutContext";
import {
  ChartInteractionProvider,
  useChartInteraction,
} from "../interaction/ChartInteractionContext";
import { ChartSyncGroup, useChartSync } from "./ChartSyncContext";
import { SyncHighlight } from "./SyncHighlight";

function TestProviders({
  children,
  syncId = "panel-b",
}: {
  children: ReactNode;
  syncId?: string;
}): ReactElement {
  return (
    <ChartSyncGroup>
      <ChartLayoutContext.Provider
        value={{
          size: { width: 400, height: 180 },
          ready: true,
          theme: cleanTheme,
          mode: "interactive",
          syncId,
          dataState: "ready",
          isStale: false,
        }}
      >
        <ChartInteractionProvider>{children}</ChartInteractionProvider>
      </ChartLayoutContext.Provider>
    </ChartSyncGroup>
  );
}

function SyncHarness(): ReactElement {
  const { publish } = useChartSync();
  const { setCursor } = useChartInteraction();

  useEffect(() => {
    publish(2, "panel-a");
    setCursor({ index: 2, left: 120, top: 40 });
  }, [publish, setCursor]);

  return <SyncHighlight categories={["Mon", "Tue", "Wed", "Thu", "Fri"]} />;
}

describe("SyncHighlight", () => {
  it("renders follower highlight band when sync index is active", () => {
    const { container } = render(
      <TestProviders>
        <SyncHarness />
      </TestProviders>,
    );

    act(() => {});

    expect(container.querySelector(".axicharts-sync-highlight")).toBeTruthy();
  });
});
