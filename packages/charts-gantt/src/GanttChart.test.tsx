import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ChartContainer } from "@axicharts/charts";
import { GanttChart, SAMPLE_GANTT_PROGRAM } from "./GanttChart";

describe("GanttChart", () => {
  it("renders task labels inside chart container", () => {
    const { container } = render(
      <ChartContainer width={480} height={220}>
        <GanttChart {...SAMPLE_GANTT_PROGRAM} />
      </ChartContainer>,
    );
    expect(container.textContent).toContain("Build");
    expect(container.textContent).toContain("Beta");
  });

  it("highlights hovered task", () => {
    const { container } = render(
      <ChartContainer width={480} height={220}>
        <GanttChart {...SAMPLE_GANTT_PROGRAM} />
      </ChartContainer>,
    );
    const taskGroup = [...container.querySelectorAll("g")].find((node) =>
      node.textContent?.includes("Build"),
    );
    expect(taskGroup).toBeTruthy();
    fireEvent.mouseEnter(taskGroup!);
    expect(container.querySelector('[stroke-width="1.5"]')).toBeTruthy();
  });

  it("renders today marker", () => {
    const { container } = render(
      <ChartContainer width={480} height={220}>
        <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
      </ChartContainer>,
    );
    expect(container.textContent).toContain("Today");
  });

  it("renders dark surface palette", () => {
    const { container } = render(
      <ChartContainer width={480} height={220}>
        <GanttChart {...SAMPLE_GANTT_PROGRAM} surface="dark" />
      </ChartContainer>,
    );
    expect(container.querySelector('[fill="#0f172a"]')).toBeTruthy();
  });
});
