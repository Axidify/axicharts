import { afterEach, describe, expect, it, vi } from "vitest";
import { connectMqttSource } from "./mqtt";
import type { DataSourceSnapshot, MqttClientLike, MqttConnectFn } from "../types";

function createMockMqttClient(messages: Array<Record<string, unknown>>): {
  client: MqttClientLike;
  connect: MqttConnectFn;
} {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};

  const client: MqttClientLike = {
    on(event, listener) {
      handlers[event] = handlers[event] ?? [];
      handlers[event].push(listener);
      if (event === "connect") {
        queueMicrotask(() => listener());
      }
    },
    subscribe() {
      for (const message of messages) {
        handlers.message?.forEach((listener) =>
          listener("plant/line3/metrics", JSON.stringify(message)),
        );
      }
    },
    end: vi.fn(),
  };

  return {
    client,
    connect: () => client,
  };
}

describe("connectMqttSource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges MQTT JSON payloads into snapshot data", async () => {
    const { connect } = createMockMqttClient([
      { cells: [{ title: "CPU", data: [12, 14] }] },
      { categories: ["Mon", "Tue"] },
    ]);
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectMqttSource(
      {
        type: "mqtt",
        url: "wss://broker.test/mqtt",
        topic: "plant/line3/#",
        connect,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    const ready = snapshots.at(-1);
    expect(ready?.data.cells).toBeTruthy();
    expect(ready?.data.categories).toEqual(["Mon", "Tue"]);

    disconnect();
  });

  it("reports error when connect factory is missing", () => {
    const snapshots: DataSourceSnapshot[] = [];
    connectMqttSource(
      { type: "mqtt", url: "wss://broker.test/mqtt", topic: "tags/#" },
      (snapshot) => snapshots.push(snapshot),
    );

    expect(snapshots[0]?.connection).toBe("error");
  });
});
