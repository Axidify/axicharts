import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Chart } from "./Chart";

describe("Chart", () => {
  it("renders a compiled panel shell", () => {
    const { container } = render(
      <Chart
        panel={{
          type: "stat",
          props: { value: "42%", label: "CPU", tone: "warning" },
        }}
        data={[]}
      />,
    );

    expect(container.textContent).toContain("42%");
    expect(container.textContent).toContain("CPU");
  });
});
