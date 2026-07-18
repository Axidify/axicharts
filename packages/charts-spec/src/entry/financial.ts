import { registerCategory } from "../panelCategories";

registerCategory("financial");

export { compilePanel, type CompileOptions } from "../compilePanel";
export { Chart, Dashboard, type ChartProps, type DashboardProps } from "../Chart";
export { ejectPanel } from "../eject";
export {
  registerCategory,
  clearCategoryRegistration,
  listRegisteredCategories,
  type PanelCategory,
} from "../panelCategories";
