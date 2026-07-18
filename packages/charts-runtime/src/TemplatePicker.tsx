"use client";

import type { ReactElement } from "react";
import { listTemplateMeta } from "@axicharts/charts-spec";
import type { TemplateId } from "@axicharts/charts-spec";

export type TemplatePickerProps = {
  value: TemplateId;
  onChange: (template: TemplateId) => void;
  templates?: TemplateId[];
  label?: string;
};

export function TemplatePicker({
  value,
  onChange,
  templates,
  label = "Template",
}: TemplatePickerProps): ReactElement {
  const meta = listTemplateMeta();
  const options = (templates ?? meta.map((entry) => entry.id as TemplateId)).map((id) => {
    const entry = meta.find((item) => item.id === id);
    return {
      id,
      label: entry?.label ?? id,
    };
  });

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        color: "#475569",
      }}
    >
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TemplateId)}
        style={{
          fontSize: 12,
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#fff",
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
