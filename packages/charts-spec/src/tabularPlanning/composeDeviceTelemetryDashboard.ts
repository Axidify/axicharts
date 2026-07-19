import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { cellNumber, findNamedField } from "./enrich/types";
import { detectIncidentTable } from "./composeIncidentDashboard";
import { detectProjectTaskTable } from "./composeProjectTaskDashboard";
import { detectSupportCaseTable } from "./composeSupportCaseDashboard";

const WARNING_STATUS = /warning|alert|critical|offline|fault|error/i;

export function detectDeviceTelemetryTable(fieldProfiles: FieldProfile[]): boolean {
  if (detectProjectTaskTable(fieldProfiles)) return false;
  if (detectSupportCaseTable(fieldProfiles)) return false;
  if (detectIncidentTable(fieldProfiles)) return false;

  const names = fieldProfiles.map((profile) => profile.name.toLowerCase());
  const hasDevice = names.some((name) => /device\s*id|\bdevice\b|sensor\s*id|gateway/.test(name));
  const hasTime = names.some((name) => /timestamp|datetime|recorded|observed/.test(name));
  const measureCount = fieldProfiles.filter((profile) => profile.role === "measure").length;
  const hasSensorSignal = names.some((name) =>
    /temperature|humidity|pressure|battery|voltage|current|rpm|flow/.test(name),
  );

  return hasDevice && hasTime && measureCount >= 2 && hasSensorSignal;
}

function avgField(rows: Record<string, unknown>[], field: string): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + cellNumber(row, field), 0);
  return Math.round((total / rows.length) * 10) / 10;
}

function maxField(rows: Record<string, unknown>[], field: string): number {
  return rows.reduce((max, row) => Math.max(max, cellNumber(row, field)), Number.NEGATIVE_INFINITY);
}

function rowsByDevice(
  rows: Record<string, unknown>[],
  deviceField: string,
  valueField: string,
  label: string,
): Record<string, unknown>[] {
  return rows.map((row) => ({
    Device: String(row[deviceField] ?? ""),
    [label]: cellNumber(row, valueField),
  }));
}

/**
 * Agent-style compose for IoT / device telemetry snapshots.
 */
export function suggestDeviceTelemetryAnalytics(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const deviceField = findNamedField(fieldProfiles, /device\s*id|\bdevice\b|sensor\s*id/i);
  const statusField = findNamedField(fieldProfiles, /status|state|health/i);
  const temperatureField = findNamedField(fieldProfiles, /temperature|temp/i);
  const humidityField = findNamedField(fieldProfiles, /humidity/i);
  const batteryField = findNamedField(fieldProfiles, /battery/i);
  const pressureField = findNamedField(fieldProfiles, /pressure/i);

  if (!deviceField) return [];

  const warningCount = statusField
    ? rows.filter((row) => WARNING_STATUS.test(String(row[statusField] ?? ""))).length
    : 0;
  const lowBatteryCount = batteryField
    ? rows.filter((row) => cellNumber(row, batteryField) > 0 && cellNumber(row, batteryField) < 20).length
    : 0;
  const avgTemp = temperatureField ? avgField(rows, temperatureField) : 0;
  const maxTemp = temperatureField ? maxField(rows, temperatureField) : 0;

  const recipes: PanelRecipe[] = [
    {
      questionId: "agent.telemetry.kpi.devices",
      title: "Devices",
      intent: "reporting device count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: rows.length,
      kpiLabel: "Devices",
    },
  ];

  if (statusField && warningCount > 0) {
    recipes.push({
      questionId: "agent.telemetry.kpi.warnings",
      title: "Warnings",
      intent: "devices in warning or alert state",
      panelType: "stat",
      vertical: "ops",
      kpiValue: warningCount,
      kpiLabel: "Warnings",
    });
  }

  if (temperatureField) {
    recipes.push({
      questionId: "agent.telemetry.kpi.avg_temp",
      title: "Avg temperature",
      intent: "mean temperature across devices",
      panelType: "stat",
      vertical: "ops",
      kpiValue: avgTemp,
      kpiLabel: "Avg °C",
    });
    recipes.push({
      questionId: "agent.telemetry.kpi.max_temp",
      title: "Peak temperature",
      intent: "highest device temperature",
      panelType: "stat",
      vertical: "ops",
      kpiValue: maxTemp,
      kpiLabel: "Peak °C",
    });
  }

  if (batteryField && lowBatteryCount > 0) {
    recipes.push({
      questionId: "agent.telemetry.kpi.low_battery",
      title: "Low battery",
      intent: "devices below 20% battery",
      panelType: "stat",
      vertical: "ops",
      kpiValue: lowBatteryCount,
      kpiLabel: "Low battery",
    });
  }

  if (statusField) {
    recipes.push({
      questionId: "agent.telemetry.chart.status",
      title: "Devices by status",
      intent: "status breakdown bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: statusField,
      xField: statusField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  if (temperatureField) {
    recipes.push({
      questionId: "agent.telemetry.chart.temperature",
      title: "Temperature by device",
      intent: "device temperature bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      preparedRows: rowsByDevice(rows, deviceField, temperatureField, "Temperature (°C)"),
      xField: "Device",
      yField: "Temperature (°C)",
    });
  }

  if (batteryField) {
    recipes.push({
      questionId: "agent.telemetry.chart.battery",
      title: "Battery by device",
      intent: "device battery level bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      preparedRows: rowsByDevice(rows, deviceField, batteryField, "Battery (%)"),
      xField: "Device",
      yField: "Battery (%)",
    });
  }

  if (humidityField) {
    recipes.push({
      questionId: "agent.telemetry.chart.humidity",
      title: "Humidity by device",
      intent: "device humidity bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      preparedRows: rowsByDevice(rows, deviceField, humidityField, "Humidity (%)"),
      xField: "Device",
      yField: "Humidity (%)",
    });
  } else if (pressureField) {
    recipes.push({
      questionId: "agent.telemetry.chart.pressure",
      title: "Pressure by device",
      intent: "device pressure bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      preparedRows: rowsByDevice(rows, deviceField, pressureField, "Pressure (kPa)"),
      xField: "Device",
      yField: "Pressure (kPa)",
    });
  }

  recipes.push({
    questionId: "agent.telemetry.table.readings",
    title: "Device readings",
    intent: "latest telemetry register",
    panelType: "table",
    vertical: "ops",
    preparedRows: rows,
    tableColumns: fieldProfiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
      align: profile.role === "measure" ? "right" : "left",
    })),
  });

  return recipes;
}
