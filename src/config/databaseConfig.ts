import mongoose from "mongoose";
export async function connectToMongoDB() {
  const uri = "mongodb://localhost:27017/tp-web-mongo";
  if (!uri) {
    throw new Error("DATABASE_URI is not set");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
