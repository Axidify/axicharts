import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { createCanvas, Path2D } from "@napi-rs/canvas";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

globalThis.Path2D = Path2D as unknown as typeof globalThis.Path2D;

const backingCanvases = new WeakMap<
  HTMLCanvasElement,
  ReturnType<typeof createCanvas>
>();

HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
): CanvasRenderingContext2D | null {
  if (contextId !== "2d") return null;

  const width = this.width || 320;
  const height = this.height || 120;
  let backing = backingCanvases.get(this);

  if (!backing || backing.width !== width || backing.height !== height) {
    backing = createCanvas(width, height);
    backingCanvases.set(this, backing);
  }

  return backing.getContext("2d") as unknown as CanvasRenderingContext2D;
};

globalThis.ResizeObserver = class ResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}

  observe(target: Element) {
    const rect = target.getBoundingClientRect();
    this.callback(
      [
        {
          contentRect: {
            width: rect.width || 640,
            height: rect.height || 320,
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }

  disconnect() {}

  unobserve() {}
} as typeof ResizeObserver;

afterEach(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 60));
});
