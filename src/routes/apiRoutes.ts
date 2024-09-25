import { Request, Response } from "express";
import { Router } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateAPIToken } from "../middlewares/authenticateAPIToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import upload from '../config/s3';  // Importer la configuration pour 
import { MulterRequest } from "../types/multerRequest";


const apiRouter = Router();

// POST route for registration
apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { username, password, email, role, agencyName } = req.body;
  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Create a new user
    const user = new User({
      username,
      password,
      email,
      role,
      agencyName,
    });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    user.token = token;
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST route for Login
apiRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Utilisateur non trouvé" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Cet email et mot de passe ne correspondent pas" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();

  res.cookie("token", token, { httpOnly: true });

  return res.status(200).json({ role: user.role });
});

// For logout
apiRouter.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

apiRouter.get("/protected", authenticateAPIToken, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

apiRouter.get(
  "/agent",
  authenticateAPIToken,
  authorizeRole(["agent"]),
  (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
  }
);

apiRouter.get(
  "/user",
  authenticateAPIToken,
  authorizeRole(["user"]),
  (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
  }
);

// Route POST pour uploader une image avec agentId et annonceId dans l'URL
apiRouter.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    // Cast to MulterRequest to ensure TypeScript knows about `file`
    const customReq = req as unknown as MulterRequest;

    // Récupérer agentId et annonceId depuis req.query
    const agentId = req.query.agentId as string;
    const annonceId = req.query.annonceId as string;

    // Vérifier si tous les champs sont présents
    if (!customReq.file || !agentId || !annonceId) {
      return res.status(400).json({ message: 'Image, agentId ou annonceId manquant' });
    }


    // Construire le chemin de stockage sur S3
    const fileLocation = customReq.file.location;
    const imagePath = `${agentId}/${annonceId}/${customReq.file.originalname}`;  // Organiser les fichiers dans S3

    // Générer l'URL publique de l'image sur S3
    const imageUrl = `https://tpwebbucket.s3.${process.env.AWS_REGION}.amazonaws.com/${imagePath}`;

    return res.status(201).json({
      message: 'Image téléchargée avec succès!',
      imageUrl: imageUrl,  // URL publique correcte de l'image sur S3
      path: imagePath
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});







export default apiRouter;
