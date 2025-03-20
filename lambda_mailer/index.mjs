import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({});

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const CHARSET = "UTF-8";

export const handler = async (event) => {
    try {
        let recipient

        if (event.httpMethod) {
            recipient = event.queryStringParameters?.recipient;        
        } else {
            console.error("Invalid event format.");
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid event format." }) };
        }

        if (!recipient) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing recipient" }) };
        }

        const templateData = {
            donation_amount: "500 CZK"
        };

        const params = {
            Destination: {
              ToAddresses: [recipientEmail],
            },
            Content: {
              Template: {
                TemplateName: "DonationConfirmation",
                TemplateData: JSON.stringify(templateData), // Template data as JSON string
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