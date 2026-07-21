import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import toolsBundle from "../../public/mcp-tools.bundle.json";
import { docBodyStyle } from "../styles/docTokens";

type OpenApiTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  schemaUrl: string;
};

const BUNDLE = toolsBundle as OpenApiTool[];
const BUNDLE_JSON = JSON.stringify(BUNDLE, null, 2);

export function AgentMcpSchemasPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>MCP tool schemas (OpenAPI bundle)</h1>
      <p style={docBodyStyle()}>
        Pasteable tool definitions for LangChain, Vercel AI SDK, or custom orchestrators.
        Prefer MCP when available — same shapes, native discovery.
      </p>

      <h2 style={{ fontSize: 16 }}>Import in TypeScript</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 11,
          lineHeight: 1.5,
          overflow: "auto",
        }}
      >
        {`import { OPENAPI_TOOL_BUNDLE } from "@axicharts/charts-mcp/openapi";

// Or copy public/mcp-tools.bundle.json from the docs site build
for (const tool of OPENAPI_TOOL_BUNDLE) {
  registerFunction(tool.name, tool.inputSchema, tool.description);
}`}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Full bundle (copy)</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        {BUNDLE.length} tools · regenerated on <code>@axicharts/charts-mcp</code> build
      </p>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          fontSize: 10,
          lineHeight: 1.45,
          overflow: "auto",
          maxHeight: 480,
        }}
      >
        {BUNDLE_JSON}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Panel JSON schemas</h2>
      <ul style={{ ...docBodyStyle(), paddingLeft: 20 }}>
        <li>
          <a
            href="https://unpkg.com/@axicharts/charts-spec/schema/cartesian-panel.schema.json"
            target="_blank"
            rel="noreferrer"
          >
            cartesian-panel.schema.json
          </a>
        </li>
        <li>
          <a
            href="https://unpkg.com/@axicharts/charts-spec/schema/data-profile.schema.json"
            target="_blank"
            rel="noreferrer"
          >
            data-profile.schema.json
          </a>
        </li>
        <li>
          <a
            href="https://unpkg.com/@axicharts/charts-spec/schema/distribution-panel.schema.json"
            target="_blank"
            rel="noreferrer"
          >
            distribution-panel.schema.json
          </a>
        </li>
        <li>
          <a
            href="https://unpkg.com/@axicharts/charts-spec/schema/matrix-panel.schema.json"
            target="_blank"
            rel="noreferrer"
          >
            matrix-panel.schema.json
          </a>
        </li>
      </ul>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        <Link to="/guides/agent-families">Agent families tutorial</Link>
        {" · "}
        <Link to="/guides/agent-cartesian">Cartesian deep dive</Link>
        {" · "}
        <a
          href="https://github.com/Axidify/axicharts/tree/main/packages/charts-mcp"
          target="_blank"
          rel="noreferrer"
        >
          charts-mcp README
        </a>
      </p>
    </div>
  );
}
