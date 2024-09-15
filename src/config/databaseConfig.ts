import { MongoClient, ServerApiVersion } from "mongodb";

// Fonction pour se connecter à MongoDB
export async function connectToMongoDB() {
  // Récupérer l'URI de la base de données à partir des variables d'environnement
  const uri = process.env.DATABASE_URI;

  // Si l'URI n'est pas défini, lever une erreur
  if (!uri) {
    throw new Error("DATABASE_URI is not set in the environment variables");
  }

  // Créer un client MongoDB avec les options nécessaires
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Tenter de se connecter à MongoDB
    await client.connect();
    console.log("Successfully connected to MongoDB");

    // Optionnel : Vérifier que la connexion est active en faisant une requête
    const db = client.db(); // Utilise la base de données par défaut (déclarée dans l'URI)
    const collections = await db.listCollections().toArray(); // Liste des collections
    console.log("Collections in the database:", collections.map(col => col.name));

    return client; // Optionnel : retourne le client si tu en as besoin dans ton application
  }catch (err: any) {
  console.error("Error connecting to MongoDB:", err.message || err);
}

}
