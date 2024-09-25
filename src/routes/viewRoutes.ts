import { Request, Response, Router } from "express";
import { authenticateViewToken } from "../middlewares/authenticateViewToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import { propertyListings } from "../const";
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
  authorizeRole(["agent"]),
  (req: Request, res: Response) => {
    const loggedInAgent = req.user;
    res.render("protected/agent/dashboard", {
      agent: loggedInAgent,
      propertyListing: propertyListings,
    });
  }
);

viewRouter.get(
  "/annonce",
  authenticateViewToken,
  authorizeRole(["user"]),
  (req: Request, res: Response) => {
    const loggedInUser = req.user;
    res.render("protected/user/annonce", { user: loggedInUser });
  }
);

export default viewRouter;
