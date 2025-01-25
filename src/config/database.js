const mongoose = require("mongoose");
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;
const connectDB = async () => {
  await mongoose.connect(
    connectionString
  );
};

module.exports = connectDB;