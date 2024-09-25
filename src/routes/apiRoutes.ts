import { Request, Response } from "express";
import { Router } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateAPIToken } from "../middlewares/authenticateAPIToken";
import { authorizeRole } from "../middlewares/authorizeRole";

const apiRouter = Router();

// POST route for registration
apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { username, password, email, role, agencyName } = req.body;
  console.log("request body: ", req.body);
  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create a new user
    const user = new User({
      username,
      password,
      email,
      role,
      agencyName,
    });
    // Save user to MongoDB
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

  console.log("Login attempt by: ", email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log("User not found: ", email);
    return res.status(400).json({ message: "Utilisateur non trouvé" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("Invalid password for email: ", email);
    return res
      .status(400)
      .json({ message: "Cet email et mot de passe ne correspondent pas" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();

  res.cookie("token", token, { httpOnly: true });

  const role = user.role;
  return res.status(200).json({ role });
});

// For logout
apiRouter.get("/logout", (req, res) => {
  console.log("Logout attempt.");
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
export default apiRouter;
