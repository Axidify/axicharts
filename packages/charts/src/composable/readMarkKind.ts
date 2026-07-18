import type { ComposableMarkKind } from "./marks";
import type { GraphicMarkKind } from "../graphic/graphicMarks";

type MarkKind = ComposableMarkKind | GraphicMarkKind;

type MarkComponent = {
  markKind?: MarkKind;
};

export function readMarkKind(type: unknown): MarkKind | null {
  if (typeof type === "function" || typeof type === "object") {
    return (type as MarkComponent).markKind ?? null;
  }
  return null;
}
