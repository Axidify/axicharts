import type {
  DataSourceSnapshot,
  MqttClientLike,
  MqttDataSourceSpec,
} from "../types";

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

  try {
    activeClient = connect(spec.url, { clientId: spec.clientId });
  } catch (error) {
    onUpdate({
      data: {},
      connection: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    return () => {};
  }

  onUpdate({ data, connection: "connecting" });

  activeClient.on("connect", () => {
    activeClient.subscribe(spec.topic);
    onUpdate({
      data,
      connection: "ready",
      lastUpdatedAt: Date.now(),
    });
  });

  activeClient.on("message", (_topic, payload) => {
    try {
      const chunk = parsePayload(payload);
      data = { ...data, ...chunk };
      onUpdate({
        data,
        connection: "ready",
        lastUpdatedAt: Date.now(),
      });
    } catch {
      // Ignore malformed frames
    }
  });

  activeClient.on("error", () => {
    onUpdate({
      data,
      connection: "error",
      error: "MQTT error",
    });
  });

  activeClient.on("close", () => {
    onUpdate({
      data,
      connection: "error",
      error: "MQTT disconnected",
    });
  });

  return () => {
    activeClient.end(true);
  };
}
