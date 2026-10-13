# ChainSentinel Lab — Product brief

**Status:** Draft for review  
**Date:** 2026-10-13

## Product

ChainSentinel Lab is a personal, read-only web app for investigating Ethereum addresses and transactions while learning to interpret on-chain activity and external risk reports. It is intended as a hands-on Web3 learning project and portfolio piece.

The main job is: “When I enter an Ethereum address or transaction, help me understand what happened, whether configured sources report risk signals, and how complete and reliable the evidence is.”

## MVP user and outcomes

The MVP serves one personal user. It has no accounts, teams, billing, or cloud synchronization. A user should be able to:

- Investigate an Ethereum mainnet address or transaction without connecting a wallet.
- Review normalized activity and source-attributed signals.
- Distinguish chain facts, third-party reports, external model output, and personal notes.
- Save notes locally and export an investigation as JSON.
- Learn relevant Ethereum concepts in context.

## Product principles

- Show evidence and provenance before interpretation.
- Explain uncertainty and data coverage; no match is not proof of safety.
- Keep private notes and detailed investigation data off-chain.
- Keep the app useful with demo fixtures even when APIs are unavailable.
- Hide provider-specific response formats behind replaceable adapters.
- Build a useful product before considering SaaS or tokenization.

## MVP scope

### Included

- Ethereum mainnet only; address and transaction-hash validation.
- Address overview, recent activity, basic transaction details, and explorer links.
- Independent, optional risk-source checks with explicit per-provider status.
- Locally saved investigations, notes, conclusions, and JSON export.
- Contextual glossary and demo cases.
- Responsive desktop-first analyst workspace.

### Excluded

- Solana or other chains; wallet custody, signing, transaction broadcasting, swaps, or fund movement.
- A proprietary universal “safe/unsafe” score, automated blocking, or law-enforcement conclusions.
- Authentication, teams, cloud sync, public case sharing, billing, or SaaS operations.
- Any token, governance, staking, rewards, or token sale.
- Smart-contract auditing or automated exploit detection.

## Trust and interpretation rules

Every displayed item must be labeled as one of:

- `onchain_fact`: derived from blockchain transaction or block data.
- `third_party_report`: a report submitted to or curated by an external service.
- `third_party_model`: a risk inference produced by an external model.
- `analyst_note`: content written by the user.

Do not merge those categories into an unexplained global verdict. A source returning no match must be described as “no signal found in sources checked,” never “safe.” Provider outage, missing configuration, and insufficient data must remain distinct states.

## Future direction

After the read-only product is useful, possible separate milestones are additional risk sources, a locally tested Solidity `ReportAnchor` contract that anchors only a salted report commitment, and later evaluation of a hosted product. These are not MVP requirements. A token is only considered if a concrete product need emerges.

## Acceptance outcomes

- An address can be investigated without wallet connection or signature.
- Every result identifies its source and relevant observation time.
- Partial provider failures do not erase successful results.
- No-match, unavailable, unconfigured, and insufficient-data states are visibly different.
- Notes persist in the current browser and export only on explicit user action.
- Demo fixtures support the main flow without API keys or network access.
