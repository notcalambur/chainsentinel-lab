# ChainSentinel Lab — UI/UX specification

**Status:** Draft for review  
**Date:** 2026-10-13  
**Visual direction:** Industrial modern, investigative, high legibility

## 1. Design intent

The interface should feel like a focused digital forensics bench: precise, technical, and calm under uncertainty. “Industrial modern” means a strong grid, restrained borders, compact data presentation, deliberate status colors, and a small number of tactile controls. Futuristic typography belongs in display headings and short labels; long explanations, evidence, and transaction data must remain easy to scan.

The app is an investigation workspace, not a trading terminal. Avoid price charts, trading motifs, animated dashboards, glowing neon everywhere, and dramatic “threat detected” treatments unsupported by evidence.

## 2. Visual system

### Color tokens

Use a dark graphite theme by default. Keep status meaning consistent and never rely on color alone.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#101316` | App background |
| `surface` | `#181E22` | Main panels and navigation |
| `surface-raised` | `#20282D` | Cards, menus, focused sections |
| `border` | `#344047` | Dividers, table rules, control outlines |
| `text-primary` | `#EDF1F2` | Main content |
| `text-secondary` | `#A7B2B7` | Metadata and supporting copy |
| `accent` | `#C7F36B` | Primary action and selected navigation; not a “safe” signal |
| `info` | `#79BFE8` | Informational or chain-derived labels |
| `caution` | `#F2BD62` | Incomplete data, review, or caution |
| `high-risk` | `#F07878` | High-severity source finding, always paired with text/icon |

Do not use green to mean that an address is safe. Reported severity remains attributed to the provider that supplied it.

### Typography

- Display and page headings: `Space Grotesk` or `Sora`, with a system sans-serif fallback.
- Body and controls: `IBM Plex Sans` or `Inter`, with a system sans-serif fallback.
- Addresses, hashes, timestamps, numeric identifiers, and code: `IBM Plex Mono` or a system monospace fallback.
- Use futuristic lettering sparingly: headings can be distinctive, but avoid extended uppercase text, overly wide tracking, and low-legibility sci-fi faces.
- Prefer bundled/self-hosted font files where licensing permits; the application must remain readable if custom fonts fail to load.

### Layout and components

- Desktop: compact left navigation rail, top investigation search, and a wide content canvas.
- Use a consistent 8px spacing scale, clear alignment, thin structural borders, and moderate corner radii (4–8px). Avoid excessive pills and floating glass effects.
- Keep data density high enough for investigation while preserving readable row height and line length.
- Use tabular numerals for amounts and timestamps; truncate long hashes visually but provide copy and full-value access.
- Buttons and inputs must have visible hover, focus, disabled, loading, and error states.

## 3. Navigation and information architecture

Primary navigation:

- **Investigate** — search and current result.
- **Saved cases** — browser-local investigations.
- **Learning** — glossary and short explanations.
- **About / data sources** — source attribution, limitations, and app version.

The active investigation owns the main workspace. Keep the subject address or transaction hash visible in the page header and provide a copy action.

## 4. Screens and key interactions

### 4.1 Investigation home

- Prominent input accepts an Ethereum address or transaction hash.
- Submit button and Enter key trigger validation.
- Explain that the app is read-only and does not require wallet connection.
- Offer a “Try demo case” action for a deterministic fixture.
- Invalid input receives inline, specific feedback before any provider request.

### 4.2 Investigation result

Header area:

- Subject type and full/copyable identifier.
- Checksum-normalized address when applicable.
- Query timestamp and network label (Ethereum Mainnet in MVP).
- Compact per-source coverage summary.

Main sections:

1. **Overview** — address/transaction facts, observed contract/EOA status when available, value/participants for a transaction.
2. **Activity** — chronological transaction rows with time, hash, from/to, value/token, status, and explorer link.
3. **Signals** — one card per source finding; show provider, provider severity label, category, observation time, explanation, and source link.
4. **Evidence** — clear provenance and normalized-versus-provider-native distinction where relevant.
5. **Notes** — user-authored notes and conclusion, visually distinct from external evidence and marked local to this browser.
6. **Learn** — contextual definitions for terms on the current screen.

Avoid a single large “risk score.” If a provider returns a score, display it as that provider’s output with its own label and model/version metadata when supplied.

### 4.3 Saved cases

- List saved cases by subject and last-updated time.
- Open, edit notes, export one case, or delete it with confirmation.
- Show a persistent “Stored only in this browser” notice and offer export as backup.
- Do not imply that browser-local data is synced or backed up.

### 4.4 Learning panel

- Explain terms in short, plain-language entries with an optional “learn more” link.
- Define concepts in context, e.g. transaction hash, gas, contract account, token transfer, mixer, and source confidence.
- Clearly separate educational explanations from case-specific findings.

## 5. States and feedback

Every provider is queried independently. The UI must support:

- **Idle:** ready for a search.
- **Validating:** input feedback while checking address/hash format.
- **Loading:** show which sources are being queried; use skeletons only for known result sections.
- **Complete:** successful source responses are visible with checked-at timestamps.
- **Partial:** preserve successful data and visibly identify failed/unconfigured providers.
- **No signal found in sources checked:** no configured source returned a match; include which sources were checked.
- **Insufficient data:** source returned too little information to draw its supported conclusion.
- **Unavailable / rate limited:** identify provider and allow a safe retry.
- **Empty activity:** explain that the configured data source returned no history; do not imply the address is unused unless source coverage supports that statement.
- **Local save/export errors:** explain whether data was saved and provide retry guidance.

Never display a green “clean/safe” badge for a no-match state.

## 6. Responsive behavior

- Desktop: persistent navigation rail and multi-column overview where space allows.
- Tablet: collapse the rail to icons or a drawer; preserve section navigation.
- Mobile: single-column cards; convert activity rows into transaction cards with labeled fields; keep copy/search actions reachable; use a bottom sheet or stacked section navigation where appropriate.
- Do not hide source coverage, provenance, or uncertainty on narrow screens.

## 7. Accessibility and content

- Use semantic landmarks and a logical heading hierarchy.
- Full keyboard operation, visible focus indicators, skip link, and sensible focus management after searches and errors.
- Status includes text/icon in addition to color; meet WCAG AA contrast for text and controls.
- Screen-reader labels for copy, explorer, severity, and provider-status actions.
- Respect reduced-motion settings; keep animations subtle and never encode status solely through motion.
- Use plain language and exact labels such as “No signal found in sources checked,” “Provider unavailable,” and “Data coverage incomplete.”

## 8. UI acceptance checks

- A first-time user can run a fixture investigation without connecting a wallet.
- Address/hash validation errors appear before network calls.
- All findings show provenance, and no-match is not represented as “safe.”
- Partial provider failure leaves successful sections available.
- Hashes can be copied and are not permanently hidden behind truncation.
- Saved-case storage and export behavior are clearly explained.
- Main search, result, saved-case, and error flows work with keyboard and at mobile width.
