# Deployment Configuration

Project-specific deployment infrastructure referenced by the `deployment-infrastructure` skill.

## Architecture

Everything is deployed by hand. There is no CI (no `.github/workflows/`) and no infrastructure-as-code.

- **Widget → GitHub Pages.** `npx nx build sandbox` writes `dist/sandbox`. Vite uses `base: '/donations-widget/'`, and `vite-plugin-css-injected-by-js` puts the CSS into each widget's shadow root. `yarn deploy:sandbox` (`gh-pages -d dist/sandbox`) then pushes that folder to the `gh-pages` branch of `etylsarin/donations-widget`, served at https://etylsarin.github.io/donations-widget/.
- **Host pages load the bundle by file name.** `sandbox/wix.html` is the embed snippet. On `main`, Vite names the bundle `assets/index-<hash>.js`, so the embed's script URL must change after every deploy. Today `wix.html` points at `assets/index-BhPgMZMa.js`, which is not on the `gh-pages` branch. That branch holds `assets/donations-widget.js` and `assets/index-qQrimZSA.js`.
- **Lambdas → AWS (`eu-central-1`).** `lambda/` and `lambda_mailer/lambda/` are plain ES-module handlers (`export const handler`). The repo has no packaging or deploy script. `lambda/node_modules/` is committed and holds only `@topmonks/gpwebpay`. The `@aws-sdk/*` packages that `lambda/index.mjs` imports are not in its `package.json`. `ENV_CONFIGURATION.md` shows how to set the mailer's configuration from the console or with `aws lambda update-function-configuration`.
- **Email templates → S3.** `lambda_mailer/uploads/upload-templates.ps1` copies `lambda_mailer/templates/*.html` to `s3://$S3_BUCKET_NAME/email_templates/` with the AWS CLI. The mailer reads them on every call, so a template change needs no Lambda redeploy.

## Apps & URLs

See the Apps & Deployment table in `project.instructions.md`.

## Cron Jobs

None. The repo defines no scheduled jobs.

## Environment Variables

The widget uses none: it is configured by HTML attributes. The payment Lambda uses none either: its settings are hardcoded in `lambda/index.mjs`.

| Variable | Purpose | Required For |
|----------|---------|--------------|
| `RESEND_API_KEY` | Resend API key | `lambda_mailer` |
| `BUCKET_NAME` | S3 bucket for templates and audit logs; the handler throws at load without it | `lambda_mailer` |
| `SENDER_EMAIL` | From address; defaults to `no-reply@donations.example.com`. Its domain must be verified in Resend | `lambda_mailer` (optional) |
| `S3_BUCKET_NAME` | Target bucket for the template upload | `upload-templates.ps1` |
| `AWS_REGION` | Region for the upload; defaults to `eu-central-1` | `upload-templates.ps1` (optional) |

## Caching Headers

| Source Pattern | Cache-Control |
|----------------|---------------|
| Mailer OPTIONS response (`lambda_mailer/lambda/index.mjs`) | `max-age=0, no-store, must-revalidate`, plus `Pragma: no-cache` and `Expires: 0` |
| Widget files on GitHub Pages | No header config in the repo; Vite content-hashes `assets/index-<hash>.js` |

## Security Headers

None are set in the repo apart from the mailer's CORS headers on OPTIONS (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: Content-Type`). See the `security-hardening` skill.

## Key Files

- `package.json` — `deploy:sandbox`
- `sandbox/project.json` — Nx targets `build`, `serve`, `preview`, `serve-static`, `test`, `lint`
- `sandbox/vite.config.ts` — `base`, ports, output dir, CSS injection
- `sandbox/wix.html` — embed snippet for the host site
- `lambda_mailer/ENV_CONFIGURATION.md` — mailer env vars, IAM policy, AWS CLI commands
- `lambda_mailer/uploads/upload-templates.ps1` — template upload

## Still to describe

- How the two Lambdas are packaged and deployed: function names, Node.js runtime version, IAM roles. None of it is in the repo.
- Whether there is a production environment apart from the test setup. The payment Lambda uses GP webpay's test gateway, and the only API Gateway URL in the repo is the one in `sandbox/index.html` and `sandbox/wix.html`.
