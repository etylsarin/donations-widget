import { SESv2Client, CreateEmailTemplateCommand, UpdateEmailTemplateCommand } from "@aws-sdk/client-sesv2";
import { readFile } from 'fs/promises';

const sesClient = new SESv2Client({ region: "eu-central-1" }); // Replace with your region

const templateName = "DonationConfirmation";
const subject = "Thank you for your contribution!";
const htmlTemplatePath = "./template.html"; // Path to your HTML file
const textTemplate = "Thank you for your contribution! Your donation of {{donation_amount}} was received, we really appreciate your support.";

const createTemplate = async () => {
  try {
    // Read HTML content from the file
    const htmlTemplate = await readFile(htmlTemplatePath, "utf-8");

    const createCommand = new CreateEmailTemplateCommand({
      TemplateName: templateName,
      TemplateContent: {
        Subject: subject,
        Html: htmlTemplate,
        Text: textTemplate,
      },
    });
    const createResponse = await sesClient.send(createCommand);
    console.log("Template created:", createResponse);
  } catch (error) {
    if (error.name === "AlreadyExistsException") {
      console.log("Template already exists, updating...");
      // Read HTML content from the file (for update)
      const htmlTemplate = await readFile(htmlTemplatePath, "utf-8");

      const updateCommand = new UpdateEmailTemplateCommand({
        TemplateName: templateName,
        TemplateContent: {
          Subject: subject,
          Html: htmlTemplate,
          Text: textTemplate,
        },
      });
      const updateResponse = await sesClient.send(updateCommand);
      console.log("Template updated:", updateResponse);
    } else {
      console.error("Error creating template:", error);
    }
  }
};

createTemplate();