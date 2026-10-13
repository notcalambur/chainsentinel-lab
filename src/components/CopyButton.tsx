"use client";

import { useState } from "react";

import { truncateMiddle } from "@/lib/validation";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} ${truncateMiddle(value, 12, 10)}`}
      className="text-xs px-2 py-1 border border-border rounded hover:bg-surface-raised focus-visible:bg-surface-raised"
    >
      {copied ? "Copied" : label}
    </button>
  );
}