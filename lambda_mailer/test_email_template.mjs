import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({ region: "eu-central-1" });

const sendTemplatedEmail = async (recipientEmail, templateData) => {
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
    FromEmailAddress: "donations@xspace.cz", // Verified sender address
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  } 
};

// Example usage
const recipientEmail = "";
const templateData = {
    donation_amount: "500 CZK", // Replace with recipient's name
  // Add other template data as needed
};

sendTemplatedEmail(recipientEmail, templateData);

