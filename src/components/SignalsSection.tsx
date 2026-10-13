import type { ProviderCoverage, RiskSignal } from "@/lib/domain/types";
import { SeverityChip } from "./StatusBadge";
import { formatTimestamp } from "@/lib/format";

export function SignalsSection({
  signals,
  coverage,
}: {
  signals: RiskSignal[];
  coverage: ProviderCoverage[];
}) {
  const riskCoverage = coverage.filter((c) => c.providerId !== "fixture-blockchain" && c.providerId !== "risk-not-applicable");
  const hasNoSignalConfig = riskCoverage.length > 0;

  return (
    <section aria-labelledby="signals-heading" className="panel p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="signals-heading" className="font-display text-lg">
          Signals
        </h2>
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          {signals.length} third-party report(s)
        </span>
      </div>

      {signals.length === 0 ? (
        <p className="mt-3 text-sm">
          No signal found in sources checked.
          {hasNoSignalConfig ? null : (
            <span className="block mt-1 text-text-secondary text-xs">
              Risk source not configured for this subject.
            </span>
          )}
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {signals.map((s) => (
            <li key={s.id} className="panel-raised p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-text-secondary">
                  {s.category}
                </span>
                <SeverityChip severity={s.providerSeverity} />
                <span className="mono text-xs text-text-secondary">
                  {s.providerId}
                </span>
                <span className="text-xs text-text-secondary ml-auto mono">
                  {formatTimestamp(s.observedAt)}
                </span>
              </div>
              <p className="mt-2 text-sm">{s.explanation}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                {s.sourceUrl && (
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-text-primary"
                  >
                    Provider source
                  </a>
                )}
                {s.providerModelVersion && <span>model {s.providerModelVersion}</span>}
                {typeof s.confidence === "number" && (
                  <span>
                    provider confidence {s.confidence.toFixed(2)} (provider-native)
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}