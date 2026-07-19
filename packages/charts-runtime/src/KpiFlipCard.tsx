"use client";

import { useCallback, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { TabularPlanDecision } from "./types";

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

const faceStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid rgba(255, 255, 255, 0.06)",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const frontFaceStyle: CSSProperties = {
  ...faceStyle,
  background: "rgba(255, 255, 255, 0.03)",
  padding: "14px 16px",
};

const backFaceStyle: CSSProperties = {
  ...faceStyle,
  position: "absolute",
  inset: 0,
  transform: "rotateY(180deg)",
  background: "linear-gradient(145deg, rgba(217, 119, 87, 0.12) 0%, rgba(255, 255, 255, 0.05) 55%)",
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 6,
  overflow: "hidden",
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
      <div className={className} style={{ ...shellStyle, cursor: "default", ...style, minHeight: 88 }}>
        <div style={frontFaceStyle}>{children}</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={{ ...shellStyle, ...style }}
      onClick={toggle}
      aria-pressed={flipped}
      aria-label={flipped ? `Hide details for ${title ?? "metric"}` : `Show how ${title ?? "metric"} was computed`}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 88,
          transition: "transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div style={frontFaceStyle}>{children}</div>
        <div style={backFaceStyle}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#d97757",
            }}
          >
            How this was built
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.45, color: "#ececec" }}>{copy!.body}</div>
          {copy!.hint ? (
            <div style={{ fontSize: 10, color: "#a1a1a1", lineHeight: 1.35 }}>{copy!.hint}</div>
          ) : null}
          {questionId ? (
            <div style={{ fontSize: 9, fontFamily: "ui-monospace, monospace", color: "#737373" }}>
              {questionId}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
