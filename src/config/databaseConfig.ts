import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Charger les variables d'environnement

export async function connectToMongoDB() {
  const uri = process.env.DATABASE_URI;

  if (!uri) {
    throw new Error("DATABASE_URI is not set in the environment variables");
  }

  try {
    // Connexion à MongoDB via Mongoose
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 60000,  // Timeout augmenté à 60 secondes
      socketTimeoutMS: 120000,          // Timeout des opérations augmenté à 120 secondes
      connectTimeoutMS: 30000,          // Timeout de connexion augmenté à 30 secondes
    });

    console.log("Successfully connected to MongoDB with Mongoose");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
