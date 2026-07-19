import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const dashboardRenders = vi.fn();

vi.mock("./RuntimeShell", () => ({
  RuntimeShell: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@axicharts/charts-spec", () => ({
  Dashboard: () => {
    dashboardRenders();
    return null;
  },
}));

import { DashboardEmbed } from "./DashboardEmbed";

describe("DashboardEmbed static data (C147e)", () => {
  it("does not thrash renders when dashboard.data is a new object each render", async () => {
    dashboardRenders.mockClear();

    function Harness() {
      return (
        <DashboardEmbed
          dashboard={{
            template: "line-overview",
            mode: "interactive",
            data: {
              rows: [
                { week: "W1", cpu: 42 },
                { week: "W2", cpu: 38 },
              ],
            },
          }}
        />
      );
    }

    const { rerender } = render(<Harness />);

    await waitFor(() => expect(dashboardRenders.mock.calls.length).toBeGreaterThan(0));
    const afterMount = dashboardRenders.mock.calls.length;

    rerender(<Harness />);
    rerender(<Harness />);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(dashboardRenders.mock.calls.length - afterMount).toBeLessThanOrEqual(2);
  });
});
