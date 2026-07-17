import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartContainer } from "./ChartContainer";

describe("ChartContainer", () => {
  it("renders children when width and height are defined", () => {
    render(
      <ChartContainer width={400} height={240}>
        <div>Chart body</div>
      </ChartContainer>,
    );

    expect(screen.getByText("Chart body")).toBeTruthy();
  });
});
