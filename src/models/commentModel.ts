import mongoose, { Document, Schema } from 'mongoose';

// Interface pour le Commentaire
export interface IComment extends Document {
  _id: mongoose.Types.ObjectId; 
  text: string;
  author: mongoose.Schema.Types.ObjectId; // Référence à l'auteur du commentaire
  property: mongoose.Schema.Types.ObjectId; // Référence à la propriété
  responses?: mongoose.Schema.Types.ObjectId[]; // Réponses à ce commentaire (facultatif)
}

// Définir le schéma du Commentaire
const commentSchema = new Schema<IComment>({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyListing', required: true },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // Réponses liées au commentaire
}, { timestamps: true });

// Exporter le modèle Comment
export const Comment = mongoose.model<IComment>('Comment', commentSchema);
