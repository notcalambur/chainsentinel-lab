import { GLOSSARY } from "@/data/glossary";
import type { SubjectType } from "@/lib/domain/types";

export function LearnSection({ subjectType }: { subjectType: SubjectType }) {
  const terms =
    subjectType === "transaction"
      ? GLOSSARY.filter((g) =>
          ["Transaction hash", "Wei", "Token transfer"].includes(g.term),
        )
      : GLOSSARY.filter((g) =>
          [
            "EOA (Externally Owned Account)",
            "Contract account",
            "Mixer",
            "Coverage",
            "No signal found in sources checked",
            "Provider-native severity",
          ].includes(g.term),
        );

  return (
    <section aria-labelledby="learn-heading" className="panel p-4 md:p-5">
      <h2 id="learn-heading" className="font-display text-lg">
        Learn
      </h2>
      <p className="text-sm text-text-secondary mt-1">
        Plain-language terms relevant to this view. Definitions are not case-specific findings.
      </p>
      <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((t) => (
          <div key={t.term}>
            <dt className="text-sm font-medium">{t.term}</dt>
            <dd className="text-sm text-text-secondary mt-1">{t.short}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}