import { describe, expect, it } from "vitest";
import { cleanTheme } from "./themes";
import { createTheme } from "./createTheme";

describe("createTheme", () => {
  it("merges nested theme tokens", () => {
    const acme = createTheme(cleanTheme, {
      name: "acme",
      bar: { radius: 8, gap: 0.35 },
      line: { strokeWidth: 2.5, curve: "monotone" },
    });

    expect(acme.name).toBe("acme");
    expect(acme.bar.radius).toBe(8);
    expect(acme.line.strokeWidth).toBe(2.5);
    expect(acme.grid.opacity).toBe(cleanTheme.grid.opacity);
  });
});
