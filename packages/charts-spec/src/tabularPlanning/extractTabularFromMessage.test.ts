import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { extractTabularFromMessage } from "./extractTabularFromMessage";

describe("extractTabularFromMessage", () => {
  it("extracts pipe table when prose precedes the table", () => {
    const message = `Build a dashboard\n| A | B |\n| 1 | 2 |`;
    const result = extractTabularFromMessage(message);
    expect(result.tabular).toContain("| A | B |");
    expect(result.text).toContain("Build a dashboard");
    expect(parseTabular(result.tabular!).length).toBe(1);
  });

  it("stops at trailing prose after a pipe table", () => {
    const message = `| SKU | Stock |
| A | 1 |

Build a dashboard for this inventory`;
    const result = extractTabularFromMessage(message);
    expect(parseTabular(result.tabular!).length).toBe(1);
    expect(result.text).toContain("Build a dashboard for this inventory");
  });

  it("uses trailing prose as intent when the table comes first", () => {
    const message = `| SKU | Stock |
| WIDGET-01 | 120 |

Build a dashboard for this inventory`;
    const result = extractTabularFromMessage(message);
    expect(result.text).toBe("Build a dashboard for this inventory");
    expect(parseTabular(result.tabular!).length).toBe(1);
  });
});
