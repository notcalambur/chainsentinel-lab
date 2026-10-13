// Domain types — derived verbatim from docs/ARCHITECTURE_SPEC.md §5.
// Single source of truth for the app.

import type { Address, Hash } from "viem";

export type NetworkId = "ethereum-mainnet";

export const NETWORKS: readonly NetworkId[] = ["ethereum-mainnet"];

export type SubjectType = "address" | "transaction";

export type EvidenceKind =
  | "onchain_fact"
  | "third_party_report"
  | "third_party_model"
  | "analyst_note";

export type CoverageStatus =
  | "complete"
  | "partial"
  | "unavailable"
  | "not_configured"
  | "insufficient_data";

export type ProviderError =
  | "timeout"
  | "rate_limited"
  | "unauthorized"
  | "not_found"
  | "unsupported"
  | "malformed_response"
  | "unknown";

export type Evidence = {
  id: string;
  kind: EvidenceKind;
  providerId?: string;
  observedAt: string;
  explanation: string;
  sourceUrl?: string;
  providerSeverity?: string;
  confidence?: number;
  providerModelVersion?: string;
  rawReference?: string;
};

export type RiskSignal = Evidence & {
  kind: "third_party_report" | "third_party_model";
  category: string;
};

export type TokenTransfer = {
  tokenAddress: Address;
  symbol?: string;
  amountRaw: string;
  decimals?: number;
  from: Address;
  to: Address;
};

export type ChainTransaction = {
  hash: Hash;
  blockNumber?: string;
  timestamp?: string;
  from: Address;
  to?: Address;
  valueWei?: string;
  tokenTransfers?: TokenTransfer[];
  status?: "success" | "failed" | "unknown";
  explorerUrl?: string;
  evidence: Evidence;
};

export type ProviderCoverage = {
  providerId: string;
  status: CoverageStatus;
  checkedAt?: string;
  message?: string;
  sourcesChecked?: string[];
};

export type Investigation = {
  schemaVersion: 1;
  id: string;
  network: NetworkId;
  subjectType: SubjectType;
  subject: string;
  queriedAt: string;
  createdAt: string;
  updatedAt: string;
  providerCoverage: ProviderCoverage[];
  transactions: ChainTransaction[];
  signals: RiskSignal[];
  notes: string;
  conclusion?: string;
};

export type ProviderResult<T> =
  | {
      status: "success";
      data: T;
      checkedAt: string;
      sourceId: string;
    }
  | { status: "no_match"; checkedAt: string; sourceId: string }
  | {
      status: "unavailable" | "not_configured" | "insufficient_data";
      checkedAt?: string;
      sourceId: string;
      error?: ProviderError;
      message?: string;
    };

export interface BlockchainDataProvider {
  id: string;
  getAddressActivity(
    address: Address,
    cursor?: string,
  ): Promise<ProviderResult<ChainTransaction[]>>;
  getTransaction(hash: Hash): Promise<ProviderResult<ChainTransaction>>;
}

export interface RiskSignalProvider {
  id: string;
  screenAddress(address: Address): Promise<ProviderResult<RiskSignal[]>>;
  healthCheck(): Promise<{ ok: boolean; checkedAt: string }>;
}

export function isAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function isHash(value: string): value is Hash {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

export function detectSubjectType(
  raw: string,
): { ok: true; type: SubjectType; value: Address | Hash } | { ok: false } {
  const v = raw.trim();
  if (isHash(v)) return { ok: true, type: "transaction", value: v };
  if (isAddress(v)) return { ok: true, type: "address", value: v };
  return { ok: false };
}