import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MarkdownPanel } from "./MarkdownPanel";

const SAMPLE = `# Shift handoff

Line 3 is **stable** after the *hopper reset*.

- Check [runbook](https://example.com/runbook)
- Escalate if reject rate > 2%

\`\`\`
tag: line3.reject_rate
threshold: 0.02
\`\`\`
`;

afterEach(() => {
  cleanup();
});

describe("MarkdownPanel", () => {
  it("renders headings, emphasis, lists, links, and code fences", () => {
    render(<MarkdownPanel content={SAMPLE} surface="dark" title="Shift notes" />);

    expect(screen.getByText("Shift notes")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Shift handoff" })).toBeTruthy();
    expect(screen.getByText("stable")).toBeTruthy();
    expect(screen.getByText("hopper reset")).toBeTruthy();
    expect(screen.getByRole("link", { name: "runbook" }).getAttribute("href")).toBe(
      "https://example.com/runbook",
    );
    expect(screen.getByText(/tag: line3\.reject_rate/)).toBeTruthy();
  });

  it("accepts markdown alias prop", () => {
    render(<MarkdownPanel markdown="**Bold** note" />);
    expect(screen.getByText("Bold")).toBeTruthy();
  });

  it("shows placeholder when empty", () => {
    render(<MarkdownPanel content="" />);
    expect(screen.getByText("No content")).toBeTruthy();
  });

  it("does not render unsafe link protocols", () => {
    render(<MarkdownPanel content="[x](javascript:alert(1))" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("[x](javascript:alert(1))")).toBeTruthy();
  });
});
