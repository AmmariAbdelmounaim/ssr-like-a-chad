import { MongoClient,ServerApiVersion  } from "mongodb";

export async function connectToMongoDB() {
  const uri = process.env.DATABASE_URI;

  if(!uri) {
    throw new Error("DATABASE_URI is not set");
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
