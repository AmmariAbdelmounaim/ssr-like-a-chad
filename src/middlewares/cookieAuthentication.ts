import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const cookieAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    // If the user is authenticated via session
    return next();
  }

  const token = req.cookies.token;
  console.log("Token received: ", token);

  if (!token) {
    console.log("No token found, redirecting to /auth/login");
    return res.redirect("/auth/login");
  }

  passport.authenticate(
    ["cookie"],
    { session: false },
    (err: any, user: any) => {
      if (err || !user) {
        console.log("Authentication error: ", err);
        return res.redirect("/auth/login");
      }
      req.user = user; // Attach user to request
      console.log("User authenticated:", user);
      next();
    }
  )(req, res, next);
};
