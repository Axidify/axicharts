import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

const STORYBOOK_TEMPLATE_GALLERY =
  "http://localhost:6006/?path=/story/spec-template-gallery--all-templates";
const STORYBOOK_COMMUNITY_SLOT =
  "http://localhost:6006/?path=/story/spec-template-gallery--community-slot";

const codeBlock = {
  padding: 14,
  borderRadius: docRadii.md,
  fontSize: 11,
  lineHeight: 1.5,
  overflow: "auto" as const,
  background: "#0f172a",
  color: "#e2e8f0",
};

const REGISTER_EXAMPLE = `import { registerDashboardTemplate } from "@axicharts/charts-spec";

registerDashboardTemplate({
  id: "my-saas-overview",
  label: "My SaaS overview",
  vertical: "custom",
  render: () => <MyDashboardLayout />,
});`;

const WORKED_EXAMPLE = `import type { ReactElement } from "react";
import {
  registerDashboardTemplate,
  compileTemplate,
  listTemplateMeta,
} from "@axicharts/charts-spec";

// 1. Register once at app bootstrap (before planner / gallery UI)
registerDashboardTemplate({
  id: "acme-ops-wall",
  label: "Acme ops wall",
  vertical: "ops",
  render: (ctx) =>
    compileTemplate("ops-2x2", ctx.data, {
      theme: "live",
      mode: "live",
    }),
});

// 2. Surface in template picker
export function TemplatePicker(): ReactElement {
  const templates = listTemplateMeta();
  return (
    <ul>
      {templates.map((t) => (
        <li key={t.id}>
          {t.label} — {t.source}
        </li>
      ))}
    </ul>
  );
}`;

export function CommunityTemplatesPage(): ReactElement {
  return (
    <div>
      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>Community dashboard templates</h1>
        <p style={docBodyStyle()}>
          Register third-party dashboard layouts at runtime with{" "}
          <code>registerDashboardTemplate</code> — no fork of <code>@axicharts/charts-spec</code>.
          Builtins (<code>ops-2x2</code>, <code>finance-pnl</code>, <code>sre-incident</code>, etc.)
          and community slots share the same <code>listTemplateMeta</code> /{" "}
          <code>suggestTemplate</code> API.
        </p>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          <Link to="/shadcn" style={{ color: docColors.accent }}>
            shadcn migration gallery
          </Link>
          {" · "}
          <a href={STORYBOOK_TEMPLATE_GALLERY} style={{ color: docColors.accent }}>
            Storybook — Template gallery
          </a>
          {" · "}
          <a href={STORYBOOK_COMMUNITY_SLOT} style={{ color: docColors.accent }}>
            CommunitySlot demo
          </a>
        </p>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>How registration works</h2>
        <ol style={{ ...docBodyStyle(), paddingLeft: 20 }}>
          <li>
            Call <code>registerDashboardTemplate</code> during app init with a stable <code>id</code>
            , human <code>label</code>, optional <code>vertical</code>, and a <code>render</code>{" "}
            function.
          </li>
          <li>
            <code>listTemplateMeta()</code> returns builtins plus community entries (source:{" "}
            <code>community</code>).
          </li>
          <li>
            <code>suggestTemplate(intent)</code> and the planner can match your template from
            natural-language intent when <code>vertical</code> aligns.
          </li>
          <li>
            <code>compileTemplate(id, data, options)</code> renders builtins; community templates use
            their custom <code>render</code> callback.
          </li>
        </ol>
        <pre style={codeBlock}>{REGISTER_EXAMPLE}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Worked example</h2>
        <p style={docBodyStyle()}>
          Full reference:{" "}
          <code>packages/charts-spec/examples/community-template.example.md</code> in the axicharts
          repo. Wrap a builtin layout or ship a bespoke React tree.
        </p>
        <pre style={{ ...codeBlock, maxHeight: 360 }}>{WORKED_EXAMPLE}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Storybook gallery</h2>
        <p style={docBodyStyle()}>
          Run <code>pnpm storybook</code> and open <strong>Spec/Template gallery</strong>. The{" "}
          <strong>CommunitySlot</strong> story registers a demo template at runtime and lists it
          beside builtins — same code path as production embeds.
        </p>
        <ul style={{ ...docBodyStyle(), marginBottom: 0 }}>
          <li>
            <a href={STORYBOOK_TEMPLATE_GALLERY} style={{ color: docColors.accent }}>
              AllTemplates
            </a>{" "}
            — every builtin vertical
          </li>
          <li>
            <a href={STORYBOOK_COMMUNITY_SLOT} style={{ color: docColors.accent }}>
              CommunitySlot
            </a>{" "}
            — runtime registration demo
          </li>
        </ul>
      </div>
    </div>
  );
}
