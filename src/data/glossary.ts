export type GlossaryEntry = {
  term: string;
  short: string;
  long?: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "EOA (Externally Owned Account)",
    short:
      "An Ethereum account controlled by a private key. Holds ETH and can send transactions.",
  },
  {
    term: "Contract account",
    short:
      "An account whose behavior is defined by deployed code. Cannot start a transaction, only responds to calls.",
  },
  {
    term: "Transaction hash",
    short:
      "0x-prefixed 32-byte identifier of an executed Ethereum transaction, used to look up execution details.",
  },
  {
    term: "Wei",
    short:
      "Smallest unit of ETH. 1 ETH = 10^18 wei. APIs usually return values in wei.",
  },
  {
    term: "Token transfer",
    short:
      "A movement of an ERC-20 token logged inside a transaction's event logs.",
  },
  {
    term: "Mixer",
    short:
      "A protocol that pools deposits and withdrawals to break on-chain linkability. Some are sanctioned.",
  },
  {
    term: "Coverage",
    short:
      "Whether a configured source has reported about a subject, and how much of its expected response it returned.",
  },
  {
    term: "No signal found in sources checked",
    short:
      "Configured sources returned no match. This is not a safety guarantee.",
  },
  {
    term: "Provider-native severity",
    short:
      "The severity label exactly as reported by the source. ChainSentinel never rescales provider outputs.",
  },
];