import { Request } from "express";
import { File } from "multer";

// Étendre Request pour inclure params et file
interface MulterRequest extends Request {
  params: {
    agentId: string;
    annonceId: string;
  };
  file: {
    location: string;
    originalname: string;
    mimetype: string;
    size: number;
  };
}
