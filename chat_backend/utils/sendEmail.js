const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NodeTalk Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "NodeTalk - Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
          <h2>Welcome to NodeTalk!</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4CAF50;">${otp}</h1>
          <p>This OTP is valid for 10 minutes only.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;