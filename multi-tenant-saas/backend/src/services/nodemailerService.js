import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            throw new Error("Ethereal SMTP credentials are missing.");
        }

        const result = await transporter.sendMail({
            from: `"Plannr" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email captured by Ethereal:", result.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(result));

        return result;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};