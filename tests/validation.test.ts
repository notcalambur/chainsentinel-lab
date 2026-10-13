import { describe, expect, it } from "vitest";
import { getAddress } from "viem";

import { validateInput, truncateMiddle } from "@/lib/validation";

describe("validateInput", () => {
  it("accepts a checksummed address and returns the same checksum", () => {
    const checksum = getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    const res = validateInput(checksum);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.type).toBe("address");
      expect(res.checksummed).toBe(checksum);
    }
  });

  it("lowercases an all-lowercase address and re-checksums it", () => {
    const res = validateInput("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.type).toBe("address");
      expect(res.checksummed).toBe(
        getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"),
      );
    }
  });

  it("rejects an address with the wrong length", () => {
    const res = validateInput("0xd8da6bf26964af9d7eed9e03e53415d37aa9604");
    expect(res.ok).toBe(false);
  });

  it("rejects non-hex characters in an address", () => {
    const res = validateInput("0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
    expect(res.ok).toBe(false);
  });

  it("accepts a 32-byte transaction hash", () => {
    const hash = "0x" + "a".repeat(64);
    const res = validateInput(hash);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.type).toBe("transaction");
      expect(res.checksummed).toBe(hash);
    }
  });

  it("rejects a 31-byte hash (off by one)", () => {
    const res = validateInput("0x" + "a".repeat(62));
    expect(res.ok).toBe(false);
  });

  it("rejects empty input", () => {
    const res = validateInput("   ");
    expect(res.ok).toBe(false);
  });

  it("prefers transaction-hash shape over address when both could match", () => {
    // 64-hex always parses as hash; addresses (40-hex) never do.
    const res = validateInput("0x" + "b".repeat(64));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.type).toBe("transaction");
  });
});

describe("truncateMiddle", () => {
  it("returns the input unchanged when short enough", () => {
    expect(truncateMiddle("0xabc")).toBe("0xabc");
  });
  it("inserts an ellipsis in the middle for long strings", () => {
    const long = "0x" + "a".repeat(40);
    const out = truncateMiddle(long);
    expect(out).toContain("…");
    expect(out.length).toBeLessThan(long.length);
  });
});