import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiFlipCard, resolveKpiRationale } from "./KpiFlipCard";

describe("resolveKpiRationale", () => {
  it("prefers explicit rationale on the block", () => {
    expect(
      resolveKpiRationale("Open tickets", "agent.incident.kpi.open", "1 ticket not closed", "open count", []),
    ).toEqual({ body: "1 ticket not closed", hint: "open count" });
  });

  it("falls back to matching decision step", () => {
    expect(
      resolveKpiRationale(
        "Open tickets",
        undefined,
        undefined,
        undefined,
        [{ step: "KPI — Open tickets", api: "compileRecipe", status: "ok", notes: "Stat KPI — Open tickets" }],
      ),
    ).toEqual(expect.objectContaining({ body: expect.stringContaining("Open tickets") }));
  });
});

describe("KpiFlipCard", () => {
  it("renders static card when no rationale is available", () => {
    render(
      <KpiFlipCard title="Rows">
        <span>4</span>
      </KpiFlipCard>,
    );
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("exposes flip control when rationale exists", () => {
    render(
      <KpiFlipCard title="Open tickets" rationale="Count where status is not closed">
        <span>1</span>
      </KpiFlipCard>,
    );
    expect(screen.getByRole("button", { name: /show how open tickets/i })).toBeTruthy();
  });
});
