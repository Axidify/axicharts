import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

describe("auth session tokens", () => {
  const secret = "test-secret-at-least-16-chars";

  it("round-trips a signed session", () => {
    const token = createSessionToken("alice", secret);
    const payload = verifySessionToken(token, secret);
    expect(payload?.userId).toBe("alice");
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken("alice", secret);
    expect(verifySessionToken(`${token}x`, secret)).toBeNull();
  });
});
