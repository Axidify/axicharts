import type { WordCloudWord } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

export function wordCloudFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    name?: FieldEncoding;
    value?: FieldEncoding;
  },
): { words: WordCloudWord[] } {
  const fromProps = props.words as WordCloudWord[] | undefined;
  if (fromProps) {
    return { words: fromProps };
  }

  const textField =
    encoding?.name?.field ??
    (props.textField as string | undefined) ??
    "text";
  const valueField =
    encoding?.value?.field ??
    (props.valueField as string | undefined) ??
    "value";

  return {
    words: rows.map((row) => ({
      text: String(row[textField]),
      value: Number(row[valueField]),
      tone: row.tone as WordCloudWord["tone"],
      color: row.color as string | undefined,
    })),
  };
}
