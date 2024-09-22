import { Router } from "express";
import { authenticateViewToken } from "../middlewares/authenticateViewToken";
import { authorizeRole } from "../middlewares/authorizeRole";

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

viewRouter.get(
  "/dashboard",
  authenticateViewToken,
  authorizeRole("agent"),
  (req, res) => {
    res.render("protected/agent/dashboard");
  }
);

viewRouter.get(
  "/annonce",
  authenticateViewToken,
  authorizeRole("user"),
  (req, res) => {
    res.render("protected/user/annonce");
  }
);

export default viewRouter;
