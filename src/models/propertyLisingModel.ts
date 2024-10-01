import mongoose, { Document } from "mongoose";

export interface IPropertyListing extends Document {
  title: string;
  propertyType: "sale" | "rental";
  publicationStatus: "published" | "unpublished";
  propertyStatus: "rented" | "sold" | "available" ;
  description: string;
  price: number;
  availabilityDate: Date;
  photos?: string[]; // Array of URL strings for the photos
  commentsCount: number;
  agent: mongoose.Schema.Types.ObjectId; // Référence à l'agent
}

const propertyListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  propertyType: { type: String, enum: ["sale", "rental"], required: true },
  publicationStatus: {
    type: String,
    enum: ["published", "unpublished"],
    required: true,
  },
  propertyStatus: {
    type: String,
    enum: ["available", "rented", "sold"],
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
