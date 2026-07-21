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

const pathNoop = () => {};

if (typeof globalThis.Path2D === "undefined") {
  class Path2DStub {
    rect = pathNoop;
    moveTo = pathNoop;
    lineTo = pathNoop;
    closePath = pathNoop;
    arc = pathNoop;
    arcTo = pathNoop;
    bezierCurveTo = pathNoop;
    quadraticCurveTo = pathNoop;
    addPath = pathNoop;
  }
  globalThis.Path2D = Path2DStub as unknown as typeof globalThis.Path2D;
}

const canvasCtxStub = new Proxy(
  {
    measureText: () => ({
      width: 0,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
    }),
  },
  {
    get(target, prop) {
      if (prop in target) {
        return (target as Record<string | symbol, unknown>)[prop];
      }
      return pathNoop;
    },
  },
) as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
): CanvasRenderingContext2D | null {
  return contextId === "2d" ? canvasCtxStub : null;
};
