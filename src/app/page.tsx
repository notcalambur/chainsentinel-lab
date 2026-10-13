import { SearchForm } from "@/components/SearchForm";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-text-secondary">
          Read-only investigation workspace
        </p>
        <h1 className="font-display text-3xl md:text-4xl mt-2">
          What happened on-chain?
        </h1>
        <p className="text-text-secondary mt-3 max-w-2xl">
          Enter an Ethereum mainnet address or transaction hash. ChainSentinel
          Lab queries each configured source independently, attributes
          findings to the provider that reported them, and keeps your notes
          on this device.
        </p>
      </header>

      <section className="panel p-4 md:p-6" aria-label="New investigation">
        <SearchForm />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <article className="panel p-4">
          <h2 className="font-display text-base">No global verdict</h2>
          <p className="text-sm text-text-secondary mt-1">
            We do not collapse provider outputs into a single safe/unsafe
            score. Each finding shows the provider, severity, model version,
            and observed time.
          </p>
        </article>
        <article className="panel p-4">
          <h2 className="font-display text-base">Distinguish no-match from safe</h2>
          <p className="text-sm text-text-secondary mt-1">
            No signal found in sources checked is not proof of safety. We
            surface coverage and provider state explicitly.
          </p>
        </article>
        <article className="panel p-4">
          <h2 className="font-display text-base">Notes stay local</h2>
          <p className="text-sm text-text-secondary mt-1">
            Analyst notes live in your browser. Export a case as JSON on
            demand. Nothing leaves the device unless you trigger an export.
          </p>
        </article>
      </section>
    </div>
  );
}