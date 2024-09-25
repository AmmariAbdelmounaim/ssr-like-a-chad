import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/userModel";

export const authorizeRole = (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.user as IUser;
    if (!user || !role.includes(user.role)) {
      console.log(`User role ${user.role} not authorized`);
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
