import type { Investigation } from "@/lib/domain/types";

export function toExportableJson(inv: Investigation): Investigation {
  // ponytail: the in-memory record IS the export shape. The schemaVersion
  // field lets future migrations refuse older versions. We clone so callers
  // cannot mutate exported bytes.
  return JSON.parse(JSON.stringify(inv)) as Investigation;
}

export function downloadInvestigationJson(inv: Investigation): void {
  const payload = toExportableJson(inv);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chainsentinel-${inv.subjectType}-${inv.id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}