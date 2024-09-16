import express, { Request, Response } from 'express';
import path from 'path';
import { connectToMongoDB } from './config/databaseConfig';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passportConfig'; // importe ton fichier de config

// Load environment variables from .env file
dotenv.config();

export const app = express();

// MongoDB
connectToMongoDB() 

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Welcome to My Express App!' });
});

// Middleware pour le corps des requêtes
app.use(express.urlencoded({ extended: false }));

// Configuration des sessions
app.use(session({
  secret: 'secretKey', // Remplace par une clé secrète plus forte
  resave: false,
  saveUninitialized: false
}));

// Initialiser Passport.js et les sessions
app.use(passport.initialize());
app.use(passport.session());

// Configuration de EJS pour afficher les messages
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));






//routes 
app.get('/login', (req, res) => {
  res.render('login'); // Vue pour le formulaire de connexion
});

// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/dashboard', // Redirige après une connexion réussie
//   failureRedirect: '/login',
//   failureFlash: true // Active les messages d'erreur
// }));

// app.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.redirect('/login');
//   });
// });
