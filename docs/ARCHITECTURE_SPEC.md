# ChainSentinel Lab — Software architecture specification

**Status:** Draft for review  
**Date:** 2026-10-13  
**Scope:** Personal Ethereum mainnet MVP; read-only investigations

## 1. Architecture goals

- Keep the MVP simple to run and understand: one TypeScript modular web application, no microservices or queue.
- Keep provider-specific behavior behind typed adapters.
- Return useful partial results when an optional provider fails.
- Make provenance, coverage, and failure states first-class domain data.
- Keep private notes and saved cases on the user’s device.
- Keep all investigation screens read-only; isolate any later wallet interaction.

## 2. Proposed system boundaries

```text
React client
  ├─ Search, investigation views, glossary
  ├─ Local case repository (IndexedDB)
  └─ Explicit JSON export
          │ HTTPS / typed API
          ▼
TypeScript application server
  ├─ Input validation and request orchestration
  ├─ Blockchain data provider adapter
  ├─ Risk signal provider adapters (optional)
  ├─ Normalization and evidence model
  └─ Coverage aggregation and safe error mapping
          │
          ├─ Ethereum indexed-data provider / JSON-RPC
          ├─ Community abuse-report provider
          └─ Optional risk/sanctions provider

Later, isolated workspace: Solidity ReportAnchor learning contract
```

Use a maintained full-stack React/TypeScript framework chosen when implementation begins. Pin package versions then; do not make version-sensitive choices part of this design document.

## 3. Application modules

| Module | Responsibility | Depends on |
|---|---|---|
| `investigation-ui` | Search, result sections, states, notes UI | typed application API, local repository |
| `investigation-api` | Validate requests, orchestrate independent source calls | domain types, provider ports |
| `domain` | Investigation, transaction, evidence, provider coverage types | no vendor SDKs |
| `normalization` | Convert chain/provider-native data into domain types | domain |
| `providers/blockchain` | Address activity and transaction lookup | provider SDK or JSON-RPC client |
| `providers/risk/*` | Optional report/risk screening | provider SDK/HTTP API |
| `local-cases` | Save/load/delete cases in IndexedDB | domain types |
| `export` | Serialize selected case to versioned JSON | domain types |
| `learning` | Glossary and contextual help content | no provider data |

Suggested client Ethereum library: `viem`. It is used for address/hash validation helpers and typed Ethereum RPC interactions where needed. Historical activity generally requires an indexed API; do not assume a basic RPC endpoint can return a complete address history.

## 4. Data flow

1. Client identifies input kind and performs format validation.
2. Server validates again, normalizes address casing, applies request limits, and creates an investigation request.
3. Orchestrator queries the blockchain provider and configured risk providers independently with timeouts.
4. Each adapter returns normalized values, source metadata, and typed status/error; raw responses are not sent to the UI unless necessary and permitted by provider terms.
5. Orchestrator aggregates results without converting no-match into a safety verdict.
6. Client renders results and can explicitly save notes/case data locally or export JSON.
7. No private notes are sent to providers, analytics, or chain transactions.

## 5. Core domain contracts

```ts
import type { Address, Hash } from "viem";

type NetworkId = "ethereum-mainnet";
type SubjectType = "address" | "transaction";
type EvidenceKind =
  | "onchain_fact"
  | "third_party_report"
  | "third_party_model"
  | "analyst_note";

type CoverageStatus =
  | "complete"
  | "partial"
  | "unavailable"
  | "not_configured"
  | "insufficient_data";

type Investigation = {
  schemaVersion: 1;
  id: string;
  network: NetworkId;
  subjectType: SubjectType;
  subject: string;
  queriedAt: string;
  createdAt: string;
  updatedAt: string;
  providerCoverage: ProviderCoverage[];
  transactions: ChainTransaction[];
  signals: RiskSignal[];
  notes: string;
  conclusion?: string;
};

type ProviderCoverage = {
  providerId: string;
  status: CoverageStatus;
  checkedAt?: string;
  message?: string;
  sourcesChecked?: string[];
};

type Evidence = {
  id: string;
  kind: EvidenceKind;
  providerId?: string;
  observedAt: string;
  explanation: string;
  sourceUrl?: string;
  providerSeverity?: string;
  confidence?: number;
  providerModelVersion?: string;
  rawReference?: string;
};

type RiskSignal = Evidence & {
  kind: "third_party_report" | "third_party_model";
  category: string;
};

type ChainTransaction = {
  hash: Hash;
  blockNumber?: string;
  timestamp?: string;
  from: Address;
  to?: Address;
  valueWei?: string;
  tokenTransfers?: Array<{
    tokenAddress: Address;
    symbol?: string;
    amountRaw: string;
    decimals?: number;
    from: Address;
    to: Address;
  }>;
  status?: "success" | "failed" | "unknown";
  explorerUrl?: string;
  evidence: Evidence;
};

type ProviderResult<T> =
  | { status: "success"; data: T; checkedAt: string; sourceId: string }
  | { status: "no_match"; checkedAt: string; sourceId: string }
  | { status: "unavailable" | "not_configured" | "insufficient_data"; checkedAt?: string; sourceId: string; error?: ProviderError };

type ProviderError =
  | "timeout"
  | "rate_limited"
  | "unauthorized"
  | "not_found"
  | "unsupported"
  | "malformed_response"
  | "unknown";
```

Keep provider-native severity labels verbatim. Do not map unrelated provider scales to a common numeric score. Any confidence field must be identified as provider-reported and must not be treated as calibrated probability unless the provider documents that meaning.

## 6. Provider interfaces and policy

```ts
interface BlockchainDataProvider {
  getAddressActivity(address: Address, cursor?: string): Promise<ProviderResult<ChainTransaction[]>>;
  getTransaction(hash: Hash): Promise<ProviderResult<ChainTransaction>>;
}

interface RiskSignalProvider {
  screenAddress(address: Address): Promise<ProviderResult<RiskSignal[]>>;
  healthCheck(): Promise<ProviderHealth>;
}
```

Map typed provider errors to safe user-facing messages; never return secrets or raw credential-bearing URLs.

Candidate sources from the earlier comparison:

- Blockchair and BlockCypher: evaluate Ethereum mainnet history coverage, pagination, API quotas, terms, and price before selection.
- ChainAbuse: candidate community-report source; evaluate API access, coverage, license, quota, and the meaning of verification/confidence fields.
- AI DECISIONS: optional external model signal; present its score as vendor output and verify terms, data handling, and current API behavior before use.

Do not scrape pages or bypass quotas. Implement fixtures and adapter tests before wiring external credentials. Provider access and terms must be revalidated at implementation time because they may change.

## 7. Persistence and export

- MVP saved investigations and notes live in IndexedDB on the current browser/device.
- No server database, account system, or synchronization in MVP.
- Include a `schemaVersion` in local records and exports for future migrations.
- JSON export is triggered explicitly by the user and includes only the selected investigation.
- Local storage is not a backup; explain the device-local limitation.
- Do not persist provider raw payloads unless required, permitted, and explicitly justified.

## 8. Security and privacy requirements

- Never request, receive, log, or store seed phrases or private keys.
- Do not require wallet connection for investigation or note-taking.
- Keep provider keys server-side in environment variables; redact them from logs and errors.
- Validate and normalize addresses/hashes on both client and server.
- Apply request timeouts, server-side rate limits, bounded pagination, and response-size limits.
- Treat external report text as untrusted content; render as text, sanitize any supported markup, and prevent script execution.
- Do not send analyst notes to providers or third-party analytics.
- Do not place investigation notes or evidence on-chain.
- Log operational status without recording sensitive notes or API credentials.
- Keep any future wallet action isolated in a separate user-initiated flow with explicit confirmation.

## 9. Future Solidity learning milestone: `ReportAnchor`

This contract is outside the MVP and must not delay it. If implemented later:

- Solidity + Foundry; local Anvil test environment first.
- Accept a salted `bytes32` commitment only; never store report contents, addresses, notes, or evidence on-chain.
- Reject zero and duplicate commitments; emit commitment, publisher, timestamp, and chain ID.
- Keep the prototype small and non-upgradeable; no token, minting, transfer, rewards, or governance.
- Generate a random salt client-side and warn about public-chain permanence and gas before asking for signature.
- Public testnet deployment requires a separate explicit user decision and wallet configuration.

Hash commitments can leak predictable content if unsalted. Tests must cover zero/duplicate values, event fields, chain ID, and fuzzed commitments.

## 10. Verification strategy

- Unit tests: address/hash validation, normalization, timestamp conversion, duplicate handling, and coverage aggregation.
- Provider contract tests: fixtures for success, no-match, timeout, rate limit, malformed response, unsupported data, and partial result.
- Local repository tests: save/load/update/delete and schema version behavior.
- End-to-end test: demo search → result → add note → reload → export.
- Build checks: format, lint, TypeScript type check, unit tests, production build.
- When the optional contract is added: Foundry unit and fuzz tests; no deployment in CI.

Acceptance requires a failed optional provider to leave successful results intact; no-match, unavailable, not configured, and insufficient data must remain distinct; demo flow must work without secrets or network access.

## 11. Evolution boundaries

1. MVP: read-only Ethereum investigation, fixtures, one blockchain history source, local notes/export, glossary.
2. Add optional risk sources behind adapters after terms and coverage are verified.
3. Build the Solidity learning contract locally as a separate milestone.
4. Consider SaaS only after personal use demonstrates demand; authentication, cloud storage, tenant isolation, billing, operations, and licensing require a new design.
5. Consider tokenization only for a specific product function with a threat model and abuse analysis; it is not a planned MVP feature.

## 12. Reference documentation

- ChainAbuse API: https://docs.chainabuse.com/docs/welcome-to-chainabuse-api
- Blockchair API: https://blockchair.com/api/docs
- BlockCypher API: https://www.blockcypher.com/apis.html
- AI DECISIONS API: https://www.aidecisions.ai/docs
- Ethereum smart-contract testing: https://ethereum.org/developers/docs/smart-contracts/testing/
- Solidity documentation: https://docs.solidity.org/
- viem documentation: https://viem.sh/docs/getting-started
- Foundry documentation: https://www.getfoundry.sh/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
