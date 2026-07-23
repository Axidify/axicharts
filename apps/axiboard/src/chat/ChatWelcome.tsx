import type { ReactElement } from "react";

type Suggestion =
  | "paste-inventory"
  | "paste-ledger"
  | "paste-projects"
  | "paste-support"
  | "paste-telemetry"
  | "build"
  | "reorder";

const STARTERS: {
  action: Suggestion;
  label: string;
  hint: string;
  icon: string;
  primary?: boolean;
}[] = [
  {
    action: "paste-inventory",
    label: "Inventory sample",
    hint: "Stock levels, reorder points, and SKUs",
    icon: "INV",
    primary: true,
  },
  {
    action: "paste-ledger",
    label: "Ledger sample",
    hint: "Debits, credits, and payment methods",
    icon: "LED",
  },
  {
    action: "paste-projects",
    label: "Project tasks",
    hint: "Owners, status, and priority breakdown",
    icon: "PRJ",
  },
  {
    action: "paste-support",
    label: "Support cases",
    hint: "Severity, status, and issue types",
    icon: "SUP",
  },
  {
    action: "paste-telemetry",
    label: "IoT sensors",
    hint: "Temperature, battery, and device status",
    icon: "IOT",
  },
];

export function ChatWelcome({
  onSuggestion,
  loading,
}: {
  onSuggestion: (action: Suggestion) => void;
  loading: boolean;
}): ReactElement {
  return (
    <div className="axi-welcome">
      <p className="axi-welcome-kicker">Axiboard chat</p>
      <h2 className="axi-welcome-title">Ask a question. Watch the dashboard form.</h2>
      <p className="axi-welcome-sub">
        Paste a table or start from a sample — charts and KPIs build beside the thread.
      </p>
      <div className="axi-suggestions" role="list">
        {STARTERS.map((starter) => (
          <button
            key={starter.action}
            type="button"
            role="listitem"
            className={`axi-starter${starter.primary ? " axi-starter--primary" : ""}`}
            disabled={loading}
            onClick={() => onSuggestion(starter.action)}
          >
            <span className="axi-starter-icon" aria-hidden>
              {starter.icon}
            </span>
            <span className="axi-starter-copy">
              <span className="axi-starter-label">{starter.label}</span>
              <span className="axi-starter-hint">{starter.hint}</span>
            </span>
            <span className="axi-starter-chevron" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
