import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { IUser, User } from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();
export const googleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails![0].value });

          if (!user) {
            user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails![0].value,
              role: "user", // Default role, adjust as needed
            });
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
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
