import { describe, expect, it } from "vitest";
import { createElement } from "react";
import "./templates";
import {
  clearCommunityTemplates,
  getTemplateRenderer,
  isRegisteredTemplate,
  listTemplateMeta,
  listTemplates,
  registerDashboardTemplate,
} from "./templateRegistry";

describe("templateRegistry", () => {
  it("lists builtin templates including C91 verticals", () => {
    expect(listTemplates()).toContain("sre-incident");
    expect(listTemplates()).toContain("saas-growth");
    expect(listTemplates()).toContain("program-dashboard");
  });

  it("registers community templates without forking builtins", () => {
    clearCommunityTemplates();
    registerDashboardTemplate({
      id: "demo-community",
      label: "Demo community",
      vertical: "custom",
      render: () => createElement("div", null, "community"),
    });

    expect(isRegisteredTemplate("demo-community")).toBe(true);
    expect(getTemplateRenderer("demo-community")?.({}, "clean")).toBeTruthy();
    expect(listTemplateMeta().some((entry) => entry.id === "demo-community" && entry.source === "community")).toBe(
      true,
    );
    clearCommunityTemplates();
  });

  it("rejects duplicate community ids", () => {
    clearCommunityTemplates();
    registerDashboardTemplate({
      id: "dup-template",
      label: "One",
      render: () => createElement("div", null, "one"),
    });
    expect(() =>
      registerDashboardTemplate({
        id: "dup-template",
        label: "Two",
        render: () => createElement("div", null, "two"),
      }),
    ).toThrow(/already registered/);
    clearCommunityTemplates();
  });
});
