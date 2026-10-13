"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Investigation } from "@/lib/domain/types";
import { clearCases, deleteCase, loadAllCases } from "@/lib/local-cases";
import { downloadInvestigationJson } from "@/lib/export";
import { formatTimestamp } from "@/lib/format";
import { truncateMiddle } from "@/lib/validation";

export default function SavedPage() {
  const [cases, setCases] = useState<Investigation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadAllCases()
      .then((c) => {
        if (!cancelled) setCases(c);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load saved cases.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this case from this browser? Notes cannot be recovered.")) {
      return;
    }
    await deleteCase(id);
    setCases((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  async function onClearAll() {
    if (!confirm("Delete all saved cases from this browser?")) return;
    await clearCases();
    setCases([]);
  }

  function onExport(inv: Investigation) {
    downloadInvestigationJson(inv);
  }

  if (error) {
    return (
      <div className="panel p-4">
        <p className="text-high-risk">{error}</p>
        <p className="text-sm text-text-secondary mt-2">
          IndexedDB may be disabled in this browser. Saved cases need browser-local storage.
        </p>
      </div>
    );
  }

  if (cases === null) {
    return <p className="text-text-secondary">Loading saved cases…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-secondary">
            Saved cases
          </p>
          <h1 className="font-display text-2xl md:text-3xl mt-1">
            Browser-local investigations
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">
            Notes and conclusions live only in this browser. Export a case as
            JSON for backup. Browser-local data is not synced.
          </p>
        </div>
        {cases.length > 0 && (
          <button
            type="button"
            onClick={() => void onClearAll()}
            className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
          >
            Clear all
          </button>
        )}
      </header>

      {cases.length === 0 ? (
        <p className="panel p-4 text-sm text-text-secondary">
          No saved cases yet. Run an investigation and use{" "}
          <span className="text-text-primary">Save notes</span> to keep your work locally.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cases.map((c) => (
            <li key={c.id} className="panel p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs uppercase tracking-wider text-text-secondary">
                  {c.subjectType}
                </p>
                <p className="text-xs text-text-secondary mono">
                  {formatTimestamp(c.updatedAt)}
                </p>
              </div>
              <p className="mono text-sm mt-1 break-all">{truncateMiddle(c.subject, 14, 12)}</p>
              {c.notes && (
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                  {c.notes}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/investigate/${c.subject}`}
                  className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => onExport(c)}
                  className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(c.id)}
                  className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised text-high-risk"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}