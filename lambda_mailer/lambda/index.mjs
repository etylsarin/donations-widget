import { Resend } from 'resend';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import currencyCodes from 'currency-codes';

// Configuration constants
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@donations.example.com';
const CHARSET = "UTF-8";
const BUCKET_NAME = process.env.BUCKET_NAME; // Required: S3 bucket name for templates and audit logs
const AMOUNT_DIVISOR = 100; // Amount stored in cents

// Validate required environment variables
if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME environment variable is required');
}

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);
const s3Client = new S3Client({});

export const handler = async (event) => {
    if (event.requestContext?.http?.method === "OPTIONS") {
        return cors_data;
    }
    try {
        let orderNumber;

        // Support both API Gateway and direct invocation formats
        if (event.requestContext?.http?.method) {
            // API Gateway format
            orderNumber = JSON.parse(event.body).parameters?.orderNumber
        } else if (event.parameters?.orderNumber) {
            // Direct invocation format (for testing)
            orderNumber = event.parameters.orderNumber;
        } else {
            console.error("Invalid event format.");
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid event format." }) };
        }

        if (!orderNumber) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing orderNumber" }) };
        }

        // Validate orderNumber to prevent path traversal attacks
        if (typeof orderNumber !== 'string' || orderNumber.includes('..') || orderNumber.includes('/') || orderNumber.includes('\\')) {
            console.error(`Invalid order number format: ${orderNumber}`);
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid order number format" }) };
        }

        let recipientEmail;
        let donationAmount;
        let currencyCode;
        let currencyNumber;
        let lang

        try {
            const getObjectParams = {
                Bucket: BUCKET_NAME,
                Key: `audit_logs/${orderNumber}.json`,
            };
            const getObjectCommand = new GetObjectCommand(getObjectParams);
            const getObjectResponse = await s3Client.send(getObjectCommand);
            const emailBodyString = await getObjectResponse.Body?.transformToString(CHARSET);

            if (!emailBodyString) {
                console.error(`Could not read content from file: audit_logs/${orderNumber}.json`);
                return { statusCode: 404, body: JSON.stringify({ message: "Email data not found." }) };
            }

            try {
                const emailBody = JSON.parse(emailBodyString);
                recipientEmail = emailBody.email;
                donationAmount = emailBody.amount / AMOUNT_DIVISOR;
                currencyNumber = emailBody.currency;
                lang = emailBody.lang.slice(0,2);

                if (!recipientEmail || donationAmount === undefined || !currencyNumber) {
                    console.error(`Missing email, amount, or currency in JSON for order: ${orderNumber}`);
                    return { statusCode: 400, body: JSON.stringify({ message: "Missing data in file." }) };
                }

                currencyCode = currencyCodes.number(currencyNumber)?.code;
                
            } catch (jsonError) {
                console.error("JSON Parsing Error:", jsonError);
                return { statusCode: 500, body: JSON.stringify({ message: "Error parsing email data." }) };
            }

        } catch (s3Error) {
            console.error("S3 Error:", s3Error);
            return { statusCode: 500, body: JSON.stringify({ message: "Error accessing email data file." }) };
        }

        // Prepare email data for Resend
        const donationAmountFormatted = `${donationAmount} ${currencyCode}`;
        
        // Get email subject based on language
        const subjects = {
            cs: 'Potvrzení o darování',
            en: 'Donation Confirmation',
            sk: 'Potvrdenie o darovaní',
            de: 'Spendenbestätigung'
        };
        const subject = subjects[lang] || subjects['en'];

        // Load HTML email template from S3
        let htmlTemplate;
        try {
            const templateParams = {
                Bucket: BUCKET_NAME,
                Key: `email_templates/donation_confirmation_${lang}.html`,
            };
            const templateCommand = new GetObjectCommand(templateParams);
            const templateResponse = await s3Client.send(templateCommand);
            htmlTemplate = await templateResponse.Body?.transformToString(CHARSET);

            if (!htmlTemplate) {
                console.warn(`Template not found for language: ${lang}, using default`);
                // Fallback to English template
                const fallbackParams = {
                    Bucket: BUCKET_NAME,
                    Key: `email_templates/donation_confirmation_en.html`,
                };
                const fallbackCommand = new GetObjectCommand(fallbackParams);
                const fallbackResponse = await s3Client.send(fallbackCommand);
                htmlTemplate = await fallbackResponse.Body?.transformToString(CHARSET);
            }
        } catch (templateError) {
            console.warn("Template load error, using inline fallback:", templateError);
            // Fallback to inline template if S3 fails
            htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2c3e50;">Thank you for your donation!</h1>
                        <p>We have received your donation of <strong>{{DONATION_AMOUNT}}</strong>.</p>
                        <p>Your support helps us continue our mission.</p>
                        <p style="margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                            Order Number: {{ORDER_NUMBER}}
                        </p>
                    </div>
                </body>
                </html>
            `;
        }

        // HTML escape function to prevent XSS
        const escapeHtml = (str) => {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        // Replace template variables with escaped values
        const htmlContent = htmlTemplate
            .replace(/{{DONATION_AMOUNT}}/g, escapeHtml(donationAmountFormatted))
            .replace(/{{ORDER_NUMBER}}/g, escapeHtml(orderNumber))
            .replace(/{{RECIPIENT_EMAIL}}/g, escapeHtml(recipientEmail))
            .replace(/{{CURRENCY_CODE}}/g, escapeHtml(currencyCode))
            .replace(/{{AMOUNT}}/g, escapeHtml(donationAmount.toString()));

        try {
            // Send email using Resend
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: SENDER_EMAIL,
                to: recipientEmail,
                subject: subject,
                html: htmlContent,
                tags: [
                    { name: 'type', value: 'donation_confirmation' },
                    { name: 'language', value: lang },
                    { name: 'order', value: orderNumber }
                ]
            });

            if (emailError) {
                console.error("Resend Error:", emailError);
                return { 
                    statusCode: 500, 
                    body: JSON.stringify({ 
                        message: "Error sending email.",
                        error: emailError.message 
                    }) 
                };
            }

            console.log("Email sent successfully:", emailData.id);

            // Move processed audit log to archive folder
            const copyObjectParams = {
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/audit_logs/${orderNumber}.json`,
                Key: `audit_logs_mailed/${orderNumber}.json`
            };

            const getObjectParams = {
                Bucket: BUCKET_NAME,
                Key: `audit_logs/${orderNumber}.json`,
            };

            // Copy to archive and delete original
            await s3Client.send(new CopyObjectCommand(copyObjectParams));
            await s3Client.send(new DeleteObjectCommand(getObjectParams));

            console.log(`Audit log archived: ${orderNumber}`);

            return { 
                statusCode: 200, 
                body: JSON.stringify({ 
                    message: "Email sent successfully.",
                    emailId: emailData.id 
                }) 
            };
        } catch (emailSendError) {
            console.error("Email sending error:", emailSendError);
            return { 
                statusCode: 500, 
                body: JSON.stringify({ 
                    message: "Error sending email.",
                    error: emailSendError.message 
                }) 
            };
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "An unexpected error occurred." }) };
    }
};

const cors_headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "max-age=0, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: 0
};

const cors_data = {
    multiValueHeaders: {},
    isBase64Encoded: false,
    statusCode: 200,
    headers: cors_headers,
    body: ""
};
