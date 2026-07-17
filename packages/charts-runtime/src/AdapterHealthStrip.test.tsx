import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdapterHealthStrip } from "./AdapterHealthStrip";

describe("AdapterHealthStrip", () => {
  it("renders fixture links when provided", () => {
    render(
      <AdapterHealthStrip
        items={[
          {
            id: "ops",
            label: "Ops",
            connection: "ready",
            fixtureHref: "https://example.test/runtime/import?preset=ops-rest",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Fixture" });
    expect(link.getAttribute("href")).toBe("https://example.test/runtime/import?preset=ops-rest");
  });
});
