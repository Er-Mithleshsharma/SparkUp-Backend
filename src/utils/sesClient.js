const dotenv = require("dotenv");
dotenv.config();  // This loads environment variables

const { SESClient } = require("@aws-sdk/client-ses");
const REGION = "eu-north-1";

// Now try to log the values
console.log("AWS Access Key:", process.env.AWS_ACCESS_KEY);
console.log("AWS Secret Key:", process.env.AWS_SECRET_KEY);

const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = { sesClient };
 