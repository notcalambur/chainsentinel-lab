"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { validateInput, subjectTypeLabel } from "@/lib/validation";
import { demoAddress } from "@/data/fixtures";

export function SearchForm() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateInput(raw);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    router.push(`/investigate/${result.value}`);
  }

  function onDemo() {
    const demo = demoAddress();
    setRaw(demo);
    router.push(`/investigate/${demo}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label="New investigation">
      <label htmlFor="subject" className="block text-sm text-text-secondary">
        Ethereum address or transaction hash
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="subject"
          name="subject"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="0x… address or 0x… 64-hex hash"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="panel-raised flex-1 px-3 py-2 mono text-sm bg-surface-raised placeholder:text-text-secondary focus-visible:outline-none focus-visible:border-accent"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "subject-error" : undefined}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md border border-border bg-accent text-canvas font-medium hover:opacity-90 disabled:opacity-50"
        >
          Investigate
        </button>
        <button
          type="button"
          onClick={onDemo}
          className="px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-raised text-sm"
        >
          Try demo case
        </button>
      </div>
      <p className="text-xs text-text-secondary">
        Read-only. No wallet connection, no signing. Subjects are validated locally
        before any request.
      </p>
      {error && (
        <p
          id="subject-error"
          role="alert"
          className="text-sm text-high-risk border-l-2 border-high-risk pl-3"
        >
          {error}
        </p>
      )}
      <p className="text-xs text-text-secondary">
        Tip: any input the local fixture does not match returns{" "}
        <span className="text-text-primary">No signal found in sources checked</span>{" "}
        (subject kind: {subjectTypeLabel("address")}).
      </p>
    </form>
  );
}