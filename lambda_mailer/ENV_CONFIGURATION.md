# Environment Configuration

This document explains how to configure environment variables for the Lambda email mailer.

## Required Environment Variables

### Lambda Function

The following environment variables must be configured in AWS Lambda:

#### `RESEND_API_KEY` (Required)
- **Description**: API key for Resend email service
- **Example**: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **How to get**: Sign up at https://resend.com and create an API key
- **Security**: Store in AWS Lambda environment variables (encrypted at rest)

#### `BUCKET_NAME` (Required)
- **Description**: S3 bucket name for email templates and audit logs
- **Example**: `your-company-bucket`
- **Structure**: 
  - `email_templates/` - HTML email templates
  - `audit_logs/` - Incoming payment audit logs
  - `audit_logs_mailed/` - Processed audit logs (archived)

#### `SENDER_EMAIL` (Optional)
- **Description**: Email address used as the sender for donation confirmations
- **Example**: `no-reply@donations.yourcharity.org`
- **Default**: `no-reply@donations.example.com`
- **Requirements**: Domain must be verified in Resend
- **Security**: Public value, but should match your organization's domain

### Upload Script

For running the template upload script (`uploads/upload-templates.ps1`):

#### `S3_BUCKET_NAME` (Required)
- **Description**: S3 bucket name for uploading templates
- **PowerShell**: `$env:S3_BUCKET_NAME = "your-bucket-name"`
- **Bash/Linux**: `export S3_BUCKET_NAME=your-bucket-name`

#### `AWS_REGION` (Optional)
- **Description**: AWS region for S3 bucket
- **Default**: `eu-central-1`
- **PowerShell**: `$env:AWS_REGION = "eu-central-1"`
- **Bash/Linux**: `export AWS_REGION=eu-central-1`

## AWS Lambda Configuration

### Via AWS Console

1. Open AWS Lambda console
2. Select your Lambda function (e.g., `your_confirm_mailer`)
3. Go to Configuration → Environment variables
4. Add/Edit:
   - `RESEND_API_KEY`: Your Resend API key
   - `BUCKET_NAME`: Your S3 bucket name
   - `SENDER_EMAIL`: Your sender email address (optional)

### Via AWS CLI

```bash
aws lambda update-function-configuration \
  --function-name your_confirm_mailer \
  --environment Variables="{RESEND_API_KEY=re_your_key,BUCKET_NAME=your-bucket,SENDER_EMAIL=no-reply@donations.yourcharity.org}" \
  --region eu-central-1
```

## IAM Permissions

The Lambda function requires the following S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use AWS Secrets Manager** for production secrets (optional enhancement)
3. **Rotate API keys** regularly
4. **Use IAM roles** with least privilege principle
5. **Enable CloudTrail** for audit logging
6. **Encrypt environment variables** at rest (enabled by default in Lambda)

## Local Development

For local testing, create a `.env` file (DO NOT commit):

```env
RESEND_API_KEY=re_your_development_key
BUCKET_NAME=your-dev-bucket
```

Add `.env` to `.gitignore` to prevent accidental commits.
