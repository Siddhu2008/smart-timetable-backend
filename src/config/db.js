import mongoose from "mongoose";

// src/config/db.js
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connect failed:", err.message);
    throw err;
  }
};

export default connectDB;
