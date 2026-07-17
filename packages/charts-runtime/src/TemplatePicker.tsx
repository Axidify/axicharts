"use client";

import type { ReactElement } from "react";
import { listTemplates } from "@axicharts/charts-spec";
import type { TemplateId } from "@axicharts/charts-spec";

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  "finance-pnl": "Finance P&L",
  "trading-blotter": "Trading blotter",
  "capacity-grid": "Capacity grid",
  "ops-2x2": "Ops 2×2",
  "line-overview": "Line overview",
  "plugins-wall": "Plugins wall",
};

export type TemplatePickerProps = {
  value: TemplateId;
  onChange: (template: TemplateId) => void;
  templates?: TemplateId[];
  label?: string;
};

export function TemplatePicker({
  value,
  onChange,
  templates = listTemplates(),
  label = "Template",
}: TemplatePickerProps): ReactElement {
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
        {templates.map((template) => (
          <option key={template} value={template}>
            {TEMPLATE_LABELS[template] ?? template}
          </option>
        ))}
      </select>
    </label>
  );
}
