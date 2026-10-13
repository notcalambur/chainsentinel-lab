import type { ChainTransaction } from "@/lib/domain/types";
import { formatTimestampShort, transactionLabel } from "@/lib/format";
import { truncateMiddle } from "@/lib/validation";
import { CopyButton } from "./CopyButton";

export function ActivitySection({ transactions }: { transactions: ChainTransaction[] }) {
  return (
    <section aria-labelledby="activity-heading" className="panel p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="activity-heading" className="font-display text-lg">
          Activity
        </h2>
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          {transactions.length} on-chain row(s)
        </span>
      </div>
      {transactions.length === 0 ? (
        <p className="mt-3 text-sm">
          No activity returned from the configured source.{" "}
          <span className="text-text-secondary">
            Empty activity is not proof the address is unused.
          </span>
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm tabular">
            <thead className="text-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 pr-3">Time (UTC)</th>
                <th className="text-left py-2 pr-3">Hash</th>
                <th className="text-left py-2 pr-3">From → To</th>
                <th className="text-right py-2 pr-3">Value</th>
                <th className="text-left py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash} className="border-t border-border">
                  <td className="py-2 pr-3 mono text-xs">
                    {formatTimestampShort(tx.timestamp)}
                  </td>
                  <td className="py-2 pr-3 mono text-xs whitespace-nowrap">
                    {truncateMiddle(tx.hash, 10, 8)}
                    <span className="inline-block ml-2 align-middle">
                      <CopyButton value={tx.hash} label="Copy hash" />
                    </span>
                    {tx.explorerUrl && (
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline text-info hover:text-text-primary"
                      >
                        Etherscan
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-3 mono text-xs whitespace-nowrap">
                    {truncateMiddle(tx.from, 8, 6)} → {tx.to ? truncateMiddle(tx.to, 8, 6) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right mono text-xs">
                    {transactionLabel(tx)}
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    {tx.status ?? "unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}