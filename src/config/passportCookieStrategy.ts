import passport from "passport";
import { Strategy as CookieStrategy } from "passport-cookie";
import { IUser, User } from "../models/userModel";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const cookieStrategy = () => {
  // Secret key for JWT token generation
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  // Cookie strategy for view authentication
  passport.use(
    new CookieStrategy(
      {
        cookieName: "token",
        signed: false,
        passReqToCallback: true,
      },
      async (req: Request, token: string, done: any) => {
        try {
          const decodedToken: any = jwt.verify(token, JWT_SECRET);
          const user: IUser | null = await User.findOne({
            _id: decodedToken.id,
          });
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(null, false);
        }
      }
    )
  );
};

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser).id || (user as IUser)._id); // Type assertion to IUser
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find the user by ID
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
