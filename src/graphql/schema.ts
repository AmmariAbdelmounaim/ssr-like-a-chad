import { buildSchema } from "graphql";

export const schema = buildSchema(`
    # Type User
    type User {
      id: ID!
      username: String
      email: String
      agencyName: String
      role: Role
      token: String
    }
  
    # Enum pour le rôle d'un utilisateur
    enum Role {
      user
      agent
    }
  
    # Type PropertyListing
    type PropertyListing {
      id: ID!
      title: String
      propertyType: PropertyType
      publicationStatus: PublicationStatus
      propertyStatus: PropertyStatus
      description: String
      price: Float
      availabilityDate: String
      photos: [String]
      agent: User # Référence à l'agent (relation many-to-one)
    }
  
    # Enums pour les types de propriété
    enum PropertyType {
      vente
      location
    }
  
    enum PublicationStatus {
      publie
      non_publie
    }
  
    enum PropertyStatus {
      loue
      vendu
      disponible
    }
  
    # Type Comment
    type Comment {
      id: ID!
      text: String
      author: User # Référence à l'auteur du commentaire (relation many-to-one)
      property: PropertyListing # Référence à la propriété liée (relation many-to-one)
      responses: [Comment] # Réponses liées au commentaire
      createdAt: String
      updatedAt: String
    }
  
    # Query pour récupérer les données
    type Query {
      getUsers: [User]
      getUser(id: ID!): User
      getProperties: [PropertyListing]
      getProperty(id: ID!): PropertyListing
      getComments(propertyId: ID!): [Comment]
    }
  
    # Mutation pour modifier les données
    type Mutation {
      createUser(username: String!, email: String!, password: String!, role: Role!): User
      createProperty(
        title: String!,
        description: String!,
        price: Float!,
        availabilityDate: String!,
        propertyStatus: PropertyStatus!,
        publicationStatus: PublicationStatus!,
        propertyType: PropertyType!,
        agentId: ID!
      ): PropertyListing
      addComment(propertyId: ID!, text: String!, authorId: ID!): Comment
    }
  `);
