import type { DataSourceSnapshot, WebSocketDataSourceSpec } from "../types";
import { defaultWebSocketMapper, mergeAdapterExtras } from "./normalize";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergePayload(
  current: Record<string, unknown>,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  return { ...current, ...payload };
}

export function connectWebSocketSource(
  spec: WebSocketDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  const WebSocketImpl = spec.WebSocketImpl ?? globalThis.WebSocket;
  if (!WebSocketImpl) {
    onUpdate({
      data: {},
      connection: "error",
      error: "WebSocket is not available",
    });
    return () => {};
  }

  const parseMessage = spec.parseMessage ?? defaultWebSocketMapper;
  let data: Record<string, unknown> = {};
  let socket: InstanceType<typeof WebSocketImpl> | undefined;
  let cancelled = false;
  let hasConnected = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const openSocket = () => {
    if (cancelled) return;
    if (!hasConnected) {
      onUpdate({ data, connection: "connecting" });
    }

    try {
      socket = new WebSocketImpl(spec.url);
    } catch (error) {
      onUpdate({
        data,
        connection: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    socket.addEventListener("open", () => {
      hasConnected = true;
      onUpdate({
        data,
        connection: "ready",
        lastUpdatedAt: Date.now(),
      });
    });

    socket.addEventListener("message", (event) => {
      try {
        const raw = JSON.parse(String(event.data)) as unknown;
        const mapped = parseMessage(raw);
        if (!isRecord(mapped)) return;
        data = mergePayload(data, mergeAdapterExtras(mapped, raw));
        onUpdate({
          data,
          connection: "ready",
          lastUpdatedAt: Date.now(),
        });
      } catch {
        // Ignore malformed frames
      }
    });

    socket.addEventListener("error", () => {
      onUpdate({
        data,
        connection: "error",
        error: "WebSocket error",
      });
    });

    socket.addEventListener("close", () => {
      if (cancelled) return;
      onUpdate({
        data,
        connection: "error",
        error: "WebSocket closed",
      });
      if (spec.reconnectDelayMs != null) {
        reconnectTimer = setTimeout(() => {
          openSocket();
        }, spec.reconnectDelayMs);
      }
    });
  };

  openSocket();

  return () => {
    cancelled = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    socket?.close();
  };
}
