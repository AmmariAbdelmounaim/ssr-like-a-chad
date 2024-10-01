import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/userModel";
import { PropertyListing } from "../models/propertyLisingModel";
import { MulterRequest } from "../types/multerRequest";
import { Comment } from '../models/commentModel';
import mongoose from "mongoose";
import  { deleteImageFromS3 } from "../config/s3";

// -------------------- AUTHENTICATION SERVICES --------------------

// Enregistrement d'un utilisateur
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

// Connexion d'un utilisateur
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

// Déconnexion
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Déconnexion réussie." });
};

// -------------------- PROPERTY SERVICES --------------------

// Création d'une propriété
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

// Récupérer les propriétés d'un agent
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

// Mise à jour d'une propriété
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

// Suppression d'une propriété

export const deletePropertyWithImages = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.propertyId;
    const user = req.user as IUser;

    // Trouver la propriété à supprimer
    const property = await PropertyListing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Si la propriété a des images associées
    if (property.photos && property.photos.length > 0) {
      for (const imageUrl of property.photos) {
        const photoKey = imageUrl.split('/').pop(); // Extraire la clé de l'image depuis l'URL

        // Vérifier si la clé existe avant d'envoyer la requête S3
        if (!photoKey) {
          console.error(`Erreur: Clé de l'image manquante pour l'image ${imageUrl}`);
          continue; // Passer à l'image suivante si la clé est manquante
        }

        // Utiliser la fonction pour supprimer l'image de S3
        await deleteImageFromS3(process.env.AWS_BUCKET_NAME!, `${user._id}/${propertyId}/${photoKey}`);
      }
    }

    // Une fois les images supprimées, supprimer la propriété
    await PropertyListing.findByIdAndDelete(propertyId);

    return res.status(200).json({ message: 'Propriété et images associées supprimées avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la propriété et des images:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// -------------------- IMAGE UPLOAD SERVICE --------------------

// Upload d'image pour une propriété
export const uploadPropertyImage = async (req: Request, res: Response) => {
  try {
    const customReq = req as unknown as MulterRequest;
    const propertyId = req.params.propertyId;
    const user = req.user as IUser;

    const property = await PropertyListing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Annonce non trouvée.' });
    }

    const imageUrl = customReq.file.location;

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

// -------------------- COMMENT SERVICES --------------------

// Ajouter un commentaire à une annonce
export const addComment = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { text } = req.body;
    const user = req.user as IUser;

    const property = await PropertyListing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    const newComment = new Comment({
      text,
      author: user._id,
      property: property._id,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire', error });
  }
};

// Récupérer les commentaires associés à une annonce
export const getCommentsForProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const property = await PropertyListing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    const comments = await Comment.find({ property: property._id })
      .populate('author', 'username')
      .populate('responses')
      .exec();

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error });
  }
};

// Supprimer un commentaire
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = req.user as IUser;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire.' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Commentaire supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire', error });
  }
};

// Répondre à un commentaire existant
export const replyToComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const user = req.user as IUser;

    const originalComment = await Comment.findById(commentId);
    if (!originalComment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const replyComment = new Comment({
      text,
      author: user._id,
      property: originalComment.property
    });

    await replyComment.save();

    if (!originalComment.responses) {
      originalComment.responses = [];
    }

    originalComment.responses.push(replyComment._id as unknown as mongoose.Schema.Types.ObjectId);
    await originalComment.save();

    res.status(201).json(replyComment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réponse au commentaire', error });
  }
};

// Mettre à jour un commentaire
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const user = req.user as IUser;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    if (comment.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce commentaire.' });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du commentaire', error });
  }
};

// Récupérer un commentaire avec ses réponses
export const getCommentWithReplies = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'username')
      .populate('responses')
      .exec();

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du commentaire', error });
  }
};
