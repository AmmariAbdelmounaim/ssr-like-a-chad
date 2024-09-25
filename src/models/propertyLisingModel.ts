import mongoose, { Document } from "mongoose";

export interface IPropertyListing extends Document {
  title: string;
  propertyType: "Vente" | "Location";
  publicationStatus: "Publié" | "Non Publié";
  propertyStatus: "Disponible" | "Loué" | "Vendu";
  description: string;
  price: number;
  availabilityDate: Date;
  photos?: string[]; // Array of URL strings for the photos
  commentsCount: number;
}

const propertyListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  propertyType: { type: String, enum: ["Vente", "Location"], required: true },
  publicationStatus: {
    type: String,
    enum: ["Publié", "Non Publié"],
    required: true,
  },
  propertyStatus: {
    type: String,
    enum: ["Disponible", "Loué", "Vendu"],
    required: true,
  },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availabilityDate: { type: Date, required: true },
  photos: { type: [String] }, // Array of URL strings for the photos
  commentsCount: { type: Number, default: 0 },
});

export const PropertyListing = mongoose.model<IPropertyListing>(
  "PropertyListing",
  propertyListingSchema
);
