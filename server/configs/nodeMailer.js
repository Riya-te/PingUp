import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create transporter
const transporter = nodemailer.createTransport({

  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",

  port: Number(process.env.SMTP_PORT || 587),

  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

});

// ✅ Verify transporter
transporter.verify((error, success) => {

  if (error) {

    console.log("Nodemailer Error ❌");
    console.log(error);

  } else {

    console.log("Mail Server Connected ✅");

  }

});


// ✅ Send Email Function
export const sendEmail = async (
  to,
  subject,
  html
) => {

  try {

    const info = await transporter.sendMail({

      from: `"PingUp 🚀" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      html,

    });

    console.log("Email Sent ✅");
    console.log(info.messageId);

    return info;

  } catch (error) {

    console.log(error.message);

  }

};

export default transporter;