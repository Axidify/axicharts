import opsDashboardShare from "../../../packages/charts-runtime/examples/ops-dashboard.share.json?raw";
import opsEmbedRuntime from "../../../packages/charts-runtime/examples/ops-embed.runtime.json?raw";
import opsMosaicRuntime from "../../../packages/charts-runtime/examples/ops-mosaic.runtime.json?raw";
import opsWorkspaceBundle from "../../../packages/charts-runtime/examples/ops-workspace.workspace.json?raw";

export const LOCAL_IMPORT_FIXTURES: Record<string, string> = {
  "ops-embed.runtime.json": opsEmbedRuntime,
  "ops-mosaic.runtime.json": opsMosaicRuntime,
  "ops-dashboard.share.json": opsDashboardShare,
  "ops-workspace.workspace.json": opsWorkspaceBundle,
};
