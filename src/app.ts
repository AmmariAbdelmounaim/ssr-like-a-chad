import express, { Request, Response } from 'express';
import path from 'path';
import { connectToMongoDB } from './config/databaseConfig';
import dotenv from 'dotenv';

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

