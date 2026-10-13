// Plugin panel types are opt-in; the suite exercises all of them.
// Separate file so it runs after vitest.setup.ts installs DOM shims.
import "./src/entry/plugins";
