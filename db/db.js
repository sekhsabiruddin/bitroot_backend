const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MongoDB URI is not provided in the environment variables"
      );
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

module.exports = dbConnect;
