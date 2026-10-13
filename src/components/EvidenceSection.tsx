import type { ChainTransaction, ProviderCoverage, RiskSignal } from "@/lib/domain/types";

export function EvidenceSection({
  coverage,
  transactions,
  signals,
}: {
  coverage: ProviderCoverage[];
  transactions: ChainTransaction[];
  signals: RiskSignal[];
}) {
  return (
    <section aria-labelledby="evidence-heading" className="panel p-4 md:p-5">
      <h2 id="evidence-heading" className="font-display text-lg">
        Evidence
      </h2>
      <p className="text-sm text-text-secondary mt-1">
        Each item below identifies whether it is a chain fact, third-party
        report, or third-party model output. No item is silently rescored.
      </p>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {coverage.map((c) => (
          <li key={`cov-${c.providerId}`} className="panel-raised p-3">
            <p className="text-xs uppercase tracking-wider text-text-secondary">
              Provider · {c.providerId}
            </p>
            <p className="text-sm mt-1">Status: {c.status}</p>
            {c.message && <p className="text-xs text-text-secondary mt-1">{c.message}</p>}
          </li>
        ))}
        {transactions.map((tx) => (
          <li key={`tx-${tx.hash}`} className="panel-raised p-3">
            <p className="text-xs uppercase tracking-wider text-text-secondary">
              Chain fact · tx
            </p>
            <p className="text-sm mt-1 mono break-all">{tx.hash}</p>
            <p className="text-xs text-text-secondary mt-1">
              Block {tx.blockNumber ?? "—"} · {tx.status ?? "unknown"}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {tx.evidence.explanation}
            </p>
          </li>
        ))}
        {signals.map((s) => (
          <li key={`sig-${s.id}`} className="panel-raised p-3">
            <p className="text-xs uppercase tracking-wider text-text-secondary">
              {s.kind === "third_party_report" ? "Third-party report" : "Third-party model"} · {s.category}
            </p>
            <p className="text-sm mt-1">{s.explanation}</p>
            {s.providerModelVersion && (
              <p className="text-xs text-text-secondary mt-1">
                Provider model: {s.providerModelVersion}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}