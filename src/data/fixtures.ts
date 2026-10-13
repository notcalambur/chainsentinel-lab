import type { ChainTransaction, RiskSignal, TokenTransfer } from "@/lib/domain/types";
import type { Address, Hash } from "viem";

// Fixture data for the offline MVP. Each fixture is a deterministic, public,
// well-known Ethereum mainnet address so the demo flow stays believable
// without any network calls.
//
// Sources for the address identities (not the transactions themselves — those
// are illustrative):
//   vitalik.eth                -> vitalik.public.eth / ENS-resolved
//   uniswap v3 router          -> 0x68b3... (canonical Uniswap deployment)
//   usdc contract              -> 0xa0b8...eb48 (USDC mainnet)
//   tornado cash router        -> 0xd90e... (sanctioned example for the no-safe rule)
//
// Transactions here are fictional but realistic in shape; provenance tags
// make that clear via `Evidence.explanation`.

export type AddressFixture = {
  kind: "address";
  address: Address;
  label: string;
  /** account kind: "eoa" or "contract". */
  accountKind: "eoa" | "contract";
  /** short blurb about the entity, used in the Overview section. */
  blurb: string;
  transactions: ChainTransaction[];
  riskSignals: RiskSignal[];
  riskSourcesChecked: string[];
};

export type TransactionFixture = {
  kind: "transaction";
  hash: Hash;
  summary: string;
  from: Address;
  to: Address;
  valueWei: string;
  status: "success" | "failed";
  blockNumber: string;
  timestamp: string;
  tokenTransfers?: TokenTransfer[];
};

export type Fixture = AddressFixture | TransactionFixture;

const VITALIK: Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const UNISWAP_V3_ROUTER: Address = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TORNADO_ROUTER: Address = "0xd90e2f9250187260a4f00073F73F73F73F73F73F" as Address;

const VITALIK_LABEL = "vitalik.eth (public EOA)";
const UNISWAP_LABEL = "Uniswap V3: Router 2";
const USDC_LABEL = "USDC (USDC ERC-20)";
const TORNADO_LABEL = "Sanctioned mixer router (illustrative)";

// --- Fixture transactions --------------------------------------------------

function tx(params: {
  hash: Hash;
  from: Address;
  to: Address;
  valueWei: string;
  blockNumber: string;
  timestamp: string;
  status: "success" | "failed";
  tokenTransfers?: TokenTransfer[];
  sourceUrl?: string;
}): ChainTransaction {
  return {
    hash: params.hash,
    from: params.from,
    to: params.to,
    valueWei: params.valueWei,
    blockNumber: params.blockNumber,
    timestamp: params.timestamp,
    status: params.status,
    tokenTransfers: params.tokenTransfers,
    explorerUrl:
      params.sourceUrl ??
      `https://etherscan.io/tx/${params.hash}`,
    evidence: {
      id: `onchain:${params.hash}`,
      kind: "onchain_fact",
      observedAt: params.timestamp,
      explanation:
        "Transaction shape derived from indexed block data (fixture). Live providers must keep the same Evidence contract.",
      sourceUrl: `https://etherscan.io/tx/${params.hash}`,
    },
  };
}

const vitalikTxs: ChainTransaction[] = [
  tx({
    hash: "0x" + "1".repeat(64) as Hash,
    from: VITALIK,
    to: UNISWAP_V3_ROUTER,
    valueWei: "0",
    blockNumber: "19000000",
    timestamp: "2026-09-01T10:14:00Z",
    status: "success",
    tokenTransfers: [
      {
        tokenAddress: USDC,
        symbol: "USDC",
        amountRaw: "100000000",
        decimals: 6,
        from: VITALIK,
        to: UNISWAP_V3_ROUTER,
      },
    ],
  }),
  tx({
    hash: "0x" + "2".repeat(64) as Hash,
    from: VITALIK,
    to: VITALIK,
    valueWei: "0",
    blockNumber: "18950000",
    timestamp: "2026-08-12T08:02:00Z",
    status: "success",
  }),
  tx({
    hash: "0x" + "3".repeat(64) as Hash,
    from: VITALIK,
    to: UNISWAP_V3_ROUTER,
    valueWei: "320000000000000000",
    blockNumber: "18890000",
    timestamp: "2026-07-22T16:48:00Z",
    status: "success",
  }),
];

const uniswapTxs: ChainTransaction[] = [
  tx({
    hash: "0x" + "4".repeat(64) as Hash,
    from: VITALIK,
    to: UNISWAP_V3_ROUTER,
    valueWei: "0",
    blockNumber: "19000000",
    timestamp: "2026-09-01T10:14:00Z",
    status: "success",
  }),
  tx({
    hash: "0x" + "5".repeat(64) as Hash,
    from: VITALIK,
    to: UNISWAP_V3_ROUTER,
    valueWei: "0",
    blockNumber: "18990000",
    timestamp: "2026-08-30T22:13:00Z",
    status: "failed",
  }),
];

const usdcTxs: ChainTransaction[] = [
  tx({
    hash: "0x" + "6".repeat(64) as Hash,
    from: VITALIK,
    to: UNISWAP_V3_ROUTER,
    valueWei: "0",
    blockNumber: "19000000",
    timestamp: "2026-09-01T10:14:00Z",
    status: "success",
    tokenTransfers: [
      {
        tokenAddress: USDC,
        symbol: "USDC",
        amountRaw: "100000000",
        decimals: 6,
        from: VITALIK,
        to: UNISWAP_V3_ROUTER,
      },
    ],
  }),
];

const tornadoTxs: ChainTransaction[] = [
  tx({
    hash: "0x" + "7".repeat(64) as Hash,
    from: TORNADO_ROUTER,
    to: TORNADO_ROUTER,
    valueWei: "1000000000000000000",
    blockNumber: "17000000",
    timestamp: "2023-08-21T09:00:00Z",
    status: "success",
  }),
];

// --- Risk signals ----------------------------------------------------------

const vitalikSignals: RiskSignal[] = [];

const tornadoSignals: RiskSignal[] = [
  {
    id: "signal:tornado:ofac",
    kind: "third_party_report",
    category: "sanctions",
    providerId: "community-abuse-reports",
    providerSeverity: "high",
    observedAt: "2023-08-21T09:00:00Z",
    explanation:
      "Fixture: address appears on a community abuse-report feed tagged as a sanctioned mixer router. Provider-native severity is shown verbatim.",
    sourceUrl: "https://example.invalid/ofac-fixture",
    providerModelVersion: "fixture-v1",
    confidence: 0.95,
  },
  {
    id: "signal:tornado:community",
    kind: "third_party_report",
    category: "phishing-adjacent",
    providerId: "community-abuse-reports",
    providerSeverity: "medium",
    observedAt: "2024-02-04T13:25:00Z",
    explanation:
      "Fixture: community-submitted reports reference this address for mixer-related scams.",
    sourceUrl: "https://example.invalid/community-fixture",
    confidence: 0.71,
  },
];

const uniswapSignals: RiskSignal[] = [];

const usdcSignals: RiskSignal[] = [];

// --- Fixtures --------------------------------------------------------------

export const FIXTURES: Fixture[] = [
  {
    kind: "address",
    address: VITALIK,
    label: VITALIK_LABEL,
    accountKind: "eoa",
    blurb:
      "Public external account associated with Ethereum co-founder Vitalik Buterin. Frequently used in demos and explorations.",
    transactions: vitalikTxs,
    riskSignals: vitalikSignals,
    riskSourcesChecked: ["community-abuse-reports"],
  },
  {
    kind: "address",
    address: UNISWAP_V3_ROUTER,
    label: UNISWAP_LABEL,
    accountKind: "contract",
    blurb:
      "Canonical Uniswap V3 Router 2 deployment on Ethereum mainnet. Demonstrates a contract address with mixed success/failed history.",
    transactions: uniswapTxs,
    riskSignals: uniswapSignals,
    riskSourcesChecked: ["community-abuse-reports"],
  },
  {
    kind: "address",
    address: USDC,
    label: USDC_LABEL,
    accountKind: "contract",
    blurb:
      "USDC ERC-20 contract on Ethereum mainnet. Used to demonstrate token transfer decoding in activity rows.",
    transactions: usdcTxs,
    riskSignals: usdcSignals,
    riskSourcesChecked: ["community-abuse-reports"],
  },
  {
    kind: "address",
    address: TORNADO_ROUTER,
    label: TORNADO_LABEL,
    accountKind: "contract",
    blurb:
      "Fixture address used to illustrate how a high-severity third-party report renders. Not a real OFAC SDN entry — fixture data only.",
    transactions: tornadoTxs,
    riskSignals: tornadoSignals,
    riskSourcesChecked: ["community-abuse-reports"],
  },
];

export function findAddressFixture(address: Address): AddressFixture | undefined {
  return FIXTURES.find(
    (f): f is AddressFixture =>
      f.kind === "address" && f.address.toLowerCase() === address.toLowerCase(),
  );
}

export function findTransactionFixture(hash: Hash): TransactionFixture | undefined {
  return FIXTURES.find(
    (f): f is TransactionFixture => f.kind === "transaction" && f.hash === hash,
  );
}

export function demoAddress(): Address {
  const fixture = FIXTURES[0];
  if (!fixture || fixture.kind !== "address") {
    throw new Error("Fixture seed broken — first fixture must be an address.");
  }
  return fixture.address;
}