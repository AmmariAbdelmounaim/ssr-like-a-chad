import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User, IUser } from '../models/User';
import bcrypt from 'bcryptjs';

// Configuration de Passport avec la stratégie locale pour utiliser l'email
passport.use(new LocalStrategy(
  { usernameField: 'email' },  // Utilisation de l'email au lieu du username
  async (email, password, done) => {
    try {
      console.log(`Tentative de connexion avec l'email : ${email}`);

      const user: IUser | null = await User.findOne({ email });

      if (!user) {
        console.log('Utilisateur non trouvé avec cet email.');
        return done(null, false, { message: 'Email inconnu.' });
      }

      console.log('Utilisateur trouvé, vérification du mot de passe...');

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Mot de passe incorrect.');
        return done(null, false, { message: 'Mot de passe incorrect.' });
      }

      console.log('Mot de passe correct, authentification réussie.');
      return done(null, user);
    } catch (error) {
      console.error('Erreur lors de l\'authentification :', error);
      return done(error);
    }
  }
));

// Sérialisation et désérialisation
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

// Utilise un export nommé
export { passport };
