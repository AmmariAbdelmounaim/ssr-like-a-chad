import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRole";
import upload from "../config/s3";
import {
  loginUser,
  registerUser,
  logoutUser,
  createProperty,
  getAllProperties,
  getAgentProperties,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
} from "../services/apiServices";
import { cookieAuthentication } from "../middlewares/cookieAuthentication";

const apiRouter = Router();

// Routes d'authentification
apiRouter.post("/auth/register", registerUser);
apiRouter.post("/auth/login", loginUser);
apiRouter.get("/logout", logoutUser);

// Routes pour gérer les propriétés
apiRouter.post(
  "/property",
  cookieAuthentication,
  authorizeRole(["agent"]),
  createProperty
);

apiRouter.post(
  "/property/:propertyId/uploadImage",
  cookieAuthentication,
  authorizeRole(["agent"]),
  upload.single("image"),
  uploadPropertyImage
);

apiRouter.get("/properties", getAllProperties);

apiRouter.get(
  "/agent/properties",
  cookieAuthentication,
  authorizeRole(["agent"]),
  getAgentProperties
);

apiRouter.put(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  updateProperty
);

apiRouter.delete(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  deleteProperty
);

export default apiRouter;
