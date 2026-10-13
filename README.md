# ChainSentinel Lab

Personal, read-only Ethereum mainnet investigation workspace. MVP.

> Status: MVP scaffolded. The demo flow runs against local fixtures so it works without API keys, without network access, and without a wallet.

## Design documents

1. [PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) — user, problem, MVP boundary, principles.
2. [UI_UX_SPEC.md](docs/UI_UX_SPEC.md) — visual language, navigation, screens, accessibility.
3. [ARCHITECTURE_SPEC.md](docs/ARCHITECTURE_SPEC.md) — modules, data contracts, providers, privacy, security, testing.

## Stack

- **Next.js 15** (App Router) + **TypeScript** strict
- **viem** for address/hash validation and EIP-55 checksum normalisation
- **Tailwind v4** for styling (tokens from `UI_UX_SPEC.md` §2)
- **Vitest** for unit tests
- IndexedDB (vanilla) for browser-local case storage

No wallet, no auth, no cloud sync, no token, no smart contract in MVP.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm build        # next build
```

## Routes

- `/` — investigation entry (search + demo case)
- `/investigate/[subject]` — result (Overview, Activity, Signals, Evidence, Notes, Learn)
- `/saved` — browser-local cases
- `/learn` — glossary
- `/about` — data sources and limits

## MVP scope reminder

This MVP is intentionally offline-first. Provider adapters are stubbed with
fixtures so the demo flow works without secrets. Real provider wiring is
gated on (a) revalidating terms at implementation time and (b) adapter
contract tests passing against fixtures first — both documented in
`docs/ARCHITECTURE_SPEC.md` §6 and §10.
