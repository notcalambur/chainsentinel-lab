"use client";

import { useEffect, useState } from "react";

import { runInvestigation } from "@/lib/orchestrator";
import { defaultBlockchainProvider, defaultRiskProvider } from "@/lib/providers";
import { findAddressFixture } from "@/data/fixtures";
import type { Investigation } from "@/lib/domain/types";
import { saveCase } from "@/lib/local-cases";
import { downloadInvestigationJson } from "@/lib/export";

import { ActivitySection } from "./ActivitySection";
import { EvidenceSection } from "./EvidenceSection";
import { LearnSection } from "./LearnSection";
import { NotesSection } from "./NotesSection";
import { OverviewSection } from "./OverviewSection";
import { SignalsSection } from "./SignalsSection";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";
import { formatTimestamp } from "@/lib/format";
import { truncateMiddle, validateInput } from "@/lib/validation";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; investigation: Omit<Investigation, "notes" | "conclusion"> }
  | { kind: "error"; message: string };

export function InvestigationResult({ subject }: { subject: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    const v = validateInput(subject);
    if (!v.ok) {
      setState({ kind: "error", message: v.reason });
      return;
    }
    let cancelled = false;
    setState({ kind: "loading" });
    (async () => {
      try {
        const partial = await runInvestigation({
          network: "ethereum-mainnet",
          subjectType: v.type,
          subject: v.checksummed,
          blockchain: defaultBlockchainProvider,
          risk: defaultRiskProvider,
        });
        if (!cancelled) setState({ kind: "ready", investigation: partial });
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Investigation failed.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subject]);

  if (state.kind === "error") {
    return (
      <section className="panel p-6">
        <h1 className="font-display text-lg mb-2">Could not investigate</h1>
        <p className="text-high-risk">{state.message}</p>
        <p className="text-sm text-text-secondary mt-3">
          Subject: <span className="mono">{subject}</span>
        </p>
      </section>
    );
  }

  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <section className="panel p-6" aria-busy="true">
        <h1 className="font-display text-lg mb-2">Querying sources…</h1>
        <p className="text-sm text-text-secondary">
          Subject: <span className="mono">{truncateMiddle(subject, 14, 12)}</span>
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-20 panel-raised animate-pulse" />
          <div className="h-20 panel-raised animate-pulse" />
        </div>
      </section>
    );
  }

  const inv = state.investigation;
  const fixture = inv.subjectType === "address" ? findAddressFixture(inv.subject as `0x${string}`) : undefined;

  async function onSave() {
    const full: Investigation = { ...inv, notes: "" };
    await saveCase(full);
  }

  function onExport() {
    const full: Investigation = { ...inv, notes: "" };
    downloadInvestigationJson(full);
  }

  return (
    <div className="space-y-6">
      <header className="panel p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-text-secondary">
            {inv.subjectType === "address" ? "Address" : "Transaction"}
          </span>
          <span className="mono text-sm break-all">{inv.subject}</span>
          <CopyButton value={inv.subject} />
        </div>
        <p className="text-xs text-text-secondary mt-2">
          Ethereum Mainnet · queried {formatTimestamp(inv.queriedAt)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {inv.providerCoverage.map((c) => (
            <StatusBadge key={c.providerId} status={c.status} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onSave()}
            className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
          >
            Save case locally
          </button>
          <button
            type="button"
            onClick={onExport}
            className="px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
          >
            Export JSON
          </button>
        </div>
      </header>

      <OverviewSection
        subjectType={inv.subjectType}
        subject={inv.subject}
        coverage={inv.providerCoverage}
        fixture={fixture}
      />

      <ActivitySection transactions={inv.transactions} />
      <SignalsSection signals={inv.signals} coverage={inv.providerCoverage} />
      <EvidenceSection
        coverage={inv.providerCoverage}
        transactions={inv.transactions}
        signals={inv.signals}
      />
      <NotesSection investigationId={inv.id} />
      <LearnSection subjectType={inv.subjectType} />
    </div>
  );
}