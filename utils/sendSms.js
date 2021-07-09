dotenv.config({ path: ".env" });

const accountSid = process.env.TWIllIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;

exports.sendSms = (phone, message) => {
  const client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
       body: message,
       from: process.env.TWILLIO_PHONE_NUMBER,
       to: phone
     })
    .then(message => console.log(message.sid)).
    catch(err => console.log(err.message));
}