import type { ReactElement } from "react";
import GradientButton from "@/components/kokonutui/gradient-button";

export function ChatWelcome({
  onSuggestion,
  loading,
}: {
  onSuggestion: (action: "paste-inventory" | "paste-ledger" | "paste-projects" | "paste-support" | "paste-telemetry" | "build" | "reorder") => void;
  loading: boolean;
}): ReactElement {
  return (
    <div className="axi-welcome">
      <h2 className="axi-welcome-title">What would you like to explore?</h2>
      <p className="axi-welcome-sub">
        Paste a table or pick a starter — your dashboard builds live on the right.
      </p>
      <div className="axi-suggestions">
        <GradientButton
          type="button"
          label="Inventory sample"
          variant="orange"
          className="h-11 min-w-[180px] disabled:opacity-50"
          disabled={loading}
          onClick={() => onSuggestion("paste-inventory")}
        />
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("paste-telemetry")}
        >
          IoT sensors sample
        </button>
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("paste-support")}
        >
          Support cases sample
        </button>
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("paste-projects")}
        >
          Project tasks sample
        </button>
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("paste-ledger")}
        >
          Ledger sample
        </button>
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("reorder")}
        >
          Below reorder level?
        </button>
        <button
          type="button"
          className="axi-suggestion"
          disabled={loading}
          onClick={() => onSuggestion("build")}
        >
          Build from pasted data
        </button>
      </div>
    </div>
  );
}
