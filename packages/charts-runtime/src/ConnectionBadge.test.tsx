import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionBadge } from "./ConnectionBadge";

describe("ConnectionBadge", () => {
  it("renders live label for ready connections", () => {
    const { container } = render(<ConnectionBadge connection="ready" />);
    expect(container.textContent).toContain("Live");
  });

  it("renders connecting label", () => {
    const { container } = render(<ConnectionBadge connection="connecting" compact />);
    expect(container.textContent).toContain("Connecting");
  });
});
