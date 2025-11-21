import { sendEmail as sendEmailLib } from "@/lib/nodemailer";

/**
 * Send an email (backward compatibility wrapper)
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email content (HTML)
 * @param {Object} attachment - Email attachment (optional)
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (email, subject, message, attachment = null) => {
  return await sendEmailLib({
    to: email,
    subject,
    html: message,
    text: message,
    attachment,
  });
};

export default sendEmail;
