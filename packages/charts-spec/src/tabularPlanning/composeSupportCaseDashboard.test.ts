import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { planDashboardFromRows } from "./planDashboardFromRows";
import {
  detectSupportCaseTable,
  suggestSupportCaseAnalytics,
} from "./composeSupportCaseDashboard";

const SUPPORT_CSV = `Case ID,Customer,Product,Issue Type,Severity,Open Date,Status,Satisfaction
CS001,Alpha Sdn Bhd,ERP,Login Issue,Medium,2026-07-15,Closed,5
CS002,Beta Holdings,Mobile App,Crash,High,2026-07-16,In Progress,-
CS003,Gamma Logistics,API,Timeout,Critical,2026-07-17,Closed,4
CS004,Delta Tech,Dashboard,Report Error,Low,2026-07-18,Open,-`;

describe("composeSupportCaseDashboard", () => {
  const rows = parseTabular(SUPPORT_CSV);

  it("detects support case tables", () => {
    const plan = planDashboardFromRows(rows, { persona: "manager" });
    expect(plan).not.toBeNull();
    expect(detectSupportCaseTable(plan!.dataProfile.fieldProfiles ?? [])).toBe(true);
  });

  it("suggests status, severity, issue type charts and case register", () => {
    const profiles = planDashboardFromRows(rows)!.dataProfile.fieldProfiles ?? [];
    const titles = suggestSupportCaseAnalytics(rows, profiles).map((recipe) => recipe.title);
    expect(titles).toContain("Cases by status");
    expect(titles).toContain("Cases by severity");
    expect(titles).toContain("Cases by issue type");
    expect(titles).toContain("Case register");
    expect(titles).not.toContain("Count by Customer");
  });

  it("uses agent compose in planDashboardFromRows generic path", () => {
    const plan = planDashboardFromRows(rows, { persona: "manager" });
    expect(plan?.decisions.some((decision) => decision.api === "composeSupportCaseDashboard")).toBe(true);
    expect(plan?.kpis.some((block) => block.panel.title === "Open cases")).toBe(true);
    expect(plan?.charts.some((block) => block.panel.title === "Cases by severity")).toBe(true);
  });
});
