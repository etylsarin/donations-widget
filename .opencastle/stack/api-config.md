# API Configuration

Project-specific API inventory referenced by the `api-patterns` skill.

The backend is two AWS Lambda handlers behind API Gateway (`https://wazxcc9io0.execute-api.eu-central-1.amazonaws.com`, the `pg-url` in `sandbox/index.html` and `sandbox/wix.html`). The mailer reads the payload-v2 event shape (`event.requestContext.http.method`). The widget calls them at `{pg-url}` + the paths in `sandbox/src/enums.ts` → `Routes`. Both requests are `POST` with `Content-Type: application/json` and a body of `{ "parameters": { … } }`.

## API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/integration/hh_request_payment` | POST | `lambda/index.mjs`: signs a GP webpay `CREATE_ORDER` and returns the gateway URL as the response body. The widget sends `amount` (minor units, ×100), `currency` (ISO 4217 numeric: 203/840/978), `orderNumber` (≤15 digits), `redirect_url`, `lang` and the donor fields (`firstName`, `lastName`, `email`, `companyName`, `companyAddress`, `crn`). The handler uses only the first four. | None |
| `/integration/hh_confirm_payment` | POST | `lambda_mailer/lambda/index.mjs`: takes `orderNumber`, reads `audit_logs/{orderNumber}.json` from S3, emails the donor through Resend and moves the log to `audit_logs_mailed/`. Returns `{ message, emailId }` as JSON, or 400/404/500 with `{ message }`. | None |
| `/integration/hh_confirm_payment` | OPTIONS | Same handler: CORS preflight, 200 with an empty body | None |

## Server Actions

None. This is not a server-rendered framework; all server code is the two Lambda handlers above.

## Security Layers

- **No auth and no rate limiting in the code.** Any throttling or CORS for `hh_request_payment` would live in API Gateway, which is not in the repo.
- **Payment result is trusted client-side.** The widget reads `RESULTTEXT` and `ORDERNUMBER` from the return URL. On `OK` it shows success and calls `hh_confirm_payment`. No code here verifies GP webpay's response `DIGEST`.
- **Mailer input checks:** it rejects an `orderNumber` that is not a string or contains `..`, `/` or `\`, and HTML-escapes every value it puts into a template.
- **Payment Lambda:** no input validation. The signing key comes from S3; the bucket, object key, merchant number and gateway URL are hardcoded in `lambda/index.mjs`.
- **CORS:** only the mailer's OPTIONS reply sets headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: Content-Type`.

## External APIs

| API | Purpose | Used In |
|-----|---------|---------|
| GP webpay HTTP API (`https://test.3dsecure.gpwebpay.com/pgw/order.do`, test gateway) | Card payment page; order URL signed with `@topmonks/gpwebpay` | `lambda/index.mjs` |
| Resend | Sends the donation confirmation email, tagged `type`, `language`, `order` | `lambda_mailer/lambda/index.mjs` |
| AWS S3 | GP webpay private key; `audit_logs/`, `audit_logs_mailed/`, `email_templates/donation_confirmation_{cs,de,en,sk}.html` | Both Lambdas; `lambda_mailer/uploads/upload-templates.ps1` |

## Key Files

- `sandbox/src/enums.ts` — `Routes`, `CurrencyCode`
- `sandbox/src/App.tsx` — builds both requests and handles the return from GP webpay
- `lambda/index.mjs` — payment-request handler
- `lambda_mailer/lambda/index.mjs` — confirmation-email handler
- `lambda_mailer/ENV_CONFIGURATION.md` — mailer env vars and IAM permissions
- `.github/instructions/gpwebpay-integration.instructions.md` — GP webpay parameters, signing, response codes

## Still to describe

- Which API Gateway route invokes which Lambda: the pairing above is by payload shape, and the gateway's route, CORS and throttling setup is not in the repo.
- What writes `audit_logs/{orderNumber}.json` to S3. The mailer needs it (`email`, `amount`, `currency`, `lang`), but `lambda/index.mjs` does not write it.
