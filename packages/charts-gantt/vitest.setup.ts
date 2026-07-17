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
