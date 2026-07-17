import type { ComposableMarkKind } from "./marks";

type MarkComponent = {
  markKind?: ComposableMarkKind;
};

export function readMarkKind(type: unknown): ComposableMarkKind | null {
  if (typeof type === "function" || typeof type === "object") {
    return (type as MarkComponent).markKind ?? null;
  }
  return null;
}
