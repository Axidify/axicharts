import type {
  DataSourceSnapshot,
  MqttClientLike,
  MqttDataSourceSpec,
} from "../types";
import { mergeAdapterExtras } from "./normalize";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function defaultParsePayload(raw: unknown): Record<string, unknown> {
  if (isRecord(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed)) return parsed;
  }
  return {};
}

export function connectMqttSource(
  spec: MqttDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  const connect = spec.connect;
  if (!connect) {
    onUpdate({
      data: {},
      connection: "error",
      error: "MQTT adapter requires a connect() factory (e.g. mqtt.js)",
    });
    return () => {};
  }

  const parsePayload = spec.parsePayload ?? defaultParsePayload;
  let data: Record<string, unknown> = {};
  let activeClient: MqttClientLike;
  let cancelled = false;
  let hasConnected = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const bindClient = (client: MqttClientLike) => {
    activeClient = client;

    if (!hasConnected) {
      onUpdate({ data, connection: "connecting" });
    }

    client.on("connect", () => {
      hasConnected = true;
      client.subscribe(spec.topic);
      onUpdate({
        data,
        connection: "ready",
        lastUpdatedAt: Date.now(),
      });
    });

    client.on("message", (_topic, payload) => {
      try {
        const raw = payload;
        const chunk = parsePayload(raw);
        data = { ...data, ...mergeAdapterExtras(chunk, raw) };
        onUpdate({
          data,
          connection: "ready",
          lastUpdatedAt: Date.now(),
        });
      } catch {
        // Ignore malformed frames
      }
    });

    client.on("error", () => {
      onUpdate({
        data,
        connection: "error",
        error: "MQTT error",
      });
    });

    client.on("close", () => {
      if (cancelled) return;
      onUpdate({
        data,
        connection: "error",
        error: "MQTT disconnected",
      });
      if (spec.reconnectDelayMs != null && spec.connect) {
        reconnectTimer = setTimeout(() => {
          if (cancelled) return;
          try {
            bindClient(spec.connect!(spec.url, { clientId: spec.clientId }));
          } catch (error) {
            onUpdate({
              data,
              connection: "error",
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }, spec.reconnectDelayMs);
      }
    });
  };

  try {
    bindClient(connect(spec.url, { clientId: spec.clientId }));
  } catch (error) {
    onUpdate({
      data: {},
      connection: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    return () => {};
  }

  return () => {
    cancelled = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    activeClient.end(true);
  };
}
