import type { Address, Hash } from "viem";

import type {
  BlockchainDataProvider,
  ChainTransaction,
  ProviderResult,
  RiskSignal,
  RiskSignalProvider,
} from "@/lib/domain/types";
import { findAddressFixture, findTransactionFixture } from "@/data/fixtures";

// ponytail: this provider is fixture-backed so the MVP works offline per
// docs/PRODUCT_BRIEF.md ("Keep the app useful with demo fixtures even when
// APIs are unavailable") and docs/ARCHITECTURE_SPEC.md §6 ("Implement
// fixtures and adapter tests before wiring external credentials"). The
// adapter contract is identical to what a real indexed source will need
// to satisfy — only the data source is swapped.

export class FixtureBlockchainProvider implements BlockchainDataProvider {
  readonly id = "fixture-blockchain";

  async getAddressActivity(address: Address): Promise<ProviderResult<ChainTransaction[]>> {
    const fixture = findAddressFixture(address);
    const checkedAt = new Date().toISOString();
    if (!fixture) {
      return { status: "no_match", checkedAt, sourceId: this.id };
    }
    return {
      status: "success",
      data: fixture.transactions,
      checkedAt,
      sourceId: this.id,
    };
  }

  async getTransaction(hash: Hash): Promise<ProviderResult<ChainTransaction>> {
    const fixture = findTransactionFixture(hash);
    const checkedAt = new Date().toISOString();
    if (!fixture) {
      // ponytail: a fixture transaction lookup is incomplete; a real adapter
      // would hit Etherscan/RPC and return a single tx or not_found.
      return { status: "no_match", checkedAt, sourceId: this.id };
    }
    const tx: ChainTransaction = {
      hash: fixture.hash,
      from: fixture.from,
      to: fixture.to,
      valueWei: fixture.valueWei,
      blockNumber: fixture.blockNumber,
      timestamp: fixture.timestamp,
      status: fixture.status,
      tokenTransfers: fixture.tokenTransfers,
      evidence: {
        id: `onchain:${fixture.hash}`,
        kind: "onchain_fact",
        observedAt: fixture.timestamp,
        explanation: "Single transaction lookup (fixture).",
      },
    };
    return { status: "success", data: tx, checkedAt, sourceId: this.id };
  }
}

export class FixtureRiskProvider implements RiskSignalProvider {
  readonly id = "community-abuse-reports";

  async screenAddress(address: Address): Promise<ProviderResult<RiskSignal[]>> {
    const fixture = findAddressFixture(address);
    const checkedAt = new Date().toISOString();
    if (!fixture) {
      return { status: "no_match", checkedAt, sourceId: this.id };
    }
    if (fixture.riskSignals.length === 0) {
      return { status: "no_match", checkedAt, sourceId: this.id };
    }
    return {
      status: "success",
      data: fixture.riskSignals,
      checkedAt,
      sourceId: this.id,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; checkedAt: string }> {
    return { ok: true, checkedAt: new Date().toISOString() };
  }
}

export const defaultBlockchainProvider: BlockchainDataProvider =
  new FixtureBlockchainProvider();

export const defaultRiskProvider: RiskSignalProvider = new FixtureRiskProvider();