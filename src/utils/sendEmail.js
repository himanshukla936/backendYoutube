import nodemailer from "nodemailer";
import ApiError from "./apiError.js";

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new ApiError(500, "Failed to send email");
    }
};

export default sendEmail;