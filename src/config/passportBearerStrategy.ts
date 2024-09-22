import passport from "passport";
import {
  Strategy as BearerStrategy,
} from "passport-http-bearer";
import { IUser, User } from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

export const bearerStrategy = () => {
  // Secret key for JWT token generation
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  // Bearer strategy for API authentication
  passport.use(
    new BearerStrategy(async (token, done) => {
      try {
        const user: IUser | null = await User.findOne({ token });
        if (!user) {
          return done(null, false);
        }
        // User authenticated successfully
        return done(null, user);
      } catch (error) {
        return done(null, false);
      }
    })
  );
};
