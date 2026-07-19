import { describe, expect, it } from "vitest";
import { profileFromCsv } from "../../charts-planner/src/planFromCsv";
import {
  classifyTabularDomain,
  enrichProfileWithDomain,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
} from "./index";

const PIPELINE_TEXT = `| Opportunity ID | Customer | Salesperson | Stage | Value (RM) | Probability | Expected Close | Source |
| OPP-001 | ABC | Amir | Proposal | 85,000 | 70% | 2026-08-15 | Referral |`;

const ATTENDANCE_TEXT = `| Employee ID | Name | Department | Date | Clock In | Clock Out | Hours | Status |
| EMP001 | Amir | IT | 2026-07-18 | 08:52 | 18:10 | 9.3 | Present |`;

const LEDGER_TEXT = `| Date | Transaction ID | Category | Debit (RM) | Credit (RM) | Balance (RM) | Payment Method | Cost Center |
| 2026-07-01 | TXN-001 | Rent | 3500 | 0 | -3500 | Bank Transfer | HQ |`;

describe("C155 classifyTabularDomain", () => {
  it("detects sales from CRM pipeline columns", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const domain = classifyTabularDomain({ fieldProfiles });

    expect(domain.vertical).toBe("sales");
    expect(domain.confidence).toBeGreaterThan(0.7);
    expect(domain.needsReview).toBe(false);
    expect(domain.entities).toEqual(
      expect.arrayContaining(["opportunity", "stage", "salesperson"]),
    );
  });

  it("detects attendance from timesheet columns", () => {
    const rows = parseTabular(ATTENDANCE_TEXT);
    const domain = classifyTabularDomain({ rows });

    expect(domain.vertical).toBe("attendance");
    expect(domain.scores.attendance).toBeGreaterThan(domain.scores.sales);
    expect(domain.entities).toContain("employee");
  });

  it("detects ledger from GL columns", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const domain = classifyTabularDomain({ rows });

    expect(domain.vertical).toBe("ledger");
    expect(domain.signals.some((s) => s.includes("debit+credit"))).toBe(true);
  });

  it("returns generic for unknown columns", () => {
    const domain = classifyTabularDomain({
      fieldProfiles: [
        { name: "foo", role: "dimension" },
        { name: "bar", role: "measure" },
      ],
    });

    expect(domain.vertical).toBe("generic");
    expect(domain.needsReview).toBe(true);
  });

  it("enrichProfileWithDomain tags metrics when confident", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const base = fieldProfilesToDataProfile(fieldProfiles);
    const { profile, domain } = enrichProfileWithDomain({ ...base, fieldProfiles });

    expect(domain.vertical).toBe("sales");
    expect(profile.metrics.every((m) => m.tags?.vertical === "sales")).toBe(true);
  });

  it("does not override explicit vertical tags", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const base = fieldProfilesToDataProfile(fieldProfiles);
    const profile = {
      ...base,
      fieldProfiles,
      metrics: base.metrics.map((m) => ({ ...m, tags: { vertical: "ledger" } })),
    };
    const { profile: enriched, domain } = enrichProfileWithDomain(profile);

    expect(domain.vertical).toBe("sales");
    expect(enriched.metrics[0]?.tags?.vertical).toBe("ledger");
  });

  it("planFromCsv tags vertical without sales keywords in intent", () => {
    const result = profileFromCsv(PIPELINE_TEXT);
    expect(result.domain.vertical).toBe("sales");
    expect(result.metrics.some((m) => m.tags?.vertical === "sales")).toBe(true);
  });
});
