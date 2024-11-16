import { User } from "../models/userModel";
import { PropertyListing } from "../models/propertyLisingModel";
import { Comment } from "../models/commentModel";

export const resolvers = {
  // Queries
  getUsers: async () => {
    return await User.find();
  },
  getUser: async ({ id }: { id: string }) => {
    return await User.findById(id);
  },
  getProperties: async () => {
    return await PropertyListing.find().populate("agent"); // Populate uniquement l'agent
  },
  getProperty: async ({ id }: { id: string }) => {
    return await PropertyListing.findById(id).populate("agent"); // Populate uniquement l'agent
  },
  getComments: async ({ propertyId }: { propertyId: string }) => {
    return await Comment.find({ property: propertyId }).populate("author property"); // Populate author et property
  },

  // Mutations
  createUser: async ({
    username,
    email,
    password,
    role,
  }: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const user = new User({ username, email, password, role });
    return await user.save();
  },
  createProperty: async ({
    title,
    description,
    price,
    availabilityDate,
    propertyStatus,
    publicationStatus,
    propertyType,
    agentId,
  }: {
    title: string;
    description: string;
    price: number;
    availabilityDate: string;
    propertyStatus: string;
    publicationStatus: string;
    propertyType: string;
    agentId: string;
  }) => {
    try {
      // Vérifiez si l'agent existe
      const agent = await User.findById(agentId);
      if (!agent) {
        throw new Error("Invalid agentId: User does not exist.");
      }
  
      // Créez la propriété
      const property = new PropertyListing({
        title,
        description,
        price,
        availabilityDate,
        propertyStatus,
        publicationStatus,
        propertyType,
        agent: agentId,
      });
  
      // Sauvegardez la propriété
      const savedProperty = await property.save();
  
      // Recherchez la propriété et peuplez l'agent
      return await PropertyListing.findById(savedProperty._id).populate("agent");
    } catch (error) {
      console.error("Error in createProperty:", error);
      throw new Error("Failed to create property.");
    }
  },
  
  addComment: async ({
    propertyId,
    text,
    authorId,
  }: {
    propertyId: string;
    text: string;
    authorId: string;
  }) => {
    try {
      // Vérifier si la propriété et l'auteur existent
      const property = await PropertyListing.findById(propertyId);
      const author = await User.findById(authorId);

      if (!property) {
        throw new Error("Invalid propertyId: Property does not exist.");
      }
      if (!author) {
        throw new Error("Invalid authorId: User does not exist.");
      }

      // Créer le commentaire
      const comment = new Comment({
        text,
        property: propertyId, // Référence à la propriété
        author: authorId, // Référence à l'utilisateur
      });

      // Enregistrer le commentaire dans la base de données
      const savedComment = await comment.save();

      // Peupler les relations pour retourner les données complètes
      return await Comment.findById(savedComment._id).populate("author property");
    } catch (error) {
      console.error("Error in addComment:", error);
      throw new Error("Failed to add comment.");
    }
  },
};
