import nodemailer from "nodemailer";

// Create and configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @param {string} text - Plain text email content (optional)
 * @param {Object} attachment - Email attachment (optional)
 * @returns {Promise<Object>} Send result
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachment = null,
}) {
  const mailOptions = {
    from: `"InvisiFeed" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text: text || html, // Plain text version
    html, // HTML version
    attachments: attachment ? [attachment] : [],
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Get Nodemailer transporter instance (for advanced usage)
 * @returns {Object} Nodemailer transporter
 */
export function getTransporter() {
  return transporter;
}

export default transporter;

