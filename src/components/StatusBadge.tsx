import type { CoverageStatus } from "@/lib/domain/types";

import { COVERAGE_LABELS } from "@/lib/coverage-labels";

const TONE: Record<CoverageStatus, string> = {
  complete: "border-info/40 text-info bg-info/10",
  partial: "border-caution/40 text-caution bg-caution/10",
  unavailable: "border-caution/40 text-caution bg-caution/10",
  not_configured: "border-border text-text-secondary bg-surface",
  insufficient_data: "border-caution/40 text-caution bg-caution/10",
};

export function StatusBadge({ status }: { status: CoverageStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${TONE[status]}`}
      role="status"
    >
      {COVERAGE_LABELS[status]}
    </span>
  );
}

export function SeverityChip({ severity }: { severity?: string }) {
  if (!severity) return null;
  const tone =
    severity.toLowerCase() === "high"
      ? "border-high-risk/50 text-high-risk bg-high-risk/10"
      : severity.toLowerCase() === "medium"
        ? "border-caution/50 text-caution bg-caution/10"
        : "border-info/50 text-info bg-info/10";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${tone}`}>
      {severity}
    </span>
  );
}