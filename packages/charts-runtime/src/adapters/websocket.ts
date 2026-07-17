import type { DataSourceSnapshot, WebSocketDataSourceSpec } from "../types";

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

  let data: Record<string, unknown> = {};
  let socket: InstanceType<typeof WebSocketImpl> | undefined;

  onUpdate({ data, connection: "connecting" });

  try {
    socket = new WebSocketImpl(spec.url);
  } catch (error) {
    onUpdate({
      data: {},
      connection: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    return () => {};
  }

  socket.addEventListener("open", () => {
    onUpdate({
      data,
      connection: "ready",
      lastUpdatedAt: Date.now(),
    });
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(String(event.data)) as unknown;
      if (!isRecord(payload)) return;
      data = mergePayload(data, payload);
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
    onUpdate({
      data,
      connection: "error",
      error: "WebSocket closed",
    });
  });

  return () => {
    socket?.close();
  };
}
