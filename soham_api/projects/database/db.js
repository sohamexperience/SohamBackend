// db.js
const mongoose = require("mongoose");

let isConnected = false; // Track database connection status

async function connectToDatabase() {
  if (isConnected) {
    console.log("Reusing existing MongoDB connection");
    return;
  }

  console.log("Connecting to MongoDB:", process.env.MONGO_URI.replace(/:[^@]*/g, ":******"));

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "sohamDB",
      appName: "Soham-Dev",
    });
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw new Error("Failed to connect to database");
  }
}

module.exports = connectToDatabase;
