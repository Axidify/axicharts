import type { ReactElement } from "react";
import { docBodyStyle } from "../styles/docTokens";
import badgeUrl from "../../badge.svg";

const BADGE_MD = `[![Built with AxiCharts](https://axidify.github.io/axicharts/badge.svg)](https://axidify.github.io/axicharts/)`;

const BADGE_HTML = `<a href="https://axidify.github.io/axicharts/" title="Built with AxiCharts">
  <img src="https://axidify.github.io/axicharts/badge.svg" alt="Built with AxiCharts" height="20" />
</a>`;

export function BrandingPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Built with AxiCharts</h1>
      <p style={docBodyStyle()}>
        Optional footer badge for apps using the library. No telemetry — link only.
      </p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
          marginBottom: 24,
        }}
      >
        <img src={badgeUrl} alt="Built with AxiCharts" height={20} />
      </div>

      <h2 style={{ fontSize: 16 }}>Markdown</h2>
      <pre style={{ padding: 12, background: "#f1f5f9", borderRadius: 8, fontSize: 12 }}>
        {BADGE_MD}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>HTML</h2>
      <pre style={{ padding: 12, background: "#f1f5f9", borderRadius: 8, fontSize: 12 }}>
        {BADGE_HTML}
      </pre>
    </div>
  );
}
