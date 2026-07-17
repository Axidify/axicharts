import { afterEach, describe, expect, it, vi } from "vitest";
import { connectWebSocketSource } from "./websocket";
import type { DataSourceSnapshot } from "../types";

type MockSocket = {
  addEventListener: (event: string, listener: (...args: unknown[]) => void) => void;
  close: () => void;
};

function createMockWebSocket(messages: unknown[]): {
  WebSocketImpl: new (url: string) => MockSocket;
  emit: (event: string, data?: unknown) => void;
} {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  class MockWebSocket {
    constructor(_url: string) {
      queueMicrotask(() => listeners.open?.forEach((listener) => listener()));
      for (const message of messages) {
        queueMicrotask(() =>
          listeners.message?.forEach((listener) =>
            listener({ data: JSON.stringify(message) }),
          ),
        );
      }
    }

    addEventListener(event: string, listener: (...args: unknown[]) => void) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(listener);
    }

    close() {
      listeners.close?.forEach((listener) => listener());
    }
  }

  return {
    WebSocketImpl: MockWebSocket as unknown as new (url: string) => MockSocket,
    emit: (event, data) => {
      listeners[event]?.forEach((listener) => listener(data));
    },
  };
}

describe("connectWebSocketSource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges JSON frames and passes alarms through", async () => {
    const { WebSocketImpl } = createMockWebSocket([
      {
        cells: [{ title: "CPU", data: [12] }],
        alarms: [{ id: "a1", message: "warn", severity: "warning" }],
      },
    ]);
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectWebSocketSource(
      {
        type: "websocket",
        url: "wss://telemetry.test/stream",
        WebSocketImpl: WebSocketImpl as unknown as typeof WebSocket,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    expect(snapshots.at(-1)?.data.cells).toBeTruthy();
    expect(snapshots.at(-1)?.data.alarms).toEqual([
      { id: "a1", message: "warn", severity: "warning" },
    ]);

    disconnect();
  });

  it("supports custom parseMessage mappers", async () => {
    const { WebSocketImpl } = createMockWebSocket([{ value: 42 }]);
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectWebSocketSource(
      {
        type: "websocket",
        url: "wss://telemetry.test/stream",
        WebSocketImpl: WebSocketImpl as unknown as typeof WebSocket,
        parseMessage: (payload) => {
          const record = payload as { value: number };
          return { kpis: [{ value: String(record.value), label: "Last" }] };
        },
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    expect(snapshots.at(-1)?.data.kpis).toEqual([{ value: "42", label: "Last" }]);

    disconnect();
  });
});
