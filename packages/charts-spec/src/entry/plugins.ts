/**
 * Opt-in registration for every first-party plugin panel type
 * (sankey, geo, map, gantt, tank, andon). Requires those packages installed.
 *
 *   import "@axicharts/charts-spec/plugins";
 *
 * To pull in a single plugin, import its own register entry instead,
 * e.g. `import "@axicharts/charts-sankey/register"`.
 */
import { registerPluginChartTypes } from "../registerPluginChartTypes";

registerPluginChartTypes();

export { registerPluginChartTypes };
