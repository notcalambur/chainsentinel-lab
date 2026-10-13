import type { ChainTransaction } from "@/lib/domain/types";

const WEI_PER_ETHER = 10n ** 18n;

export function formatEth(wei: string | undefined): string {
  if (!wei) return "—";
  try {
    const big = BigInt(wei);
    const whole = big / WEI_PER_ETHER;
    const fraction = big % WEI_PER_ETHER;
    if (fraction === 0n) {
      return `${whole.toString()} ETH`;
    }
    const fracStr = fraction.toString().padStart(18, "0").slice(0, 6);
    return `${whole.toString()}.${fracStr} ETH`;
  } catch {
    return `${wei} wei`;
  }
}

export function formatTokenAmount(raw: string, decimals?: number, symbol?: string): string {
  if (decimals === undefined) {
    return `${raw}${symbol ? " " + symbol : ""}`;
  }
  try {
    const big = BigInt(raw);
    const denom = 10n ** BigInt(decimals);
    const whole = big / denom;
    const frac = big % denom;
    if (frac === 0n) {
      return `${whole.toString()}${symbol ? " " + symbol : ""}`;
    }
    const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4);
    return `${whole.toString()}.${fracStr}${symbol ? " " + symbol : ""}`;
  } catch {
    return `${raw}${symbol ? " " + symbol : ""}`;
  }
}

export function formatTimestamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(d);
}

export function formatTimestampShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function transactionLabel(tx: ChainTransaction): string {
  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    const t = tx.tokenTransfers[0]!;
    return formatTokenAmount(t.amountRaw, t.decimals, t.symbol);
  }
  return formatEth(tx.valueWei);
}