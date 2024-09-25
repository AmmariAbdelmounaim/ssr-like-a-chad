import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import { MulterRequest } from '../types/multerRequest';  // Assurez-vous que MulterRequest est correctement défini

dotenv.config();

// Créer une instance S3Client (SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const customReq = req as unknown as MulterRequest;  // Conversion en unknown puis en MulterRequest
      const agentId = customReq.query.agentId;
      const annonceId = customReq.query.annonceId;

      // Vérifie si les paramètres agentId et annonceId sont présents
      if (!agentId || !annonceId) {
        return cb(new Error("agentId ou annonceId manquant"), undefined);
      }

      // Générer le nom du fichier avec un chemin organisé
      const fileName = Date.now().toString() + '-' + file.originalname;
      const filePath = `${agentId}/${annonceId}/${fileName}`;  // Organiser par agentId et annonceId
      cb(null, filePath);
    }
  })
});

export default upload;
