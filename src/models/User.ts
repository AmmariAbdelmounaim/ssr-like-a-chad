import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface de l'utilisateur, étendant Document pour Mongoose
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schéma de l'utilisateur
const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Avant de sauvegarder l'utilisateur, hacher le mot de passe
UserSchema.pre<IUser>('save', async function (next: (err?: CallbackError) => void) {
  if (!this.isModified('password')) {
    return next();  // Si le mot de passe n'a pas changé, passer à l'étape suivante
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();  // Si tout va bien, continuer sans erreur
  } catch (err) {
    next(err as CallbackError);  // Si une erreur survient, la passer à Mongoose
  }
});

// Comparer les mots de passe pour l'authentification
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exporter le modèle User
export const User = mongoose.model<IUser>('User', UserSchema);
