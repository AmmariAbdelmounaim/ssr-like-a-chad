import { Router } from "express";
import { authenticateAPIToken } from "../middlewares/authenticateAPIToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import extractUserFromCookie from "../middlewares/extractUserfromCookies"; // Extraction de l'utilisateur à partir du cookie
import upload from '../config/s3'; // Configuration pour l'upload d'images vers S3
import * as apiServices from '../services/apiServices'; // Import des services

const apiRouter = Router();

// -------------------- AUTHENTICATION ROUTES --------------------

// Enregistrer un utilisateur
apiRouter.post("/auth/register", apiServices.registerUser);

// Connexion d'un utilisateur
apiRouter.post("/auth/login", apiServices.loginUser);

// Déconnexion d'un utilisateur
apiRouter.get("/logout", apiServices.logoutUser);

// -------------------- PROPERTY ROUTES --------------------

// Création d'une propriété (uniquement accessible aux agents)
apiRouter.post('/property', extractUserFromCookie, authorizeRole(['agent']), apiServices.createProperty);

// Upload d'une image pour une propriété (accessible aux agents)
apiRouter.post('/property/:propertyId/uploadImage', upload.single('image'), apiServices.uploadPropertyImage);

// Récupérer toutes les propriétés publiées (accessible à tout le monde)
apiRouter.get('/properties', apiServices.getAllProperties);

// Récupérer les propriétés d'un agent (accessible uniquement aux agents)
apiRouter.get('/agent/properties', authenticateAPIToken, authorizeRole(['agent']), extractUserFromCookie, apiServices.getAgentProperties);

// Mettre à jour une propriété (uniquement accessible aux agents)
apiRouter.put('/property/:propertyId', extractUserFromCookie, authenticateAPIToken, authorizeRole(['agent']), apiServices.updateProperty);

// Supprimer une propriété (uniquement accessible aux agents)
apiRouter.delete('/property/:propertyId', extractUserFromCookie, authenticateAPIToken, authorizeRole(['agent']), apiServices.deleteProperty);

// -------------------- COMMENT ROUTES --------------------

// Ajouter un commentaire à une propriété (nécessite une authentification)
apiRouter.post('/:propertyId/comments', authenticateAPIToken, apiServices.addComment);

// Récupérer tous les commentaires associés à une propriété (accessible à tout le monde)
apiRouter.get('/:propertyId/comments', apiServices.getCommentsForProperty);

// Supprimer un commentaire (nécessite une authentification)
apiRouter.delete('/comment/:commentId', authenticateAPIToken, apiServices.deleteComment);

// Répondre à un commentaire existant (nécessite une authentification)
apiRouter.post('/comment/:commentId/reply', authenticateAPIToken, apiServices.replyToComment);

// Mettre à jour un commentaire (nécessite une authentification)
apiRouter.put('/comment/:commentId', authenticateAPIToken, apiServices.updateComment);

// Récupérer un commentaire avec ses réponses (accessible à tout le monde)
apiRouter.get('/comment/:commentId', apiServices.getCommentWithReplies);

export default apiRouter;
