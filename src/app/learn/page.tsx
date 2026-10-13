import { GLOSSARY } from "@/data/glossary";

export const metadata = { title: "Learning · ChainSentinel Lab" };

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-text-secondary">
          Learning
        </p>
        <h1 className="font-display text-2xl md:text-3xl mt-1">
          Plain-language glossary
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Definitions used across the app. Educational content is kept
          separate from case-specific findings.
        </p>
      </header>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GLOSSARY.map((g) => (
          <article key={g.term} className="panel p-4">
            <dt className="font-display text-base">{g.term}</dt>
            <dd className="text-sm text-text-secondary mt-2">{g.short}</dd>
          </article>
        ))}
      </dl>
    </div>
  );
}