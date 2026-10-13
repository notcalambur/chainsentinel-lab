import { getAddress as viemGetAddress, isAddress as viemIsAddress, isHash as viemIsHash } from "viem";
import type { Address, Hash } from "viem";

import type { SubjectType } from "./domain/types";

export type ValidationOk =
  | { ok: true; type: "address"; value: Address; checksummed: Address }
  | { ok: true; type: "transaction"; value: Hash; checksummed: Hash };

export type ValidationResult = ValidationOk | { ok: false; reason: string };

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const HASH_RE = /^0x[a-fA-F0-9]{64}$/;

/**
 * Validate a raw input. Performs cheap shape checks first; only runs viem's
 * EIP-55 checksum normaliser for address candidates (so a typo on the
 * checksum is auto-corrected). Transaction hashes use the simpler 32-byte hex
 * check; viem's isHash accepts both 0x-prefixed and bare hex.
 */
export function validateInput(raw: string): ValidationResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: "Input is empty." };

  if (HASH_RE.test(value)) {
    return viemIsHash(value)
      ? { ok: true, type: "transaction", value: value as Hash, checksummed: value as Hash }
      : { ok: false, reason: "Invalid transaction hash." };
  }

  if (ADDRESS_RE.test(value)) {
    if (!viemIsAddress(value, { strict: false })) {
      return { ok: false, reason: "Invalid Ethereum address." };
    }
    try {
      const checksummed = viemGetAddress(value);
      return { ok: true, type: "address", value: value as Address, checksummed };
    } catch {
      return { ok: false, reason: "Invalid Ethereum address." };
    }
  }

  return {
    ok: false,
    reason:
      "Not a valid Ethereum address (0x + 40 hex) or transaction hash (0x + 64 hex).",
  };
}

export function subjectTypeLabel(type: SubjectType): string {
  return type === "address" ? "Address" : "Transaction";
}

export function truncateMiddle(value: string, head = 10, tail = 8): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}