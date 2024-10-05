import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRole";
import { upload } from "../config/s3"; // Configuration pour l'upload d'images vers S3
import {
  loginUser,
  registerUser,
  logoutUser,
  createProperty,
  getAllProperties,
  getAgentProperties,
  updateProperty,
  deletePropertyWithImages,
  uploadPropertyImage,
  addComment,
  getCommentsForProperty,
  deleteComment,
  replyToComment,
  updateComment,
  getCommentWithReplies,
  deletePropertyImage,
  getUserCommentsForProperty,
} from "../services/apiServices";
import { cookieAuthentication } from "../middlewares/cookieAuthentication";

const apiRouter = Router();

// Routes d'authentification
apiRouter.post("/auth/register", registerUser);
apiRouter.post("/auth/login", loginUser);
apiRouter.post("/logout", logoutUser);

// Routes pour gérer les propriétés
apiRouter.post(
  "/property",
  cookieAuthentication,
  authorizeRole(["agent"]),
  createProperty
);

apiRouter.post(
  "/property/:propertyId/uploadImage",
  cookieAuthentication,
  authorizeRole(["agent"]),
  upload.single("image"),
  uploadPropertyImage
);

apiRouter.get("/properties", getAllProperties);

apiRouter.get(
  "/agent/properties",
  cookieAuthentication,
  authorizeRole(["agent"]),
  getAgentProperties
);

apiRouter.put(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  updateProperty
);


// Upload d'une image pour une propriété (accessible aux agents)
apiRouter.post(
  "/property/:propertyId/uploadImage",
  cookieAuthentication,
  authorizeRole(["agent"]),
  upload.single("image"),
  uploadPropertyImage
);

// Récupérer toutes les propriétés publiées (accessible à tout le monde)
apiRouter.get("/properties", getAllProperties);

// Récupérer les propriétés d'un agent (accessible uniquement aux agents)
apiRouter.get(
  "/agent/properties",
  cookieAuthentication,
  authorizeRole(["agent"]),
  getAgentProperties
);

// Mettre à jour une propriété (uniquement accessible aux agents)
apiRouter.put(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  updateProperty
);

// Supprimer une propriété (uniquement accessible aux agents)
apiRouter.delete(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  deletePropertyWithImages
);

// Supprimer une image (uniquement accessible aux agents)
apiRouter.delete(
  `/property/:propertyId/image/:imageUrl`,
  cookieAuthentication,
  authorizeRole(["agent"]),
  deletePropertyImage
)
// -------------------- COMMENT ROUTES --------------------

// Ajouter un commentaire à une propriété (nécessite une authentification)
apiRouter.post("/:propertyId/comment", cookieAuthentication,authorizeRole(["user"]), addComment);




// Récupérer tous les commentaires associés à une propriété (accessible à tout le monde)
apiRouter.get("/:propertyId/comments", getCommentsForProperty);

// Get only user comments
apiRouter.get("/:propertyId/user-comments", getUserCommentsForProperty);

// Supprimer un commentaire (nécessite une authentification)
apiRouter.delete("/comment/:commentId", cookieAuthentication, deleteComment);

// Répondre à un commentaire existant (nécessite un agent)
apiRouter.post(
  "/comment/:commentId/reply",
  cookieAuthentication,
  authorizeRole(["agent"]),
  replyToComment
);

// Mettre à jour un commentaire (nécessite une authentification)
apiRouter.put("/comment/:commentId", cookieAuthentication, updateComment);

// Récupérer un commentaire avec ses réponses (accessible à tout le monde)
apiRouter.get("/comment/:commentId", getCommentWithReplies);

export default apiRouter;
