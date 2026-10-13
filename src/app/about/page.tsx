export const metadata = { title: "About · ChainSentinel Lab" };

const DATA_SOURCES = [
  {
    id: "fixture-blockchain",
    label: "Fixture blockchain source (MVP)",
    description:
      "Local fixtures covering a handful of well-known addresses. Real providers (Blockchair, BlockCypher, or a self-hosted index) will replace this once terms are revalidated at implementation time.",
    state: "fixture",
  },
  {
    id: "community-abuse-reports",
    label: "Community abuse-report feed (fixture)",
    description:
      "Fixture-based stand-in for ChainAbuse. Real wiring requires API key, terms review, and verification of what its confidence field actually means.",
    state: "fixture",
  },
  {
    id: "ai-decisions",
    label: "External model signal (not wired)",
    description:
      "Optional. Not yet wired. When added, output must be presented as the vendor's own score and never rescaled.",
    state: "not_configured",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-text-secondary">
          About
        </p>
        <h1 className="font-display text-2xl md:text-3xl mt-1">
          Data sources and limits
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          ChainSentinel Lab is a personal, read-only workspace. It does not
          connect to a wallet, does not sign transactions, and does not store
          notes or evidence on-chain.
        </p>
      </header>

      <section aria-labelledby="sources-heading" className="panel p-4 md:p-5">
        <h2 id="sources-heading" className="font-display text-lg">
          Configured sources
        </h2>
        <ul className="mt-3 space-y-3">
          {DATA_SOURCES.map((s) => (
            <li key={s.id} className="panel-raised p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono text-xs">{s.id}</span>
                <span className="text-xs uppercase tracking-wider text-text-secondary">
                  {s.state}
                </span>
              </div>
              <p className="text-sm mt-1">{s.label}</p>
              <p className="text-xs text-text-secondary mt-1">{s.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="limits-heading" className="panel p-4 md:p-5">
        <h2 id="limits-heading" className="font-display text-lg">
          What this app does not do
        </h2>
        <ul className="list-disc pl-5 mt-3 text-sm space-y-1 text-text-secondary">
          <li>No wallet connection, signing, or transaction broadcasting.</li>
          <li>
            No automated safe/unsafe verdict; provider severity is shown
            verbatim.
          </li>
          <li>No authentication, no cloud sync, no account, no billing.</li>
          <li>No smart-contract auditing or automated exploit detection.</li>
          <li>No token, governance, staking, or token sale.</li>
        </ul>
      </section>
    </div>
  );
}