# Community dashboard template (GTM-1)

Register a third-party layout without forking `@axicharts/charts-spec`.

```ts
import { registerDashboardTemplate } from "@axicharts/charts-spec";

registerDashboardTemplate({
  id: "my-saas-overview",
  label: "My SaaS overview",
  vertical: "custom",
  render: () => <MyDashboardLayout />,
});
```

After registration, `listTemplateMeta()` and `suggestTemplate()` can surface your template alongside builtins (`ops-2x2`, `finance-pnl`, `sre-incident`, etc.).

**Storybook:** `Spec/Template gallery` → `CommunitySlot` — runtime registration demo.

**Docs:** https://axidify.github.io/axicharts/shadcn
