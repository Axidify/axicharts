import { describe, expect, it } from "vitest";
import { inferFieldRoles, parseTabular } from "./index";
import {
  computeCardinalities,
  inferGrain,
  inferTimeSpan,
  profileTabular,
} from "./profileTabular";

const LEDGER_TEXT = `| Date | Transaction ID | Category | Debit (RM) | Credit (RM) | Balance (RM) | Payment Method |
| 2026-07-01 | TXN-001 | Rent | 3500 | 0 | -3500 | Bank |
| 2026-07-02 | TXN-002 | Payroll | 12000 | 0 | -15500 | Bank |
| 2026-07-03 | TXN-003 | Sales | 0 | 8500 | -7000 | Cash |`;

const ATTENDANCE_TEXT = `| Employee ID | Name | Department | Date | Hours | Status |
| E001 | Ali | Ops | 2026-07-01 | 8 | Present |
| E002 | Mei | Ops | 2026-07-01 | 7.5 | Present |
| E001 | Ali | Ops | 2026-07-02 | 8 | Present |`;

describe("C165 profileTabular", () => {
  it("infers transaction grain and time span on ledger rows", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const profile = profileTabular(rows);

    expect(profile.grain).toBe("transaction");
    expect(profile.timeSpan?.field).toMatch(/date/i);
    expect(profile.timeSpan?.from).toBe("2026-07-01");
    expect(profile.cardinalities?.["Transaction ID"]).toBe(3);
    expect(profile.cardinalities?.Category).toBeGreaterThan(1);
  });

  it("infers transaction grain when employee id repeats across dates", () => {
    const rows = parseTabular(ATTENDANCE_TEXT);
    const profile = profileTabular(rows);

    expect(profile.grain).toBe("transaction");
    expect(profile.cardinalities?.["Employee ID"]).toBe(2);
    expect(profile.cardinalities?.Date).toBe(2);
  });

  it("computes cardinalities for dimension fields only", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const cardinalities = computeCardinalities(rows, fieldProfiles);

    expect(cardinalities["Debit (RM)"]).toBeUndefined();
    expect(cardinalities.Category).toBe(3);
  });

  it("returns undefined time span when dates are not parseable", () => {
    const rows = [{ Period: "Q1", Amount: 10 }];
    const fieldProfiles = inferFieldRoles(rows);
    expect(inferTimeSpan(rows, fieldProfiles)).toBeUndefined();
    expect(inferGrain(rows, fieldProfiles, computeCardinalities(rows, fieldProfiles))).toBe(
      "unknown",
    );
  });
});
