const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; // Ensure your API key is stored in a .env file

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send an email notification for a friend request
 * @param {string} recipientEmail - The email of the recipient
 * @param {string} senderName - The name of the sender
 */
const sendFriendRequestEmail = async (recipientEmail, senderName) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.sender = { email: "contact@sparkup.space", name: "Sparkup Team" };
    sendSmtpEmail.subject = "New Friend Request!";
sendSmtpEmail.htmlContent = `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dejxspajc/image/upload/v1738705409/logo_ckfoh4.jpg" alt="Your App Logo" style="width: 100px; height: auto; margin-bottom: 10px;">
          <h2 style="color: #333333;">You Have a New Friend Request!</h2>
        </div>
        <div style="font-size: 16px; line-height: 1.6; color: #555555;">
          <p style="margin-bottom: 10px;">Hey,</p>
          <p style="margin-bottom: 20px;">You have a new friend request from <strong style="color: #007bff;">${senderName}</strong>.</p>
          <p style="margin-bottom: 20px;">To respond to this request, log in to your account and navigate to the requests section.</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://sparkup.space" style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">View Request</a>
        </div>
        <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #888888;">
          <p>If you didn't request this, please ignore this message.</p>
        </div>
      </div>
    </body>
  </html>
`;


    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Friend request email sent to ${recipientEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Export the function for use in other modules
module.exports = { sendFriendRequestEmail };
