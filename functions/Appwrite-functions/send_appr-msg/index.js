import { Client } from "node-appwrite";
import nodemailer from "nodemailer";

// Environment Variables
const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    // SMTP details:
    SMTP_USER,
    SMTP_PASS,
    SMTP_HOST,
    SMTP_PORT,
    FROM_EMAIL,
    FROM_NAME,
} = process.env;

export default async ({ req, res, log }) => {
    try {
        // log("Received event for article publication notification.");
        // log("Raw body:", req.body);

        // Ensure request body exists
        if (!req.body) {
            return res.send("No body received.");
        }

        let payload;
        try {
            payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        } catch (err) {
            log("Failed to parse body:", req.body);
            return res.send("Invalid JSON body: " + err.message);
        }

        // Validate required fields from the document
        const { $id, email, firstName, lastName, articleTitle } = payload;
        if (!$id || !email || !firstName || !lastName || !articleTitle) {
            return res.send("Missing required fields.");
        }

        // Construct the article link
        const articleLink = `https://beyondsciencemagazine.studio/user-uploads/articles/view.html?articleID=${$id}`;

        // Compose email content using HTML
        const subject = "Congratulations! Your Article Has Been Published!";
        const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">🎉 Congratulations! 🎉</h2>
      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
      <p>We are thrilled to inform you that your article titled <strong>"${articleTitle}"</strong> has been approved and published on our site!</p>
      <p>You can view your article by clicking the link below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${articleLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">View Your Article</a>
      </div>
      <p>Thank you for sharing your story with us. We are excited to have you as part of the Beyond Science Magazine community!</p>
      <p>
        If you wish to request removal or want to edit your article (<strong>${$id}</strong>), please send a mail 
        <a href="mailto:admin@beyondsciencemagazine.studio" style="color: #4CAF50;">here</a>.
      </p>
      <br>
      <p>Best regards,</p>
      <p style="font-weight: bold;">The Beyond Science Magazine Team</p>
    </div>
    <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #777;">
      <p>© 2025 Beyond Science Magazine. All rights reserved.</p>
      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:admin@beyondsciencemagazine.studio" style="color: #4CAF50;">admin@beyondsciencemagazine.studio</a>.
      </p>
    </footer>
  </div>
`;

        // Setup nodemailer transporter with SMTP details from environment
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST, // "smtp.mailgun.org"
            port: parseInt(SMTP_PORT), // e.g. 587
            auth: {
                user: SMTP_USER, // "no-reply@beyondsciencemagazine.studio"
                pass: SMTP_PASS, // "mypasswaord"
            },
        });

        log("Waiting 1 minute before sending email...");
        await new Promise(resolve => setTimeout(resolve, 60000));

        log("Sending email from:", FROM_EMAIL);

        // Send email
        await transporter.sendMail({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: subject,
            html: html,
        });

        log("Email sent successfully to:", email);
        return res.send("Email sent successfully.");
    } catch (error) {
        log("Error sending email:", error.message);
        return res.send("Error: " + error.message);
    } finally {
        log("Event processing completed.");
    }
};