import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState, type ReactElement } from "react";
import {
  createDefaultWorkspaceStore,
  getActiveDashboard,
  parseDashboardSpec,
  type RuntimeDashboardSpec,
  type SavedDashboard,
} from "@axicharts/charts-runtime";
import opsDashboardShare from "../../../packages/charts-runtime/examples/ops-dashboard.share.json?raw";
import opsWorkspaceBundle from "../../../packages/charts-runtime/examples/ops-workspace.workspace.json?raw";
import { ImportDialog } from "../../dashboarder/src/ImportDialog";
import { ShareDialog } from "../../dashboarder/src/ShareDialog";

const SEED_SPEC: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    title: "Line 3",
    template: "ops-2x2",
    theme: "industrial",
  },
};

const PLANNER_META: NonNullable<SavedDashboard["meta"]> = {
  layout: "embed",
  feed: "rest",
  template: "ops-2x2",
  presentation: false,
};

function useShareFixtures(meta: SavedDashboard["meta"] = PLANNER_META) {
  return useMemo(() => {
    const store = createDefaultWorkspaceStore(SEED_SPEC);
    const base = getActiveDashboard(store);
    const dashboard: SavedDashboard = { ...base, meta };
    const spec = parseDashboardSpec(dashboard);
    return { store, dashboard, spec, meta };
  }, [meta]);
}

function ShareDialogFixture({
  initialTab = "dashboard",
}: {
  initialTab?: "dashboard" | "workspace";
}): ReactElement {
  const [open, setOpen] = useState(true);
  const { store, dashboard, spec, meta } = useShareFixtures();

  return (
    <ShareDialog
      open={open}
      initialTab={initialTab}
      store={store}
      dashboard={dashboard}
      spec={spec}
      meta={meta}
      onClose={() => setOpen(false)}
    />
  );
}

function ImportDialogFixture({
  initialJson,
  initialFilename,
}: {
  initialJson: string;
  initialFilename: string;
}): ReactElement {
  const [open, setOpen] = useState(true);

  return (
    <ImportDialog
      open={open}
      initialJson={initialJson}
      initialFilename={initialFilename}
      onClose={() => setOpen(false)}
      onApply={() => setOpen(false)}
    />
  );
}

const meta = {
  title: "Dashboarder/Share ↔ Import",
  tags: ["!dev", "!test"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "C43 Dashboarder share export and import dialogs — planner meta preview on export and restore hints on import.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShareDashboardWithMeta: Story = {
  render: (): ReactElement => <ShareDialogFixture initialTab="dashboard" />,
};

export const ShareWorkspaceBundle: Story = {
  render: (): ReactElement => <ShareDialogFixture initialTab="workspace" />,
};

export const ImportDashboardMetaRestore: Story = {
  render: (): ReactElement => (
    <ImportDialogFixture
      initialJson={opsDashboardShare}
      initialFilename="ops-dashboard.share.json"
    />
  ),
};

export const ImportWorkspaceMetaRestore: Story = {
  render: (): ReactElement => (
    <ImportDialogFixture
      initialJson={opsWorkspaceBundle}
      initialFilename="ops-workspace.workspace.json"
    />
  ),
};
