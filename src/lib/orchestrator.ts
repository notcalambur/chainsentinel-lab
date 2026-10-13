import type { Address, Hash } from "viem";

import type {
  BlockchainDataProvider,
  ChainTransaction,
  CoverageStatus,
  Investigation,
  ProviderCoverage,
  ProviderResult,
  RiskSignal,
  RiskSignalProvider,
} from "@/lib/domain/types";

// ponytail: each provider call is wrapped in a Promise.race with a hard
// timeout so a slow/hung real adapter never blocks the orchestrator. Set
// timeout to a generous value because the fixture path is synchronous-ish
// and the only real cost is the overhead of an extra Promise.

const PROVIDER_TIMEOUT_MS = 8_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error("provider_timeout")),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function safe<T>(p: Promise<ProviderResult<T>>): Promise<ProviderResult<T>> {
  return withTimeout(p, PROVIDER_TIMEOUT_MS).catch(
    (err): ProviderResult<T> => {
      const isTimeout =
        err instanceof Error && err.message === "provider_timeout";
      const errorCode = isTimeout ? "timeout" : "unknown";
      // ponytail: only carry the raw error message through if it is not our
      // own internal sentinel ("provider_timeout"). Otherwise let
      // coverageFrom() pick the friendly mapping from errorCode.
      const message =
        isTimeout || !(err instanceof Error)
          ? undefined
          : err.message;
      return {
        status: "unavailable",
        sourceId: "unknown",
        checkedAt: new Date().toISOString(),
        error: errorCode,
        message,
      };
    },
  );
}

function coverageFrom(
  providerId: string,
  result: ProviderResult<unknown>,
  fallbackMessage?: string,
): ProviderCoverage {
  const base = {
    providerId,
    checkedAt: result.checkedAt ?? new Date().toISOString(),
  };
  switch (result.status) {
    case "success":
      return { ...base, status: "complete" };
    case "no_match":
      return {
        ...base,
        status: "complete",
        message: "No signal found in sources checked.",
      };
    case "insufficient_data":
      return {
        ...base,
        status: "insufficient_data",
        message: result.message ?? fallbackMessage,
      };
    case "not_configured":
      return {
        ...base,
        status: "not_configured",
        message: result.message ?? fallbackMessage,
      };
    case "unavailable":
      return {
        ...base,
        status: "unavailable",
        message: result.message ?? friendlyProviderError(result.error),
      };
  }
}

function friendlyProviderError(error?: string): string {
  switch (error) {
    case "timeout":
      return "Provider timed out. Try again.";
    case "rate_limited":
      return "Provider rate-limited. Try again later.";
    case "unauthorized":
      return "Provider authentication failed.";
    case "not_found":
      return "Resource not found at provider.";
    case "unsupported":
      return "Provider does not support this query.";
    case "malformed_response":
      return "Provider returned an unexpected response.";
    default:
      return "Provider unavailable.";
  }
}

export function aggregateStatus(coverage: ProviderCoverage[]): CoverageStatus {
  if (coverage.length === 0) return "not_configured";
  if (coverage.every((c) => c.status === "complete")) return "complete";
  if (coverage.some((c) => c.status === "complete")) return "partial";
  return coverage[0]?.status ?? "not_configured";
}

export type InvestigationRunInput = {
  network: Investigation["network"];
  subjectType: Investigation["subjectType"];
  subject: string;
  blockchain: BlockchainDataProvider;
  risk?: RiskSignalProvider;
};

export async function runInvestigation(
  input: InvestigationRunInput,
): Promise<Omit<Investigation, "notes" | "conclusion">> {
  const now = new Date().toISOString();

  if (input.subjectType === "address") {
    const address = input.subject as Address;
    const [chainRes, riskRes] = await Promise.all([
      safe(input.blockchain.getAddressActivity(address)),
      input.risk ? safe(input.risk.screenAddress(address)) : Promise.resolve(null),
    ]);

    const riskCoverage: ProviderCoverage = input.risk
      ? coverageFrom(input.risk.id, riskRes as ProviderResult<RiskSignal[]>)
      : {
          providerId: "risk",
          status: "not_configured",
          message: "Risk source not configured.",
          checkedAt: now,
        };
    const coverage: ProviderCoverage[] = [
      coverageFrom(input.blockchain.id, chainRes),
      riskCoverage,
    ];

    const transactions =
      chainRes.status === "success" ? chainRes.data : [];
    const signals = riskRes && riskRes.status === "success" ? riskRes.data : [];

    return {
      schemaVersion: 1,
      id: cryptoRandomId(),
      network: input.network,
      subjectType: "address",
      subject: address,
      queriedAt: now,
      createdAt: now,
      updatedAt: now,
      providerCoverage: coverage,
      transactions,
      signals,
    };
  }

  // transaction path
  const hash = input.subject as Hash;
  const chainRes = await safe(input.blockchain.getTransaction(hash));
  const coverage: ProviderCoverage[] = [
    coverageFrom(input.blockchain.id, chainRes),
    {
      providerId: "risk-not-applicable",
      status: "not_configured",
      message: "Risk screening is address-only.",
      checkedAt: now,
    },
  ];
  const transactions =
    chainRes.status === "success" ? [chainRes.data] : [];
  return {
    schemaVersion: 1,
    id: cryptoRandomId(),
    network: input.network,
    subjectType: "transaction",
    subject: hash,
    queriedAt: now,
    createdAt: now,
    updatedAt: now,
    providerCoverage: coverage,
    transactions,
    signals: [],
  };
}

export function newInvestigationId(): string {
  return cryptoRandomId();
}

function cryptoRandomId(): string {
  // crypto is global in browsers and Node 19+. Keep the call site
  // dependency-free so the orchestrator stays isomorphic.
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  return g.crypto?.randomUUID?.() ?? fallbackId();
}

function fallbackId(): string {
  return `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}