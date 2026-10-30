# keystone-site

The public site for [Keystone](https://github.com/azzammasood/keystone-pipeline), an open-source
supply-chain radar. It renders only the pipeline's published exports (the `site-data` release of
keystone-pipeline). It computes no scores of its own and invents nothing: a dataset that is missing,
partial or fails its checks is shown as such.

Static Next.js, React, TypeScript and Tailwind, exported for GitHub Pages. English only.

## How data gets in

1. `npm run data` downloads `index.json` and every file it lists from the release. Each file is
   checked against the index (size, sha256) and its JSON Schema (`schemas/`, copied from the
   pipeline's `contracts/`). Rejected files are left out and the reason is recorded in
   `data/site/_fetch.json`.
2. `npm run build` reads `data/site/` at build time. A page whose export is unavailable shows
   *pending data* with the reason. An export's own `status` (*partial data*, *pending data*,
   *skipped*) is always shown.
3. Every figure is rendered through `<V>` (`src/components/V.tsx`), which records the file and
   JSON Pointer it came from. `tests/e2e/trace.spec.ts` resolves every one against the data and
   fails on any mismatch, or on any digit in the page that is not traced.

`fixtures/site-data/` is a snapshot of real exports (generated 2026-10-23). It is used for CI and
local development only; the deployed site always uses the live release.

## Commands

```bash
npm ci
npm run data:fixture        # or: npm run data  (live release)
npm run dev
npm run lint && npm run typecheck && npm test
npm run build && npm run test:e2e   # trace + axe (light and dark) on the built site
npm run schemas:check       # schemas/ still equal to keystone-pipeline main
```

## Gates

- **CI** (`.github/workflows/ci.yml`): schema sync, lint, types, unit tests, and a strict build from
  the fixture. Then the trace test and axe (WCAG 2.2 AA tags) on every page in light and dark mode.
- **Deploy** (`.github/workflows/deploy.yml`): builds from the live release, runs the same gates,
  and publishes to Pages when the repository variable `PAGES_ENABLED` is `true`. It runs daily
  after the pipeline's publish and on `repository_dispatch` (`site-data`).
- No pipeline logic is duplicated in the browser, so there are no parity tests yet. Any logic
  copied from the pipeline must come with one.

## Rules

Repository and package level only: no people, no logins, no emails. "Signals", never predictions.
Motion follows real metrics: the intro shows one tile per archive hour loaded, the seabed's bumps
are column counts from lineage, and the Pipeline Live flow lines move at measured records per
second, which keeps them still when nothing moved. `prefers-reduced-motion` turns motion off.
$0: free tiers only.

Design history: `docs/design/` (the Sonar concept with the seabed scan was chosen).
