import { IUser } from '../models/User'; // Assurez-vous que le chemin est correct

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Déclare que req.user est de type IUser
    }
  }
}
