import emailjs from "emailjs-com";

export const sendEmail = async (toEmail) => {
  try {
    const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    let returnStatement = {email:toEmail, code:generateRandomCode()};
    // let generateRandomCodeFunction = generateRandomCode();
    const templateParams = {
      to_email: toEmail,
      subject: "Password Reset",
      message: returnStatement.code,
    };
    const response = await emailjs.send(
      "service_2pavnjk", // Replace with your EmailJS Service ID
      "template_rpj6dvu", // Replace with your EmailJS Template ID
      templateParams,
      "WDfEiUtjNB2Tz-vID" // Replace with your EmailJS Public key
    );
    console.log("Email sent successfully!", response.status, response.text);
    // console.log(returnStatement);
    return returnStatement;
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
