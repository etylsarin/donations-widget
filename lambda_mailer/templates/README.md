# Email Templates

This folder contains HTML email templates for donation confirmations in multiple languages.

## Files

- donation_confirmation_en.html - English template
- donation_confirmation_cs.html - Czech template
- donation_confirmation_sk.html - Slovak template
- donation_confirmation_de.html - German template

## Template Variables

All templates support the following placeholders:

| Variable | Example | Description |
|----------|---------|-------------|
| {{DONATION_AMOUNT}} | "1,500 CZK" | Formatted amount with currency |
| {{ORDER_NUMBER}} | "ORD-2025-001" | Order/transaction ID |
| {{RECIPIENT_EMAIL}} | "donor@example.com" | Donor email address |
| {{CURRENCY_CODE}} | "CZK" | ISO currency code |
| {{AMOUNT}} | "1500" | Raw numeric amount |

## Template Structure

- **Responsive design** - Works on mobile and desktop
- **Inline CSS** - Compatible with email clients
- **UTF-8 encoding** - Supports international characters
- **Gradient header** - Professional design

## Updating Templates

1. Edit the HTML file locally
2. Test in email client preview tools
3. Run the upload script from ../uploads/upload-templates.ps1
4. No Lambda redeployment needed!

## S3 Storage

Templates are stored in S3 at:
```
s3://${BUCKET_NAME}/email_templates/donation_confirmation_{lang}.html
```

Where `BUCKET_NAME` is configured via Lambda environment variable.

Lambda loads templates from S3 with fallback logic:
1. Try language-specific template (e.g., cs, sk, de)
2. Fall back to English template
3. Fall back to inline template in Lambda code
