import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { connectToMongoDB } from "./config/databaseConfig";
import { cookieStrategy } from "./config/passportCookieStrategy";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/apiRoutes";
import viewRouter from "./routes/viewRoutes";
import cors from "cors";
// Load environment variables from .env file
dotenv.config();

export const app = express();

// MongoDB
connectToMongoDB();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware setup :
// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8000', // Replace with your frontend URL if different
  methods: 'GET,POST,PUT,DELETE',
  credentials: true // If you're using cookies or other credentials
}));

// Static assets
app.use(express.static(path.join(__dirname, "public")));
// For parsing cookies
app.use(cookieParser());
// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming request: ", req.method, req.url);
  next();
});
app.use(passport.initialize());

// Configs :
cookieStrategy();

// Use routes
app.use("/api", apiRouter);
app.use("/", viewRouter);
