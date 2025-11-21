import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, message, attachment = null) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.SMTP_EMAIL, // Your email
      pass: process.env.SMTP_PASSWORD, // App password
    },
  });

  const mailOptions = {
    from: `"InvisiFeed" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: subject,
    text: message, // Plain text version
    html: message, // HTML version
    attachments: attachment ? [attachment] : [], // Add attachment if provided
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
