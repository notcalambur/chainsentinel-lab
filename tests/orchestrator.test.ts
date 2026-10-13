import { describe, expect, it } from "vitest";

import { aggregateStatus, runInvestigation } from "@/lib/orchestrator";
import type {
  BlockchainDataProvider,
  ChainTransaction,
  ProviderResult,
  RiskSignal,
  RiskSignalProvider,
} from "@/lib/domain/types";
import type { Address, Hash } from "viem";

const SAMPLE_ADDRESS: Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

function makeTx(hash: string): ChainTransaction {
  return {
    hash: hash as Hash,
    from: SAMPLE_ADDRESS,
    to: SAMPLE_ADDRESS,
    valueWei: "0",
    evidence: {
      id: `e:${hash}`,
      kind: "onchain_fact",
      observedAt: "2026-01-01T00:00:00Z",
      explanation: "stub",
    },
  };
}

class StubChain implements BlockchainDataProvider {
  readonly id = "stub-chain";
  constructor(private readonly res: ProviderResult<ChainTransaction[]> | (() => Promise<ProviderResult<ChainTransaction[]>>)) {}
  async getAddressActivity(): Promise<ProviderResult<ChainTransaction[]>> {
    return typeof this.res === "function" ? await this.res() : this.res;
  }
  async getTransaction(): Promise<ProviderResult<ChainTransaction>> {
    return {
      status: "success",
      data: makeTx("0x" + "0".repeat(64)),
      checkedAt: "2026-01-01T00:00:00Z",
      sourceId: this.id,
    };
  }
}

class StubRisk implements RiskSignalProvider {
  readonly id = "stub-risk";
  constructor(private readonly res: ProviderResult<RiskSignal[]> | (() => Promise<ProviderResult<RiskSignal[]>>)) {}
  async screenAddress(): Promise<ProviderResult<RiskSignal[]>> {
    return typeof this.res === "function" ? await this.res() : this.res;
  }
  async healthCheck(): Promise<{ ok: boolean; checkedAt: string }> {
    return { ok: true, checkedAt: "2026-01-01T00:00:00Z" };
  }
}

class FailingChain implements BlockchainDataProvider {
  readonly id = "failing-chain";
  async getAddressActivity(): Promise<ProviderResult<ChainTransaction[]>> {
    throw new Error("boom");
  }
  async getTransaction(): Promise<ProviderResult<ChainTransaction>> {
    return { status: "no_match", checkedAt: "2026-01-01T00:00:00Z", sourceId: this.id };
  }
}

class HangingRisk implements RiskSignalProvider {
  readonly id = "hanging-risk";
  async screenAddress(): Promise<ProviderResult<RiskSignal[]>> {
    return new Promise<never>(() => {
      /* never resolves; orchestrator timeout must catch */
    });
  }
  async healthCheck(): Promise<{ ok: boolean; checkedAt: string }> {
    return { ok: true, checkedAt: "2026-01-01T00:00:00Z" };
  }
}

describe("aggregateStatus", () => {
  it("returns complete when every provider is complete", () => {
    expect(
      aggregateStatus([
        { providerId: "a", status: "complete" },
        { providerId: "b", status: "complete" },
      ]),
    ).toBe("complete");
  });
  it("returns partial when one is complete and one is unavailable", () => {
    expect(
      aggregateStatus([
        { providerId: "a", status: "complete" },
        { providerId: "b", status: "unavailable" },
      ]),
    ).toBe("partial");
  });
  it("returns not_configured when no providers are configured", () => {
    expect(aggregateStatus([])).toBe("not_configured");
  });
});

describe("runInvestigation - address path", () => {
  it("aggregates partial status when one source fails", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "address",
      subject: SAMPLE_ADDRESS,
      blockchain: new StubChain({
        status: "success",
        data: [makeTx("0x" + "1".repeat(64))],
        checkedAt: "2026-01-01T00:00:00Z",
        sourceId: "stub-chain",
      }),
      risk: new StubRisk({
        status: "unavailable",
        sourceId: "stub-risk",
        checkedAt: "2026-01-01T00:00:00Z",
        error: "timeout",
        message: "timeout",
      }),
    });
    const chainCov = partial.providerCoverage.find((c) => c.providerId === "stub-chain");
    const riskCov = partial.providerCoverage.find((c) => c.providerId === "stub-risk");
    expect(chainCov?.status).toBe("complete");
    expect(riskCov?.status).toBe("unavailable");
    expect(partial.transactions.length).toBe(1);
    expect(partial.signals.length).toBe(0);
  });

  it("marks provider not_configured when risk provider is omitted", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "address",
      subject: SAMPLE_ADDRESS,
      blockchain: new StubChain({
        status: "success",
        data: [],
        checkedAt: "2026-01-01T00:00:00Z",
        sourceId: "stub-chain",
      }),
    });
    const riskCov = partial.providerCoverage.find((c) => c.providerId === "risk");
    expect(riskCov?.status).toBe("not_configured");
  });

  it("distinguishes no_match from unavailable", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "address",
      subject: SAMPLE_ADDRESS,
      blockchain: new StubChain({
        status: "no_match",
        checkedAt: "2026-01-01T00:00:00Z",
        sourceId: "stub-chain",
      }),
    });
    const chainCov = partial.providerCoverage.find((c) => c.providerId === "stub-chain");
    expect(chainCov?.status).toBe("complete");
    expect(chainCov?.message).toMatch(/No signal found in sources checked/);
  });

  it("catches synchronous chain failures without losing the response shape", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "address",
      subject: SAMPLE_ADDRESS,
      blockchain: new FailingChain(),
    });
    const chainCov = partial.providerCoverage.find((c) => c.providerId === "failing-chain");
    expect(chainCov?.status).toBe("unavailable");
    expect(partial.transactions.length).toBe(0);
  });

  it("catches hanging risk provider via the timeout", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "address",
      subject: SAMPLE_ADDRESS,
      blockchain: new StubChain({
        status: "success",
        data: [],
        checkedAt: "2026-01-01T00:00:00Z",
        sourceId: "stub-chain",
      }),
      risk: new HangingRisk(),
    });
    const riskCov = partial.providerCoverage.find((c) => c.providerId === "hanging-risk");
    expect(riskCov?.status).toBe("unavailable");
    expect(riskCov?.message).toMatch(/timed out|Try again/i);
  }, 15_000);
});

describe("runInvestigation - transaction path", () => {
  it("returns success for a hash with a stubbed transaction", async () => {
    const partial = await runInvestigation({
      network: "ethereum-mainnet",
      subjectType: "transaction",
      subject: ("0x" + "9".repeat(64)) as Hash,
      blockchain: new StubChain({
        status: "success",
        data: [],
        checkedAt: "2026-01-01T00:00:00Z",
        sourceId: "stub-chain",
      }),
    });
    expect(partial.transactions.length).toBe(1);
    const riskCov = partial.providerCoverage.find((c) => c.providerId === "risk-not-applicable");
    expect(riskCov?.status).toBe("not_configured");
  });
});

// Local stub for the chain failure path used above.
class FailingRisk implements RiskSignalProvider {
  readonly id = "failing-risk";
  async screenAddress(): Promise<ProviderResult<RiskSignal[]>> {
    throw new Error("boom");
  }
  async healthCheck(): Promise<{ ok: boolean; checkedAt: string }> {
    return { ok: true, checkedAt: "2026-01-01T00:00:00Z" };
  }
}