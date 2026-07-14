const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, productName) => {
  try {
    console.log("RESEND KEY:", process.env.RESEND_API_KEY ? "Loaded" : "Missing");

    const data = await resend.emails.send({
      from: "BRIXO <onboarding@resend.dev>",
      to: [to],
      subject: "BRIXO Order Confirmation",
      text: `Your order for ${productName} has been received successfully. Thank you for shopping with BRIXO!`,
    });

    console.log("EMAIL SENT:", data);

  } catch (error) {
    console.log("EMAIL ERROR:", error.message);
    throw error;
  }
};

module.exports = sendEmail;