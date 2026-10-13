# ChainSentinel Lab

Personal, read-only Ethereum mainnet investigation workspace. MVP.

> Status: design phase. Implementation not started.

## Design documents

The implementation plan and code come after these are reviewed and approved:

1. [PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) — user, problem, MVP boundary, principles.
2. [UI_UX_SPEC.md](docs/UI_UX_SPEC.md) — visual language, navigation, screens, accessibility.
3. [ARCHITECTURE_SPEC.md](docs/ARCHITECTURE_SPEC.md) — modules, data contracts, providers, privacy, security, testing.

## Planned stack

- **Next.js 15** (App Router) + **TypeScript** strict
- **viem** for address/hash validation and typed RPC interactions
- **Tailwind v4** for styling (tokens from `UI_UX_SPEC.md` §2)
- **pnpm** workspaces
- **vitest** for unit, **Playwright** for E2E
- Provider APIs stay behind typed adapters; real provider wiring only after fixtures pass and terms are revalidated.

No wallet, no auth, no cloud sync, no token, no smart contract in MVP.
