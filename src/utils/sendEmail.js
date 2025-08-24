import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // email gmail kamu
        pass: process.env.EMAIL_PASS, // app password (bukan password asli Gmail!)
      },
    });

    await transporter.sendMail({
      from: `"BookCollab App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Gagal mengirim email");
  }
};
