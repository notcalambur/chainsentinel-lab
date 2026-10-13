import { describe, expect, it } from "vitest";

import { formatEth, formatTimestamp, formatTokenAmount, transactionLabel } from "@/lib/format";
import type { ChainTransaction } from "@/lib/domain/types";

describe("formatEth", () => {
  it("returns dash for undefined", () => {
    expect(formatEth(undefined)).toBe("—");
  });
  it("formats 1 ETH in wei", () => {
    expect(formatEth("1000000000000000000")).toBe("1 ETH");
  });
  it("formats fractional wei to 6 decimals", () => {
    expect(formatEth("1500000000000000000")).toBe("1.500000 ETH");
  });
  it("falls back to wei text for unparseable input", () => {
    expect(formatEth("not-a-number")).toBe("not-a-number wei");
  });
});

describe("formatTokenAmount", () => {
  it("uses decimals for USDC-like 6-decimal tokens", () => {
    expect(formatTokenAmount("100000000", 6, "USDC")).toBe("100 USDC");
  });
  it("falls back to raw when decimals are missing", () => {
    expect(formatTokenAmount("123", undefined, "XYZ")).toBe("123 XYZ");
  });
});

describe("formatTimestamp", () => {
  it("renders a known ISO date", () => {
    expect(formatTimestamp("2026-09-01T10:14:00Z")).toMatch(/01 (Sep|Sept) 2026/);
  });
  it("returns dash for undefined", () => {
    expect(formatTimestamp(undefined)).toBe("—");
  });
  it("returns the raw string when unparseable", () => {
    expect(formatTimestamp("not-a-date")).toBe("not-a-date");
  });
});

describe("transactionLabel", () => {
  it("uses token transfer summary when present", () => {
    const tx = {
      evidence: { id: "x", kind: "onchain_fact", observedAt: "2026-01-01T00:00:00Z", explanation: "" },
      hash: ("0x" + "0".repeat(64)) as `0x${string}`,
      from: ("0x" + "1".repeat(40)) as `0x${string}`,
      tokenTransfers: [
        {
          tokenAddress: ("0x" + "2".repeat(40)) as `0x${string}`,
          symbol: "USDC",
          amountRaw: "100000000",
          decimals: 6,
          from: ("0x" + "1".repeat(40)) as `0x${string}`,
          to: ("0x" + "3".repeat(40)) as `0x${string}`,
        },
      ],
      valueWei: "0",
    } as unknown as ChainTransaction;
    expect(transactionLabel(tx)).toBe("100 USDC");
  });
  it("falls back to ETH value", () => {
    const tx = {
      evidence: { id: "x", kind: "onchain_fact", observedAt: "2026-01-01T00:00:00Z", explanation: "" },
      hash: ("0x" + "0".repeat(64)) as `0x${string}`,
      from: ("0x" + "1".repeat(40)) as `0x${string}`,
      valueWei: "1000000000000000000",
    } as unknown as ChainTransaction;
    expect(transactionLabel(tx)).toBe("1 ETH");
  });
});