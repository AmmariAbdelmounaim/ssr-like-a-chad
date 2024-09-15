import mongoose, { Schema, Document } from 'mongoose';

// Interface pour définir la structure de l'utilisateur
export interface IUser extends Document {
  username: string;
  password: string;
}

// Définition du schéma utilisateur
const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Modèle utilisateur
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
