import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@axicharts/charts", () => ({
  presentationEnterStyle: () => undefined,
}));

import { PresentationDeck } from "./PresentationDeck";

describe("PresentationDeck", () => {
  it("shows progress and keyboard hints", () => {
    render(
      <PresentationDeck
        slides={[
          { id: "a", title: "Slide A", content: <div>Alpha</div> },
          { id: "b", title: "Slide B", content: <div>Beta</div> },
        ]}
      />,
    );

    expect(screen.getByTestId("presentation-deck-progress")).toBeTruthy();
    expect(screen.getByText("← → Space advance · Esc exit")).toBeTruthy();
    expect(screen.getByText("1 / 2")).toBeTruthy();
  });

  it("advances slides with arrow keys and remounts content", () => {
    render(
      <PresentationDeck
        slides={[
          { id: "a", content: <div data-testid="slide-a">Alpha</div> },
          { id: "b", content: <div data-testid="slide-b">Beta</div> },
        ]}
      />,
    );

    expect(screen.getByTestId("slide-a")).toBeTruthy();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.queryByTestId("slide-a")).toBeNull();
    expect(screen.getByTestId("slide-b")).toBeTruthy();
  });
});
