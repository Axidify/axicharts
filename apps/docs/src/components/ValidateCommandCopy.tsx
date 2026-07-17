import { useState, type ReactElement } from "react";

const copyButtonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  cursor: "pointer",
  flexShrink: 0,
} as const;

const compactCopyButtonStyle = {
  ...copyButtonStyle,
  fontSize: 11,
  padding: "4px 8px",
} as const;

export function ValidateCommandCopy({
  command,
  label,
  compact = false,
  buttonLabel = "Copy",
}: {
  command: string;
  label?: string;
  compact?: boolean;
  buttonLabel?: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <code style={{ fontSize: 11, color: "#334155", wordBreak: "break-all" }}>{command}</code>
        <button type="button" onClick={() => void copy()} style={compactCopyButtonStyle}>
          {copied ? "Copied" : buttonLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      {label ? (
        <span style={{ fontSize: 12, color: "#64748b", minWidth: 120 }}>{label}</span>
      ) : null}
      <code
        style={{
          flex: 1,
          minWidth: 240,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#f1f5f9",
          color: "#0f172a",
          fontSize: 11,
        }}
      >
        {command}
      </code>
      <button type="button" onClick={() => void copy()} style={copyButtonStyle}>
        {copied ? "Copied" : buttonLabel}
      </button>
    </div>
  );
}
