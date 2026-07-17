import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAiChatProvider, resolvePlannerProviderFromEnv } from "./openai";

describe("createOpenAiChatProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls chat completions and returns message content", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: '{"template":"ops-2x2"}' } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOpenAiChatProvider({ apiKey: "test-key", model: "gpt-4o-mini" });
    const text = await provider.complete("plan this");

    expect(text).toContain("ops-2x2");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer test-key",
        }),
      }),
    );
  });

  it("resolves provider from env keys", () => {
    const provider = resolvePlannerProviderFromEnv({
      OPENAI_API_KEY: "sk-test",
      OPENAI_MODEL: "gpt-4.1-mini",
    });
    expect(provider?.id).toBe("openai");
  });

  it("returns undefined when no API key is configured", () => {
    expect(resolvePlannerProviderFromEnv({})).toBeUndefined();
  });
});
