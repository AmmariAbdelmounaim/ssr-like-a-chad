import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const extractUserFromCookie = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;  // Récupérer le token JWT depuis le cookie

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    // Vérifier et décoder le token JWT
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string };

    // Attacher l'ID utilisateur et le rôle à la requête
    req.user = { _id: decodedToken.id, role: decodedToken.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export default extractUserFromCookie;
