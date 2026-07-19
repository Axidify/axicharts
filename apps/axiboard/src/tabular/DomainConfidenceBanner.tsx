import type { ReactElement } from "react";

export function DomainConfidenceBanner({
  vertical,
  confidence,
  needsReview,
  signals,
}: {
  vertical: string;
  confidence: number;
  needsReview: boolean;
  signals: string[];
}): ReactElement | null {
  if (!needsReview) return null;

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #854d0e",
        background: "#422006",
        fontSize: 12,
        color: "#fde68a",
        lineHeight: 1.5,
      }}
    >
      <strong>Domain review:</strong> classified as <code>{vertical}</code> at{" "}
      {Math.round(confidence * 100)}% confidence.
      {signals.length > 0 ? (
        <>
          {" "}
          Signals: {signals.slice(0, 4).join(", ")}.
        </>
      ) : null}
    </div>
  );
}
