import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const getTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.ethereal.email";
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email SMTP credentials are missing. Set EMAIL_USER and EMAIL_APP_PASSWORD.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error("At least one email recipient is required.");
  }

  if (!subject || (!html && !text)) {
    throw new Error("Email subject and message content are required.");
  }

  try {
    const transporter = getTransporter();
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });

    if (process.env.EMAIL_HOST === "smtp.ethereal.email" || !process.env.EMAIL_HOST) {
      console.log("Email captured by Ethereal:", result.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(result));
    } else {
      console.log("Email sent:", result.messageId);
    }

    return result;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};
