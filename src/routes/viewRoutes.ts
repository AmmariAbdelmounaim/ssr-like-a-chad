import { Router } from "express";
import { authenticateViewToken } from "../middlewares/authenticateViewToken";

const viewRouter = Router();

viewRouter.get("/", (req, res) => {
  res.render("index", { title: "Welcome to My Express App!" });
});

viewRouter.get("/auth/login", (req, res) => {
  res.render("auth/login");
});

viewRouter.get("/auth/register", (req, res) => {
  res.render("auth/register");
});

viewRouter.get("/protected/dashboard", authenticateViewToken, (req, res) => {
  res.render("protected/dashboard"); // Render protected.ejs with user data
});

export default viewRouter;
