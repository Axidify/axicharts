import type { PanelMarkSpec } from "../types";

/**
 * A mark written with the `mark` key (the JSON-schema / RFC spelling) instead
 * of the `type` key that `PanelMarkSpec` models. The mark normalizers accept
 * both (`raw.mark ?? raw.type`), so fixtures use this to keep covering the alias.
 */
export type MarkKeyAliasInput = { mark: string } & Record<string, unknown>;

export function withMarkKeyAlias(marks: MarkKeyAliasInput[]): PanelMarkSpec[] {
  // Deliberately untyped until normalized: PanelMarkSpec has no `mark` key.
  return marks as unknown as PanelMarkSpec[];
}
