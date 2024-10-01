import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/userModel";
import { PropertyListing } from "../models/propertyLisingModel";
import { MulterRequest } from "../types/multerRequest";

// Service pour l'enregistrement d'un utilisateur
export const registerUser = async (req: Request, res: Response) => {
  const { username, password, email, role, agencyName } = req.body;
  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "L'email existe déjà." });
    }

    const user = new User({ username, password, email, role, agencyName });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    return res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Service pour la connexion d'un utilisateur
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Service pour déconnexion
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Déconnexion réussie." });
};

// Services pour les propriétés
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, propertyType, publicationStatus, propertyStatus, description, price, availabilityDate } = req.body;
    const user = req.user as IUser;

    const newProperty = new PropertyListing({
      title, propertyType, publicationStatus, propertyStatus, description, price, availabilityDate, agent: user._id
    });

    await newProperty.save();
    return res.status(201).json({ message: 'Propriété créée avec succès.', property: newProperty });
  } catch (error) {
    console.error('Erreur lors de la création de la propriété:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

export const uploadPropertyImage = async (req: Request, res: Response) => {
    try {
      const propertyId = req.params.propertyId;
  
      const property = await PropertyListing.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Annonce non trouvée.' });
      }
      const multerReq = req as unknown as MulterRequest; // Cast req to MulterRequest
      const imageUrl:string = multerReq.file.location;
  
      // Vérifiez si 'photos' est undefined et l'initialiser si nécessaire
      if (!property.photos) {
        property.photos = [];
      }
  
      // Ajouter l'URL de l'image à la liste des photos de l'annonce
      property.photos.push(imageUrl);
      
      // Sauvegarder la propriété mise à jour
      await property.save();
  
      return res.status(200).json({ message: 'Image ajoutée avec succès.', property });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  };
  

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await PropertyListing.find({ publicationStatus: 'Publié' });
    if (!properties.length) {
      return res.status(404).json({ message: 'Aucune propriété trouvée.' });
    }
    return res.status(200).json(properties);
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

export const getAgentProperties = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const properties = await PropertyListing.find({ agent: user._id });

    if (!properties.length) {
      return res.status(404).json({ message: 'Aucune propriété trouvée pour cet agent.' });
    }

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.propertyId;
    const updates = req.body;
    const user = req.user as IUser;

    const property = await PropertyListing.findOne({ _id: propertyId, agent: user._id });
    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée." });
    }

    if (updates.agent) {
      return res.status(400).json({ message: "La modification de l'agent n'est pas autorisée." });
    }

    const updatedProperty = await PropertyListing.findByIdAndUpdate(propertyId, { $set: updates }, { new: true });
    return res.status(200).json({ message: "Propriété mise à jour avec succès.", property: updatedProperty });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la propriété:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.propertyId;
    const user = req.user as IUser;

    const property = await PropertyListing.findOne({ _id: propertyId, agent: user._id });
    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée." });
    }

    await PropertyListing.findByIdAndDelete(propertyId);
    return res.status(200).json({ message: "Propriété supprimée avec succès." });
  } catch (error) {
    console.error('Erreur lors de la suppression de la propriété:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};
