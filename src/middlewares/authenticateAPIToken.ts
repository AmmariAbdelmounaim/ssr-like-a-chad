import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const authenticateAPIToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("bearer", { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user; 
    next();
  })(req, res, next);
};
