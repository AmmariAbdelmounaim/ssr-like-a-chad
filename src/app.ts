import express, { Request, Response } from 'express';
import path from 'path';
import { connectToMongoDB } from './config/databaseConfig';
import dotenv from 'dotenv';
import session from 'express-session';
import { passport } from './config/passportConfig'; // Import named export
import flash from 'connect-flash'; // Importer connect-flash

// Charger les variables d'environnement
dotenv.config();

export const app = express();

// Connexion à MongoDB
connectToMongoDB();

// Configurer EJS comme moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour lire les données du formulaire
app.use(express.urlencoded({ extended: false }));

// Configuration des sessions (nécessaire pour utiliser connect-flash)
app.use(session({
  secret: 'secretKey',  // Remplace par une clé secrète plus forte
  resave: false,
  saveUninitialized: false,
}));

// Initialiser connect-flash pour les messages flash
app.use(flash());

// Initialiser Passport.js et la session
app.use(passport.initialize());
app.use(passport.session());

// Middleware pour rendre les messages flash disponibles dans les vues
app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

// Route pour afficher la page d'accueil
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Welcome to My Express App!' });
});

// Route pour afficher le formulaire de connexion
app.get('/login', (req, res) => {
  res.render('login');  // Vue pour le formulaire de connexion
});

// Route POST pour traiter la connexion avec Passport.js
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',  // Rediriger après une connexion réussie
  failureRedirect: '/login',      // Rediriger après une connexion échouée
  failureFlash: true              // Activer les messages d'erreur (si tu utilises connect-flash)
}));

// Route protégée : accessible uniquement si l'utilisateur est authentifié
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('dashboard', { user: req.user });  // Utilisateur connecté, afficher le tableau de bord
  } else {
    res.redirect('/login');  // Rediriger vers la page de connexion si non authentifié
  }
});

// Route pour se déconnecter
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');  // Rediriger vers la page de connexion après déconnexion
  });
});

