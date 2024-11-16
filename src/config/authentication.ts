import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    return next();
  }
  res.redirect("/"); // Redirect to login if not authenticated
};
