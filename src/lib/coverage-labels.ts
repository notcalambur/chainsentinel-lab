import type { CoverageStatus } from "@/lib/domain/types";

export const COVERAGE_LABELS: Record<CoverageStatus, string> = {
  complete: "Complete",
  partial: "Partial",
  unavailable: "Unavailable",
  not_configured: "Not configured",
  insufficient_data: "Insufficient data",
};

export const COVERAGE_TONE: Record<CoverageStatus, string> = {
  complete: "info",
  partial: "caution",
  unavailable: "caution",
  not_configured: "info",
  insufficient_data: "caution",
};