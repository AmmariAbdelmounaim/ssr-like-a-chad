import mongoose, { Document } from "mongoose";

export interface IPropertyListing extends Document {
  title: string;
  propertyType: "vente" | "location";
  publicationStatus: "publié" | "non publié";
  propertyStatus: "loué" | "vendu" | "disponible" ;
  description: string;
  price: number;
  availabilityDate: Date;
  photos?: string[]; 
  commentsCount: number;
  agent: mongoose.Schema.Types.ObjectId; 
}

const propertyListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  propertyType: { type: String, enum: ["vente", "location"], required: true },
  publicationStatus: {
    type: String,
    enum: ["publié", "non publié"],
    required: true,
  },
  propertyStatus: {
    type: String,
    enum: ["loué", "vendu", "disponible"],
    required: true,
  },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availabilityDate: { type: Date, required: true },
  photos: { type: [String] }, // Array of URL strings for the photos
  commentsCount: { type: Number, default: 0 },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Référence à l'agent
});

export const PropertyListing = mongoose.model<IPropertyListing>(
  "PropertyListing",
  propertyListingSchema
);
