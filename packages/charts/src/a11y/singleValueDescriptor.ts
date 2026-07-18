import type { SingleValueA11yDescriptor } from "./types";

export type BuildSingleValueA11yInput = {
  title: string;
  value: string;
  description?: string;
};

export function buildSingleValueA11yDescriptor({
  title,
  value,
  description,
}: BuildSingleValueA11yInput): SingleValueA11yDescriptor {
  return {
    kind: "single-value",
    title,
    value,
    description,
  };
}

export function singleValueA11ySummary(descriptor: SingleValueA11yDescriptor): string {
  return `${descriptor.title}: ${descriptor.value}`;
}
