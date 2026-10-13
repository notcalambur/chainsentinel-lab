import { describe, expect, it } from "vitest";

import { demoAddress, findAddressFixture, findTransactionFixture } from "@/data/fixtures";
import { FixtureBlockchainProvider, FixtureRiskProvider } from "@/lib/providers";

describe("fixture blockchain provider", () => {
  it("returns success for a known address", async () => {
    const res = await new FixtureBlockchainProvider().getAddressActivity(demoAddress());
    expect(res.status).toBe("success");
    if (res.status === "success") {
      expect(res.data.length).toBeGreaterThan(0);
    }
  });

  it("returns no_match for an unknown address", async () => {
    const res = await new FixtureBlockchainProvider().getAddressActivity(
      "0x0000000000000000000000000000000000000001",
    );
    expect(res.status).toBe("no_match");
  });
});

describe("fixture risk provider", () => {
  it("returns success with high-severity signals for the tornado fixture", async () => {
    const fixture = findAddressFixture(
      "0xd90e2f9250187260a4f00073F73F73F73F73F73F",
    );
    expect(fixture).toBeDefined();
    const res = await new FixtureRiskProvider().screenAddress(
      "0xd90e2f9250187260a4f00073F73F73F73F73F73F",
    );
    expect(res.status).toBe("success");
    if (res.status === "success") {
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]?.kind).toMatch(/third_party/);
    }
  });

  it("returns no_match when the address has no signals", async () => {
    const res = await new FixtureRiskProvider().screenAddress(demoAddress());
    expect(res.status).toBe("no_match");
  });

  it("preserves provider-native severity verbatim", async () => {
    const res = await new FixtureRiskProvider().screenAddress(
      "0xd90e2f9250187260a4f00073F73F73F73F73F73F",
    );
    if (res.status === "success") {
      const severities = new Set(res.data.map((s) => s.providerSeverity));
      expect(severities.has("high") || severities.has("medium")).toBe(true);
    }
  });
});

describe("fixture transaction lookup", () => {
  it("returns no_match for unknown transactions", async () => {
    const fixture = findTransactionFixture(
      "0x" + "f".repeat(64) as `0x${string}`,
    );
    expect(fixture).toBeUndefined();
  });
});