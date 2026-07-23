"use client";

import { useCallback, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { TabularPlanDecision } from "./types";
import "./KpiFlipCard.css";

export type KpiFlipCardProps = {
  title?: string;
  questionId?: string;
  rationale?: string;
  intent?: string;
  decisions?: TabularPlanDecision[];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const shellStyle: CSSProperties = {
  flex: "1 1 160px",
  minWidth: 140,
  minHeight: 96,
  perspective: 1000,
  cursor: "pointer",
  border: "none",
  padding: 0,
  background: "transparent",
  textAlign: "left",
  font: "inherit",
  color: "inherit",
};

export function resolveKpiRationale(
  title: string | undefined,
  questionId: string | undefined,
  rationale: string | undefined,
  intent: string | undefined,
  decisions: TabularPlanDecision[] | undefined,
): { body: string; hint?: string } | null {
  if (rationale?.trim()) {
    return { body: rationale.trim(), hint: intent?.trim() || undefined };
  }
  if (!decisions?.length || !title) return null;

  const normalizedTitle = title.toLowerCase();
  const match =
    decisions.find((decision) => decision.step.toLowerCase().includes(normalizedTitle)) ??
    (questionId
      ? decisions.find((decision) => decision.step.toLowerCase().includes(questionId.toLowerCase()))
      : undefined);

  if (!match) return null;
  return {
    body: match.notes?.trim() || match.intent?.trim() || "Planned by the dashboard agent.",
    hint: match.intent?.trim() || match.api,
  };
}

export function KpiFlipCard({
  title,
  questionId,
  rationale,
  intent,
  decisions,
  children,
  className,
  style,
}: KpiFlipCardProps): ReactElement {
  const [flipped, setFlipped] = useState(false);
  const copy = resolveKpiRationale(title, questionId, rationale, intent, decisions);
  const canFlip = Boolean(copy);

  const toggle = useCallback(() => {
    if (!canFlip) return;
    setFlipped((current) => !current);
  }, [canFlip]);

  if (!canFlip) {
    return (
      <div
        className={["axi-kpi-flip", "axi-kpi-flip--static", className].filter(Boolean).join(" ")}
        style={{ ...shellStyle, cursor: "default", ...style, minHeight: 88 }}
      >
        <div className="axi-kpi-flip__face axi-kpi-flip__face--front">{children}</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={["axi-kpi-flip", flipped ? "axi-kpi-flip--flipped" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...shellStyle, ...style }}
      onClick={toggle}
      aria-pressed={flipped}
      aria-label={flipped ? `Hide details for ${title ?? "metric"}` : `Show how ${title ?? "metric"} was computed`}
    >
      <div className="axi-kpi-flip__scene">
        <div className="axi-kpi-flip__face axi-kpi-flip__face--front">{children}</div>
        <div className="axi-kpi-flip__face axi-kpi-flip__face--back" aria-hidden={!flipped}>
          <div className="axi-kpi-flip__eyebrow">How this was built</div>
          <div className="axi-kpi-flip__body">{copy!.body}</div>
          {copy!.hint ? <div className="axi-kpi-flip__hint">{copy!.hint}</div> : null}
          {questionId ? <div className="axi-kpi-flip__id">{questionId}</div> : null}
        </div>
      </div>
    </button>
  );
}
