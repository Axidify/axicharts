import type { PanelSpec } from "./types";

export type CreateTablePanelInput = {
  intent?: string;
  columns?: Array<{ key: string; label?: string; align?: "left" | "right" }>;
  title?: string;
  compact?: boolean;
};

/** C150 — agent-safe table panel from field list or intent. */
export function createTablePanel(input: CreateTablePanelInput = {}): PanelSpec {
  const columns =
    input.columns ??
    (input.intent
      ?.match(/columns?:\s*([^.]+)/i)?.[1]
      ?.split(",")
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key) => ({ key, label: key })) ??
      []);

  return {
    specVersion: 1,
    type: "table",
    title: input.title ?? "Transactions",
    theme: "clean",
    mode: "interactive",
    props: {
      columns:
        columns.length > 0
          ? columns
          : [
              { key: "date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "debit", label: "Debit", align: "right" },
              { key: "credit", label: "Credit", align: "right" },
            ],
      compact: input.compact ?? true,
      surface: "dark",
    },
  };
}
