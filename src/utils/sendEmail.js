const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const getEmailTemplate = (title, body, ctaText, ctaUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #0891b2 0%, #2563eb 100%);">
              <img src="https://res.cloudinary.com/dejxspajc/image/upload/v1738705409/logo_ckfoh4.jpg" alt="SparkUp" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              ${body}
              ${ctaText ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} SparkUp. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #475569;">
                You received this because you have an account on SparkUp.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Send a friend request notification email
 */
const sendFriendRequestEmail = async (recipientEmail, senderName) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.sender = { email: "contact@sparkup.space", name: "SparkUp" };
  sendSmtpEmail.subject = `${senderName} wants to connect with you! 🤝`;
  sendSmtpEmail.htmlContent = getEmailTemplate(
    "New Connection Request!",
    `
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">Hey there 👋</p>
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      <strong style="color: #ffffff;">${senderName}</strong> is interested in connecting with you on SparkUp.
    </p>
    <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Head over to your requests page to accept or decline this connection.
    </p>
    `,
    "View Request →",
    "https://sparkup.space/requests"
  );

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Friend request email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

/**
 * Send a match notification email (when both users like each other)
 */
const sendMatchEmail = async (recipientEmail, matchName) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.sender = { email: "contact@sparkup.space", name: "SparkUp" };
  sendSmtpEmail.subject = `It's a match! You and ${matchName} connected 🎉`;
  sendSmtpEmail.htmlContent = getEmailTemplate(
    "It's a Match! 🎉",
    `
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">Great news!</p>
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      You and <strong style="color: #ffffff;">${matchName}</strong> have connected on SparkUp. You can now start chatting!
    </p>
    <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Don't keep them waiting — say hello and start a conversation.
    </p>
    `,
    "Start Chatting →",
    "https://sparkup.space/connections"
  );

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Match email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending match email:", error.message);
  }
};

/**
 * Send welcome email on signup
 */
const sendWelcomeEmail = async (recipientEmail, firstName) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.sender = { email: "contact@sparkup.space", name: "SparkUp" };
  sendSmtpEmail.subject = `Welcome to SparkUp, ${firstName}! 🚀`;
  sendSmtpEmail.htmlContent = getEmailTemplate(
    `Welcome, ${firstName}!`,
    `
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Thanks for joining SparkUp! We're glad you're here.
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Here's what you can do to get started:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Complete your profile with a photo and bio</td></tr>
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Browse the feed and connect with people</td></tr>
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Start chatting with your connections</td></tr>
    </table>
    `,
    "Complete Your Profile →",
    "https://sparkup.space/profile"
  );

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Welcome email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

/**
 * Send premium thank you email
 */
const sendPremiumEmail = async (recipientEmail, firstName, membershipType) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  const isGold = membershipType === "gold";

  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.sender = { email: "contact@sparkup.space", name: "SparkUp" };
  sendSmtpEmail.subject = `Welcome to ${isGold ? "Gold" : "Silver"} Premium, ${firstName}! ${isGold ? "👑" : "⭐"}`;
  sendSmtpEmail.htmlContent = getEmailTemplate(
    `Thank You, ${firstName}! ${isGold ? "👑" : "⭐"}`,
    `
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Your <strong style="color: #ffffff;">${isGold ? "Gold" : "Silver"} Premium</strong> membership is now active!
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Thank you for supporting SparkUp. Here's what you now have access to:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ ${isGold ? "Unlimited" : "100"} connection requests per day</td></tr>
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Verified badge on your profile</td></tr>
      <tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Valid for ${isGold ? "6" : "3"} months</td></tr>
      ${isGold ? '<tr><td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">✓ Priority support</td></tr>' : ""}
    </table>
    <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Enjoy your premium experience and make the most of your connections!
    </p>
    `,
    "Start Exploring →",
    "https://sparkup.space"
  );

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Premium email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending premium email:", error.message);
  }
};

module.exports = { sendFriendRequestEmail, sendMatchEmail, sendWelcomeEmail, sendPremiumEmail };
