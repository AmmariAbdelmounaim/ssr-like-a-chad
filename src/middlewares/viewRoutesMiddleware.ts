import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/userModel"; // Assure-toi que le modèle IUser contient les rôles

// Middleware pour rediriger les utilisateurs vers une page basée sur leur rôle
export const redirectBasedOnRole = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser; // Récupérer l'utilisateur connecté

  if (!user) {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    return res.redirect('/login');
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à la page de login, redirection vers une page en fonction de son rôle
  if (req.path === '/login') {
    if (user.role === 'agent') {
      return res.redirect('/protected/agent/dashboard');
    } else if (user.role === 'user') {
      return res.redirect('/protected/user/annonce');
    }
    // Ajouter d'autres redirections si nécessaire
  }

  next(); // Si aucune redirection n'est nécessaire, continuer avec la requête
};
