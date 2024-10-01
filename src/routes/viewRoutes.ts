import { Request, Response, Router } from "express";
import { cookieAuthentication } from "../middlewares/cookieAuthentication";
import { authorizeRole } from "../middlewares/authorizeRole";
import { getAgentProperties } from "../services/apiServices";
import { PropertyListing } from "../models/propertyLisingModel";
import { IUser } from "../models/userModel";
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
  cookieAuthentication,
  authorizeRole(["agent"]),
  async (req: Request, res: Response) => {
    const loggedInAgent = req.user as IUser;
    const propertyListings =await PropertyListing.find({ agent: loggedInAgent._id }); 
    
    res.render("protected/agent/dashboard", {
      agent: loggedInAgent,
      propertyListing: propertyListings,
    });
  }
);

viewRouter.get(
  "/dashboard/new-listing",
  cookieAuthentication,
  authorizeRole(["agent"]),
  (req: Request, res: Response) => {
    const loggedInAgent = req.user;
    res.render("protected/agent/new-listing", {
      agent: loggedInAgent,
    });
  }
);

viewRouter.get(
  "/annonce",
  cookieAuthentication,
  authorizeRole(["user"]),
  (req: Request, res: Response) => {
    const loggedInUser = req.user;
    res.render("protected/user/annonce", { user: loggedInUser });
  }
);

export default viewRouter;
