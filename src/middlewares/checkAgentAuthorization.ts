import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/userModel";
import { MulterRequest } from "../types/multerRequest";

export const checkAgentAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customReq = req as unknown as MulterRequest;
  const agentId = req.query.agentId as string;

  // Cast explicite de req.user en IUser
  const user = req.user as IUser | undefined;

  // Vérifier que l'utilisateur est authentifié
  if (!user) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  // Vérification que l'utilisateur authentifié correspond à l'agentId
  if (String(user._id) !== agentId) {
    return res.status(403).json({ message: "L'utilisateur n'est pas autorisé à uploader cette image." });
  }

  next();  // Passe au middleware suivant si tout est bon
};
