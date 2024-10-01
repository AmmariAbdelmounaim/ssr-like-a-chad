import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'; // Importer les commandes nécessaires pour la suppression d'objets S3
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import { MulterRequest } from '../types/multerRequest';
import { IUser } from '../models/userModel';

dotenv.config();

// Créer une instance S3Client (SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Fonction pour supprimer une image de S3
export const deleteImageFromS3 = async (bucket: string, key: string) => {
  try {
    const deleteParams = {
      Bucket: bucket,
      Key: key,
    };
    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log(`Image ${key} supprimée avec succès du bucket ${bucket}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'image ${key}:`, error);
    throw error; // Remonter l'erreur si nécessaire
  }
};

// Configuration d'upload via multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const customReq = req as unknown as MulterRequest;
      
      // Récupérer l'utilisateur connecté via `req.user`
      const user = customReq.user as IUser;
      const agentId = user?._id?.toString();
      const propertyId = customReq.params.propertyId;

      // Ajouter des logs pour voir les valeurs
      console.log('User:', user);
      console.log('agentId:', agentId);
      console.log('propertyId:', propertyId);

      // Vérifie si les paramètres agentId et propertyId sont présents
      if (!agentId || !propertyId) {
        console.error("Erreur: agentId ou propertyId manquant");
        return cb(new Error("agentId ou propertyId manquant"), undefined);
      }

      // Générer le nom du fichier avec un chemin organisé
      const fileName = Date.now().toString() + '-' + file.originalname;
      const filePath = `${agentId}/${propertyId}/${fileName}`;  // Organiser par agentId et propertyId
      console.log('File path:', filePath);
      
      cb(null, filePath);
    }
  })
});

export { s3, upload };
