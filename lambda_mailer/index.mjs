import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import currencyCodes from 'currency-codes';

const sesClient = new SESv2Client({});
const s3Client = new S3Client({});

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const CHARSET = "UTF-8";

export const handler = async (event, context) => {
    if (event.requestContext?.http?.method === "OPTIONS") {
        return cors_data;
    }
    try {
        let orderNumber;

        if (event.httpMethod) {
            orderNumber = event.queryStringParameters?.orderNumber;
        } else {
            console.error("Invalid event format.");
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid event format." }) };
        }

        if (!orderNumber) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing orderNumber" }) };
        }

        let recipientEmail;
        let donationAmount;
        let currencyCode;
        let currencySymbol;

        try {
            const getObjectParams = {
                Bucket: "mc-happy-hearts", // Hardcoded bucket name
                Key: `audit_logs/${orderNumber}.json`, // Updated key structure
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
                donationAmount = emailBody.amount;
                currencyCode = emailBody.currency;

                if (!recipientEmail || donationAmount === undefined || !currencyCode) {
                    console.error(`Missing email, amount, or currency in JSON for order: ${orderNumber}`);
                    return { statusCode: 400, body: JSON.stringify({ message: "Missing data in file." }) };
                }

                const currencyInfo = currencyCodes.find(code => code.number === currencyCode);
                currencySymbol = currencyInfo ? currencyInfo.code : currencyCode; // Use the ISO code as the symbol
                
            } catch (jsonError) {
                console.error("JSON Parsing Error:", jsonError);
                return { statusCode: 500, body: JSON.stringify({ message: "Error parsing email data." }) };
            }

        } catch (s3Error) {
            console.error("S3 Error:", s3Error);
            return { statusCode: 500, body: JSON.stringify({ message: "Error accessing email data file." }) };
        }

        const templateData = {
            donation_amount: `${donationAmount} ${currencySymbol}`
        };

        const params = {
            Destination: {
                ToAddresses: [recipientEmail],
            },
            Content: {
                Template: {
                    TemplateName: "DonationConfirmation",
                    TemplateData: JSON.stringify(templateData),
                },
            },
            FromEmailAddress: SENDER_EMAIL
        };

        try {
            const command = new SendEmailCommand(params);
            const sesResponse = await sesClient.send(command);
            console.log("Email sent:", sesResponse.MessageId);
            return { statusCode: 200, body: JSON.stringify({ message: "Email sent." }) };
        } catch (sesError) {
            console.error("SES Error:", sesError);
            return { statusCode: 500, body: JSON.stringify({ message: "Error sending email." }) };
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