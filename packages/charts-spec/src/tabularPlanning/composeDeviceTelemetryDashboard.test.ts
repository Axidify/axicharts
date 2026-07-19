import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { planDashboardFromRows } from "./planDashboardFromRows";
import {
  detectDeviceTelemetryTable,
  suggestDeviceTelemetryAnalytics,
} from "./composeDeviceTelemetryDashboard";

const TELEMETRY_CSV = `Timestamp,Device ID,Temperature (°C),Humidity (%),Pressure (kPa),Battery (%),Status
2026-07-18 10:00,DEV001,24.8,61,101.2,95,Online
2026-07-18 10:01,DEV002,25.4,58,101.3,91,Online
2026-07-18 10:02,DEV003,31.7,42,100.9,18,Warning
2026-07-18 10:03,DEV004,26.1,56,101.1,87,Online`;

describe("composeDeviceTelemetryDashboard", () => {
  const rows = parseTabular(TELEMETRY_CSV);

  it("detects device telemetry tables", () => {
    const plan = planDashboardFromRows(rows, { persona: "operator" });
    expect(plan).not.toBeNull();
    expect(detectDeviceTelemetryTable(plan!.dataProfile.fieldProfiles ?? [])).toBe(true);
  });

  it("suggests temperature, battery, status charts and readings table", () => {
    const profiles = planDashboardFromRows(rows)!.dataProfile.fieldProfiles ?? [];
    const titles = suggestDeviceTelemetryAnalytics(rows, profiles).map((recipe) => recipe.title);
    expect(titles).toContain("Temperature by device");
    expect(titles).toContain("Battery by device");
    expect(titles).toContain("Devices by status");
    expect(titles).toContain("Device readings");
    expect(titles).not.toContain("Total Temperature (°C)");
  });

  it("uses agent compose in planDashboardFromRows generic path", () => {
    const plan = planDashboardFromRows(rows, { persona: "operator" });
    expect(plan?.decisions.some((decision) => decision.api === "composeDeviceTelemetryDashboard")).toBe(true);
    expect(plan?.kpis.some((block) => block.panel.title === "Peak temperature")).toBe(true);
    expect(plan?.charts.some((block) => block.panel.title === "Humidity by device")).toBe(true);
  });
});
