const { createTransport } = require("nodemailer");
const sesTransport = require("nodemailer-ses-transport");


const sendEmail = async (options) => {
    var sesTransporter = createTransport(
        sesTransport({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
        })
      );
      
      function callback(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent!");
        }
      }

  const message = {
    from: `${process.env.FROM_EMAIL}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await sesTransporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;