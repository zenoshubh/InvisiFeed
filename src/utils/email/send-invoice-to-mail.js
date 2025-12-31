import sendEmail from "./nodemailer-utility";

const sendInvoiceToMail = async (
  customerEmail,
  invoiceNumber,
  pdfUrl,
  companyName,
  feedbackUrl
) => {
  const subject = `Invoice from ${companyName} - ${invoiceNumber}`;

  // HTML email template with styling
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0A0A0A; font-size: 24px; margin-bottom: 10px;">Invoice from ${companyName}</h1>
      </div>
      
      <div style="background-color: #0A0A0A; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #F3F4F6; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear Customer,
        </p>
        <p style="color: #F3F4F6; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for your business. Please find your invoice attached to this email.
        </p>
        <div style="background-color: #1D1D1D; padding: 15px; border-radius: 4px; border: 1px solid #4B5563; margin-bottom: 20px;">
          <p style="color: #F3F4F6; font-size: 16px; margin: 0;">
            <strong>Invoice Number:</strong> ${invoiceNumber}
          </p>
        </div>

        <div style="background-color: #FACC15; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0;">
            <strong>🎁 Special Offer!</strong><br>
            Submit your feedback for this invoice and get a chance to win an exclusive discount coupon for your next purchase. Your valuable feedback helps us serve you better!
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${feedbackUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #FACC15; color: #000000; text-decoration: none; border-radius: 4px; font-weight: bold; transition: background-color 0.3s;">
            Give Feedback
          </a>
        </div>
      </div>
      
      <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 30px;">
        <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong style="color: #0A0A0A">${companyName}</strong>
        </p>
      </div>
    </div>
  `;

  // Plain text version for email clients that don't support HTML
  const textMessage = `
    Dear Customer,

    Thank you for your business. Please find your invoice attached to this email.

    Invoice Number: ${invoiceNumber}

    🎁 Special Offer!
    Submit your feedback for this service and get a chance to win an exclusive discount coupon for your next service. Your valuable feedback helps us serve you better!

    You can also give feedback at: ${feedbackUrl}

    Best regards,

    ${companyName}
  `;

  try {
    // Fetch the PDF file
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Create attachment object
    const attachment = {
      filename: `Invoice_${invoiceNumber}.pdf`,
      content: Buffer.from(pdfBuffer),
    };

    await sendEmail(customerEmail, subject, htmlMessage, attachment);
    return { success: true };
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return { success: false, error: error.message };
  }
};

export default sendInvoiceToMail;

