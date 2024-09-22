import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const authenticateViewToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      if (err) {
        console.log("Authentication error: ", err);
        return res.redirect("/auth/login");
      }
      if (!user) {
        console.log("No user found, redirecting to /auth/login");
        return res.redirect("/auth/login");
      }
      req.user = user; // Attach user to request
      console.log("User authenticated:", user);
      next();
    }
  )(req, res, next);
};
