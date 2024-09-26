import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { IUser, User } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateAPIToken } from "../middlewares/authenticateAPIToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import { checkAgentAuthorization } from "../middlewares/checkAgentAuthorization";
import upload from '../config/s3';  // Importer la configuration pour 
import { MulterRequest } from "../types/multerRequest";
import { PropertyListing } from "../models/propertyLisingModel";
import extractUserFromCookie from "../middlewares/extractUserfromCookies";


const apiRouter = Router();

// POST route for registration
apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { username, password, email, role, agencyName } = req.body;
  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Create a new user
    const user = new User({
      username,
      password,
      email,
      role,
      agencyName,
    });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    user.token = token;
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST route for Login
apiRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Utilisateur non trouvé" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Cet email et mot de passe ne correspondent pas" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();

  res.cookie("token", token, { httpOnly: true });

  return res.status(200).json({ role: user.role });
});

// For logout
apiRouter.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

apiRouter.get("/protected", authenticateAPIToken, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

apiRouter.get(
  "/agent",
  authenticateAPIToken,
  authorizeRole(['agent']),
  (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
  }
);

apiRouter.get(
  "/user",
  authenticateAPIToken,
  authorizeRole(['user']),
  (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
  }
);

// Route POST pour uploader une image avec agentId et annonceId dans l'URL
apiRouter.post(
  '/upload',
  authenticateAPIToken,  // Authentifie l'utilisateur
  authorizeRole(['agent']),
  checkAgentAuthorization, // Vérifie si l'utilisateur est autorisé à uploader pour l'agentId
  upload.single('image'),  // Gérer l'upload de fichier
  (req: Request, res: Response) => {
    try {
      const customReq = req as unknown as MulterRequest;
      const agentId = req.query.agentId as string;
      const annonceId = req.query.annonceId as string;

      if (!customReq.file || !agentId || !annonceId) {
        return res.status(400).json({ message: 'Image, agentId ou annonceId manquant' });
      }

      const fileLocation = customReq.file.location;
      const imagePath = `${agentId}/${annonceId}/${customReq.file.originalname}`;
      const imageUrl = `https://tpwebbucket.s3.${process.env.AWS_REGION}.amazonaws.com/${imagePath}`;

      return res.status(201).json({
        message: 'Image téléchargée avec succès!',
        imageUrl: imageUrl,
        path: imagePath
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
);


apiRouter.post(
  '/property',
  
  async (req: Request, res: Response) => {
    try {
      const { title, propertyType, publicationStatus, propertyStatus, description, price, availabilityDate } = req.body;

      if (!title || !propertyType || !publicationStatus || !propertyStatus || !description || !price || !availabilityDate) {
        return res.status(400).json({ message: 'Tous les champs de la propriété sont requis' });
      }

      // Créer la propriété sans l'image
      const newProperty = new PropertyListing({
        title,
        propertyType,
        publicationStatus,
        propertyStatus,
        description,
        price,
        availabilityDate,
        photos: [], // Pas d'image pour le moment
      });

      await newProperty.save();

      return res.status(201).json({
        message: 'Propriété créée avec succès sans image!',
        property: newProperty,
      });
    } catch (error) {
      console.error('Erreur lors de la création de la propriété:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
);


apiRouter.post(
  '/property/:propertyId/uploadImage',  // propertyId comme paramètre d'URL
  extractUserFromCookie,
  upload.single('image'),  // Gérer l'upload de fichier
  async (req: Request, res: Response) => {
    try {
      const customReq = req as unknown as MulterRequest;
      const propertyId = req.params.propertyId;  // Récupérer l'ID de la propriété depuis params

      // Vérifiez que req.user est défini avant de récupérer agentId
      const user = req.user as IUser;
      if (!user || !user._id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      const agentId = user._id;  // Récupérer l'ID de l'utilisateur connecté depuis le middleware

      if (!customReq.file) {
        return res.status(400).json({ message: 'Image manquante' });
      }

      // Trouver l'annonce (property) à mettre à jour
      const property = await PropertyListing.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Annonce non trouvée' });
      }

      // URL de l'image uploadée
      const imageUrl = customReq.file.location;

      // Initialiser le tableau des photos si nécessaire
      if (!property.photos) {
        property.photos = []; // Initialiser le tableau s'il est undefined
      }

      // Ajouter l'URL de l'image à la liste des photos de l'annonce
      property.photos.push(imageUrl);

      // Sauvegarder l'annonce mise à jour avec l'image
      await property.save();

      return res.status(200).json({
        message: 'Image ajoutée avec succès à l\'annonce!',
        property,  // Retourner l'annonce mise à jour avec les photos
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image à l\'annonce:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
);










export default apiRouter;
