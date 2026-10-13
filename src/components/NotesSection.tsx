"use client";

import { useEffect, useState } from "react";

import { loadCase, saveCase } from "@/lib/local-cases";
import type { Investigation } from "@/lib/domain/types";

export function NotesSection({ investigationId }: { investigationId: string }) {
  const [notes, setNotes] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    void loadCase(investigationId).then((existing) => {
      if (cancelled || !existing) return;
      setNotes(existing.notes);
      setConclusion(existing.conclusion ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [investigationId]);

  async function onSave() {
    setStatus("saving");
    try {
      const existing = await loadCase(investigationId);
      const partial = existing ?? {
        schemaVersion: 1 as const,
        id: investigationId,
        network: "ethereum-mainnet" as const,
        subjectType: "address" as const,
        subject: "",
        queriedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        providerCoverage: [],
        transactions: [],
        signals: [],
        notes: "",
      };
      const next: Investigation = {
        ...partial,
        id: investigationId,
        notes,
        conclusion: conclusion || undefined,
        updatedAt: new Date().toISOString(),
      };
      await saveCase(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="notes-heading" className="panel p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="notes-heading" className="font-display text-lg">
          Notes
        </h2>
        <span className="text-xs uppercase tracking-wider text-text-secondary">
          Stored only in this browser
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-1">
        Analyst notes are kept locally. They are never sent to providers.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="block">
          <span className="text-sm text-text-secondary">Working notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="panel-raised mt-1 w-full p-2 text-sm bg-surface-raised"
            placeholder="What did you observe? What is the evidence?"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-secondary">Conclusion (optional)</span>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={2}
            className="panel-raised mt-1 w-full p-2 text-sm bg-surface-raised"
            placeholder="One-line conclusion, attributed to you, not to any provider."
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void onSave()}
            className="px-3 py-1.5 text-sm rounded border border-border bg-accent text-canvas"
          >
            Save notes
          </button>
          {status === "saving" && <span className="text-xs text-text-secondary">Saving…</span>}
          {status === "saved" && <span className="text-xs text-info">Saved locally.</span>}
          {status === "error" && <span className="text-xs text-high-risk">Could not save.</span>}
        </div>
      </div>
    </section>
  );
}