import emailjs from "emailjs-com";

export const sendEmail = async (toEmail) => {
  try {
    function generateRandomCode() {
      let randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      //   console.log(randomCode);
      return randomCode;
    }
    let generateRandomCodeFunction = generateRandomCode();
    const templateParams = {
      to_email: toEmail,
      subject: "Password Reset",
      message: generateRandomCodeFunction,
    };
    const response = await emailjs.send(
      "", // Replace with your EmailJS Service ID
      "template_rpj6dvu", // Replace with your EmailJS Template ID
      templateParams,
      "" // Replace with your EmailJS Public key
    );
    console.log("Email sent successfully!", response.status, response.text);
    return generateRandomCodeFunction;
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
