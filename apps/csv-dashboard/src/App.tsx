import { useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import { planFromIntent } from "@axicharts/charts-planner";
import { Chart } from "@axicharts/charts-spec/cartesian";
import { parseCsv, type CsvRow } from "./lib/csv";
import { profileFromRows } from "./lib/profile";
import { SAMPLE_CSV } from "./sampleData";

const DEFAULT_INTENT = "Static CSV snapshot batch report";

export function App(): ReactElement {
  const [rows, setRows] = useState<CsvRow[]>(() => parseCsv(SAMPLE_CSV));
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [error, setError] = useState<string | null>(null);

  const profile = useMemo(() => profileFromRows(rows), [rows]);
  const plan = useMemo(() => {
    if (profile.metrics.length === 0) return null;
    return planFromIntent(profile, intent);
  }, [profile, intent]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setError("CSV has no data rows.");
        return;
      }
      setRows(parsed);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to read CSV");
    } finally {
      event.target.value = "";
    }
  };

  const loadSample = () => {
    setRows(parseCsv(SAMPLE_CSV));
    setError(null);
  };

  return (
    <main>
      <h1>CSV → dashboard</h1>
      <p className="lead">
        Parse CSV → <code>DataProfile</code> → <code>planFromIntent</code> → per-panel{" "}
        <code>Chart</code>. Docs:{" "}
        <a href="https://axidify.github.io/axicharts/guides/csv-dashboard" target="_blank" rel="noreferrer">
          /guides/csv-dashboard
        </a>
      </p>

      <div className="toolbar">
        <label className="file">
          Upload CSV
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
        </label>
        <button type="button" onClick={loadSample}>
          Load sample
        </button>
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Planner intent"
          style={{
            flex: "1 1 240px",
            minWidth: 200,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(15, 23, 42, 0.9)",
            color: "#e2e8f0",
          }}
        />
      </div>

      {error ? <div className="error">{error}</div> : null}

      <p className="meta">
        {rows.length} rows · {profile.metrics.length} metrics · feed: {plan?.feed ?? "—"} · x
        field:{" "}
        {plan?.panels.find((p) => p.type === "cartesian")?.encoding?.x?.field ?? "—"}
      </p>

      {plan ? (
        <div className="grid">
          {plan.panels.map((panel) => (
            <section key={panel.title} className="panel">
              <h2>{panel.title}</h2>
              <Chart panel={panel} data={{ rows }} height={220} />
            </section>
          ))}
        </div>
      ) : (
        <p className="meta">Add numeric columns to the CSV to generate panels.</p>
      )}
    </main>
  );
}
