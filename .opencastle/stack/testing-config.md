# Testing Configuration

Project-specific testing details referenced by the `browser-testing` skill.

The repo has no tests yet. Vitest is configured in `sandbox/vite.config.ts`: `jsdom`, `globals: true`, files matching `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`, v8 coverage to `coverage/sandbox`. Run it with `npx nx test sandbox`; `@testing-library/preact` is installed. Cypress 13 and `@nx/cypress` are installed, but there is no Cypress config or e2e project. The root `jest.config.ts` and `jest.preset.js` exist, but no project uses `@nx/jest`.

## Primary Test App

- **App:** `sandbox` (port 4200) at http://localhost:4200/donations-widget/. The Vite `base` is `/donations-widget/`.
- **Pre-test build:** none for `serve`. `npx nx build sandbox` comes first for `npx nx preview sandbox` (port 4300).
- **Start server:** `npx nx serve sandbox`
- **Careful:** `sandbox/index.html` sets `pg-url` to the live API Gateway. Submitting the donor form calls the real payment Lambda and redirects to GP webpay's test gateway. To see the return states without paying, open the page with `?RESULTTEXT=OK&ORDERNUMBER=<n>` (success, which also fires the confirmation-email call) or any other `RESULTTEXT` (error).

## Data Test IDs

None: `sandbox/src` has no `data-testid`. The UI renders in an **open shadow root** (`register(..., { shadow: true })`), so selectors must go through `document.querySelector('donations-widget').shadowRoot`.

| Selector | Element |
|----------|---------|
| `donations-widget` | Custom element host; holds the shadow root |
| `[aria-label="donations-widget-placeholder"]` | Placeholder in `sandbox/index.html` that the page script replaces with the widget |
| `input[name="repetition"]` | Once/monthly radios; only with `recurrent="true"` |
| `input[name="amount-preset"]` | Preset amounts (radios inside `label[role="button"]`) |
| `#toggle button`, `input[name="amount"]` | "Other amount" toggle, then the custom amount input (number, 1–1,000,000) |
| `input[type="checkbox"]` | Opt-ins; each is named after its translated label, so match by label text |
| `input[name="firstName"]`, `input[name="lastName"]`, `input[name="email"]` | Donor step fields |
| `input[name="companyName"]`, `input[name="companyAddress"]`, `input[name="crn"]` | Company fields; shown after the "Donating on behalf of a company" checkbox |
| `button[type="submit"]` | Continue / Donate; disabled while the status is `BUSY` |

## Breakpoints

No breakpoints: there are no `@media` rules in `sandbox/src`. The widget's `.wrapper` (`App.module.css`) is `min-width: 320px; max-width: 540px`, so check it at 320px and at 540px or wider.

## E2E Test Suites

None yet.

## Reporting Format

```markdown
## Browser Test: [Feature Name]
**Date:** [Date] | **App:** sandbox (localhost:4200/donations-widget/)

| Test | Status | Notes |
|------|--------|-------|
| Page loads | ✅ PASS | |
| Interaction works | ⚠️ ISSUE | Description |
| Edge case handled | ✅ PASS | |
```

## Test Results Log

No location is set in the repo; see below.

## Still to describe

- Where to log browser test results. The repo has no convention for it.
