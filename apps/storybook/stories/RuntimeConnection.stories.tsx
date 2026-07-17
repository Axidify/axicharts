import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardEmbed } from "@axicharts/charts-runtime";

const CATEGORIES = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const CELLS = [
  { title: "CPU", data: [22, 28, 31, 34, 30], suffix: "%" },
  { title: "Memory", data: [55, 58, 60, 59, 61], suffix: "%" },
  { title: "Errors", data: [1, 2, 5, 3, 2], suffix: "/min", tone: "warning" },
  { title: "p95", data: [42, 38, 55, 49, 62], suffix: "ms" },
];

function mockPayload(tick: number) {
  return {
    categories: CATEGORIES,
    cells: CELLS.map((cell) => ({
      ...cell,
      data: cell.data.map((value) => value + (tick % 3)),
    })),
    alarms: [{ id: "cpu-high", message: "CPU above warn threshold", severity: "warning" }],
  };
}

const meta = {
  title: "Runtime/Connection",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C10 adapter health chrome — connection badge on live feeds and per-source mosaic health strip.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WebSocketMock: Story = {
  render: (): ReactElement => {
    let tick = 0;

    class MockWebSocket {
      private listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
      private timer: ReturnType<typeof setInterval> | undefined;

      constructor(_url: string) {
        queueMicrotask(() => {
          this.emit("open");
          this.push();
          this.timer = setInterval(() => this.push(), 2000);
        });
      }

      addEventListener(event: string, listener: (...args: unknown[]) => void) {
        this.listeners[event] = this.listeners[event] ?? [];
        this.listeners[event].push(listener);
      }

      close() {
        if (this.timer) clearInterval(this.timer);
      }

      private emit(event: string, data?: unknown) {
        this.listeners[event]?.forEach((listener) => listener(data));
      }

      private push() {
        tick += 1;
        this.emit("message", { data: JSON.stringify(mockPayload(tick)) });
      }
    }

    return (
      <DashboardEmbed
        dashboard={{
          title: "Line 3",
          subtitle: "WebSocket · push",
          theme: "industrial",
          mode: "live",
          template: "ops-2x2",
          staleAfterMs: 5000,
          dataSource: {
            type: "websocket",
            url: "wss://telemetry.test/line3",
            WebSocketImpl: MockWebSocket as unknown as typeof WebSocket,
          },
        }}
      />
    );
  },
};

export const MqttMock: Story = {
  render: (): ReactElement => {
    let tick = 0;

    return (
      <DashboardEmbed
        dashboard={{
          title: "Line 3",
          subtitle: "MQTT · plant/line3/#",
          theme: "industrial",
          mode: "live",
          template: "ops-2x2",
          staleAfterMs: 5000,
          dataSource: {
            type: "mqtt",
            url: "wss://broker.test/mqtt",
            topic: "plant/line3/#",
            connect: () => {
              const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
              let timer: ReturnType<typeof setInterval> | undefined;

              const client = {
                on(event: string, listener: (...args: unknown[]) => void) {
                  handlers[event] = handlers[event] ?? [];
                  handlers[event].push(listener);
                  if (event === "connect") queueMicrotask(() => listener());
                },
                subscribe() {
                  const push = () => {
                    tick += 1;
                    handlers.message?.forEach((listener) =>
                      listener("plant/line3/metrics", JSON.stringify(mockPayload(tick))),
                    );
                  };
                  push();
                  timer = setInterval(push, 2000);
                },
                end() {
                  if (timer) clearInterval(timer);
                },
              };

              return client;
            },
          },
        }}
      />
    );
  },
};
