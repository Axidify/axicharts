import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import "./entry/industrial";
import { compilePanel } from "./compilePanel";

describe("compilePanel industrial primitives", () => {
  it("compiles digital and status-lamp panels", () => {
    const digital = compilePanel(
      {
        type: "digital",
        theme: "industrial",
        props: { value: 1428, unit: "rpm", label: "Spindle" },
        height: 120,
        width: 200,
      },
      {},
    );
    const lamp = compilePanel(
      {
        type: "status-lamp",
        theme: "industrial",
        props: { status: "running", label: "Line 3" },
        height: 120,
        width: 200,
      },
      {},
    );

    const digitalView = render(digital);
    const lampView = render(lamp);
    expect(digitalView.container.textContent).toContain("1428rpm");
    expect(digitalView.container.textContent).toContain("Spindle");
    expect(lampView.container.textContent).toContain("Line 3");
  });
});
