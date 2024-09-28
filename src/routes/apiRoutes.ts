import { Router } from "express";
import { authenticateAPIToken } from "../middlewares/authenticateAPIToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import { checkAgentAuthorization } from "../middlewares/checkAgentAuthorization";
import extractUserFromCookie from "../middlewares/extractUserfromCookies";
import upload from '../config/s3';
import * as apiServices from '../services/apiServices';

const apiRouter = Router();

// Routes d'authentification
apiRouter.post("/auth/register", apiServices.registerUser);
apiRouter.post("/auth/login", apiServices.loginUser);
apiRouter.get("/logout", apiServices.logoutUser);


// Routes pour gérer les propriétés
apiRouter.post('/property', extractUserFromCookie, authorizeRole(['agent']), apiServices.createProperty);
apiRouter.post('/property/:propertyId/uploadImage', upload.single('image'), apiServices.uploadPropertyImage);
apiRouter.get('/properties', apiServices.getAllProperties);
apiRouter.get('/agent/properties', authenticateAPIToken, authorizeRole(['agent']), extractUserFromCookie, apiServices.getAgentProperties);
apiRouter.put('/property/:propertyId', extractUserFromCookie, authenticateAPIToken, authorizeRole(['agent']), apiServices.updateProperty);
apiRouter.delete('/property/:propertyId', extractUserFromCookie, authenticateAPIToken, authorizeRole(['agent']), apiServices.deleteProperty);

export default apiRouter;
