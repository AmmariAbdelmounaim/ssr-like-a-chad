import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User, { IUser } from '../models/User'; // Import du modèle utilisateur
import bcrypt from 'bcryptjs'; // Utilisé pour comparer les mots de passe hashés

// Configuration de Passport avec la stratégie locale
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Chercher l'utilisateur dans la base de données
      const user: IUser | null = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Utilisateur inconnu.' });
      }

      // Comparer le mot de passe fourni avec le mot de passe stocké (hashé)
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Mot de passe incorrect.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Sérialisation et désérialisation de l'utilisateur pour la session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user: IUser | null = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
