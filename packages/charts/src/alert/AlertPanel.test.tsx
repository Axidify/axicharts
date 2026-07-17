import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AlertPanel } from "./AlertPanel";

const alarms = [
  { id: "cpu", message: "CPU above warn threshold", severity: "warning" as const, tag: "cpu" },
  { id: "mem", message: "Memory critical", severity: "critical" as const, tag: "memory" },
];

describe("AlertPanel", () => {
  it("renders active alarms", () => {
    render(<AlertPanel alarms={alarms} />);
    expect(screen.getByText("CPU above warn threshold")).toBeTruthy();
  });

  it("calls ack and shelve handlers", () => {
    const onAck = vi.fn();
    const onShelve = vi.fn();
    render(<AlertPanel alarms={alarms} onAck={onAck} onShelve={onShelve} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Ack" })[0]!);
    fireEvent.click(screen.getAllByRole("button", { name: "Shelve" })[1]!);

    expect(onAck).toHaveBeenCalledWith("cpu");
    expect(onShelve).toHaveBeenCalledWith("mem");
  });

  it("hides acknowledged alarms", () => {
    const { container } = render(
      <AlertPanel
        alarms={[{ ...alarms[0]!, acknowledged: true }, alarms[1]!]}
      />,
    );
    expect(container.textContent).not.toContain("CPU above warn threshold");
    expect(container.textContent).toContain("Memory critical");
  });
});
