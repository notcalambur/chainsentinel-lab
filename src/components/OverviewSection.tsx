import type { Address } from "viem";

import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";
import type { Investigation, ProviderCoverage, SubjectType } from "@/lib/domain/types";
import { findAddressFixture } from "@/data/fixtures";
import { formatTimestamp } from "@/lib/format";

export function OverviewSection({
  subjectType,
  subject,
  coverage,
  fixture,
}: {
  subjectType: SubjectType;
  subject: string;
  coverage: ProviderCoverage[];
  fixture: ReturnType<typeof findAddressFixture>;
}) {
  const summary = fixture?.blurb ?? (subjectType === "address"
    ? "No fixture blurb available for this address."
    : "No fixture summary for this transaction.");

  return (
    <section aria-labelledby="overview-heading" className="panel p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="overview-heading" className="font-display text-lg">
          Overview
        </h2>
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          onchain_fact + provider metadata
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-text-secondary">Subject kind</dt>
          <dd>{subjectType === "address" ? "Ethereum address" : "Transaction hash"}</dd>
        </div>
        {subjectType === "address" && fixture ? (
          <>
            <div>
              <dt className="text-text-secondary">Label (fixture)</dt>
              <dd>{fixture.label}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Account kind</dt>
              <dd className="uppercase">{fixture.accountKind}</dd>
            </div>
          </>
        ) : null}
        <div>
          <dt className="text-text-secondary">Subject</dt>
          <dd className="flex items-center gap-2 mono break-all">
            <span>{subject}</span>
            <CopyButton value={subject} />
          </dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-text-secondary">Notes (fixture)</dt>
          <dd className="text-text-primary">{summary}</dd>
        </div>
      </dl>
      <div className="mt-5">
        <h3 className="text-sm text-text-secondary mb-2">Source coverage</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {coverage.map((c) => (
            <li key={c.providerId} className="panel-raised p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-xs">{c.providerId}</span>
                <StatusBadge status={c.status} />
              </div>
              {c.message && (
                <p className="text-xs text-text-secondary mt-1">{c.message}</p>
              )}
              {c.checkedAt && (
                <p className="text-xs text-text-secondary mt-1 mono">
                  {formatTimestamp(c.checkedAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}