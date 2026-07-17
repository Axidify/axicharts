import { connectHistorianSource } from "./adapters/historian";
import { connectMockLiveSource } from "./adapters/mockLive";
import { connectMqttSource } from "./adapters/mqtt";
import { connectRestSource } from "./adapters/rest";
import { connectStaticSource } from "./adapters/static";
import { connectWebSocketSource } from "./adapters/websocket";
import type { DataSourceSnapshot, DataSourceSpec } from "./types";

export function connectSource(
  spec: DataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  switch (spec.type) {
    case "static":
      return connectStaticSource(spec, onUpdate);
    case "rest":
      return connectRestSource(spec, onUpdate);
    case "websocket":
      return connectWebSocketSource(spec, onUpdate);
    case "mock-live":
      return connectMockLiveSource(spec, onUpdate);
    case "mqtt":
      return connectMqttSource(spec, onUpdate);
    case "historian":
      return connectHistorianSource(spec, onUpdate);
    default:
      return () => {};
  }
}
