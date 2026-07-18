import { describe, expect, it } from "vitest";
import { buildMapA11yDescriptor, buildMapA11yTable } from "./mapA11y";

describe("map a11y descriptor", () => {
  it("includes drill path in table caption", () => {
    const descriptor = buildMapA11yDescriptor({
      regions: [
        { name: "California", value: 82 },
        { name: "Washington", value: 47 },
      ],
      drillPath: ["west"],
      drillLabels: ["West"],
    });
    const table = buildMapA11yTable(descriptor);
    expect(table.caption).toContain("West");
    expect(table.rows).toHaveLength(2);
  });
});
