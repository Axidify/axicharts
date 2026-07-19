import { describe, expect, it } from "vitest";
import { aggregateRows } from "./aggregateRows";
import { inferFieldRoles } from "./inferFieldRoles";

const LEDGER_ROWS = [
  {
    Date: "2026-07-01",
    Category: "Sales",
    "Debit (RM)": 0,
    "Credit (RM)": 8500,
    "Payment Method": "Bank Transfer",
  },
  {
    Date: "2026-07-02",
    Category: "Office Expense",
    "Debit (RM)": 3500,
    "Credit (RM)": 0,
    "Payment Method": "Bank Transfer",
  },
  {
    Date: "2026-07-05",
    Category: "Software",
    "Debit (RM)": 320,
    "Credit (RM)": 0,
    "Payment Method": "Credit Card",
  },
];

describe("inferFieldRoles", () => {
  it("assigns ledger column roles", () => {
    const roles = inferFieldRoles(LEDGER_ROWS);
    expect(roles.find((r) => r.name === "Date")?.role).toBe("time");
    expect(roles.find((r) => r.name === "Category")?.role).toBe("dimension");
    expect(roles.find((r) => r.name === "Debit (RM)")?.role).toBe("measure");
    expect(roles.find((r) => r.name === "Payment Method")?.role).toBe("dimension");
  });
});

describe("aggregateRows", () => {
  it("groups payment method volume", () => {
    const rows = aggregateRows(LEDGER_ROWS, {
      groupBy: "Payment Method",
      aggregates: {
        volume: { op: "sum", fields: ["Debit (RM)", "Credit (RM)"] },
        debit: { op: "sum", field: "Debit (RM)" },
      },
    });

    const bank = rows.find((r) => r["Payment Method"] === "Bank Transfer");
    expect(bank?.volume).toBe(12000);
    expect(bank?.debit).toBe(3500);
  });
});
