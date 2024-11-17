import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRole";
import { upload } from "../config/s3"; // Configuration pour l'upload d'images vers S3
import {
  loginUser,
  registerUser,
  logoutUser,
  createProperty,
  getAllProperties,
  getAgentProperties,
  updateProperty,
  deletePropertyWithImages,
  uploadPropertyImage,
  addComment,
  getCommentsForProperty,
  deleteComment,
  replyToComment,
  updateComment,
  getCommentWithReplies,
  deletePropertyImage,
  getUserCommentsForProperty,
} from "../services/apiServices";
import { cookieAuthentication } from "../middlewares/cookieAuthentication";
import passport from "passport";

const apiRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: |
 *       This endpoint registers a new user. The user details are provided in the request body.
 *       The service performs the following steps:
 *       1. Validates the input data.
 *       2. Hashes the password.
 *       3. Saves the user to the database.
 *       4. Returns a success message upon successful registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               role:
 *                 type: string
 *                 example: agent
 *               agencyName:
 *                 type: string
 *                 example: "Top Real Estate Agency"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, invalid input data
 *       500:
 *         description: Internal server error
 */
apiRouter.post("/auth/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     description: |
 *       This endpoint logs in a user. The user credentials are provided in the request body.
 *       The service performs the following steps:
 *       1. Validates the input data.
 *       2. Checks the user's credentials against the database.
 *       3. If valid, generates a session or token for the user.
 *       4. Returns a success message and user details upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized, invalid credentials
 *       500:
 *         description: Internal server error
 */
apiRouter.post("/auth/login", loginUser);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication
 */
apiRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to dashboard after successful authentication
 */
apiRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    // Successful authentication, redirect to dashboard.
    res.redirect("/annonce");
  }
);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
apiRouter.post("/logout", logoutUser);

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: API for managing properties
 */

/**
 * @swagger
 * /api/property:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     description: |
 *       This endpoint allows an agent to create a new property listing. The agent must be authenticated and authorized to perform this action.
 *       The service performs the following steps:
 *       1. Validates the input data.
 *       2. Associates the property with the authenticated agent.
 *       3. Saves the property to the database.
 *       4. Optionally handles image uploads and associates them with the property.
 *       5. Returns a success message and the created property details upon successful creation.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Beautiful apartment for rent
 *               propertyType:
 *                 type: string
 *                 enum: [vente, location]
 *                 example: location
 *               publicationStatus:
 *                 type: string
 *                 enum: [publié, non publié]
 *                 example: publié
 *               propertyStatus:
 *                 type: string
 *                 enum: [loué, vendu, disponible]
 *                 example: disponible
 *               description:
 *                 type: string
 *                 example: "A beautiful apartment with 3 bedrooms and 2 bathrooms."
 *               price:
 *                 type: number
 *                 example: 1200
 *               availabilityDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Propriété créée avec succès."
 *                 property:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     title:
 *                       type: string
 *                       example: Beautiful apartment for rent
 *                     propertyType:
 *                       type: string
 *                       example: location
 *                     publicationStatus:
 *                       type: string
 *                       example: publié
 *                     propertyStatus:
 *                       type: string
 *                       example: disponible
 *                     description:
 *                       type: string
 *                       example: "A beautiful apartment with 3 bedrooms and 2 bathrooms."
 *                     price:
 *                       type: number
 *                       example: 1200
 *                     availabilityDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01"
 *                     agent:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       400:
 *         description: Bad request, invalid input data
 *       403:
 *         description: Forbidden, user not authorized
 *       500:
 *         description: Internal server error
 */
apiRouter.post(
  "/property",
  cookieAuthentication,
  authorizeRole(["agent"]),
  createProperty
);

/**

 * @swagger
 * /api/property/{propertyId}/uploadImage:

 *   post:
 *     summary: Upload an image for a property

 *     tags: [Properties]

 *     parameters:
 *       - in: path
 *         name: propertyId

 *         required: true
 *         description: ID of the property
 *     security:
 *       - cookieAuth: []

 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:

 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:

 *               type: object
 *               properties:
 *                 message:

 *                   type: string
 *                   example: "Image ajoutée avec succès."

 *                 property:
 *                   type: object
 *                   properties:

 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce non trouvée."
 *       500:
 *         description: Internal server error

 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:

 *                 error:

 *                   type: string
 *                   example: "Erreur interne du serveur."
 */

apiRouter.post(
  "/property/:propertyId/uploadImage",
  cookieAuthentication,
  authorizeRole(["agent"]),
  upload.single("image"),
  uploadPropertyImage
);

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Retrieve all properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of all properties
 */
apiRouter.get("/properties", getAllProperties);

/**
 * @swagger
 * /api/agent/properties:
 *   get:
 *     summary: Retrieve properties associated with an agent
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of agent's properties
 */
apiRouter.get(
  "/agent/properties",
  cookieAuthentication,
  authorizeRole(["agent"]),
  getAgentProperties
);

/**
 * @swagger
 * /api/property/{propertyId}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated property title
 *               description:
 *                 type: string
 *                 example: Updated property description
 *               price:
 *                 type: number
 *                 example: 1300
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
apiRouter.put(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  updateProperty
);

/**
 * @swagger
 * /api/property/{propertyId}:
 *   delete:
 *     summary: Delete a property with its images
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property deleted successfully
 */
apiRouter.delete(
  "/property/:propertyId",
  cookieAuthentication,
  authorizeRole(["agent"]),
  deletePropertyWithImages
);

/**
 * @swagger
 * /api/property/{propertyId}/image/{imageUrl}:
 *   delete:
 *     summary: Delete an image from a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *       - in: path
 *         name: imageUrl
 *         required: true
 *         description: URL of the image
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
apiRouter.delete(
  `/property/:propertyId/image/:imageUrl`,
  cookieAuthentication,
  authorizeRole(["agent"]),
  deletePropertyImage
);

// -------------------- COMMENT ROUTES --------------------

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments on properties
 */

/**
 * @swagger
 * /api/{propertyId}/comment:
 *   post:
 *     summary: Add a comment to a property
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Great property with amazing views!"
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
apiRouter.post(
  "/:propertyId/comment",
  cookieAuthentication,
  authorizeRole(["user", "agent"]),
  addComment
);

/**
 * @swagger
 * /api/{propertyId}/comments:
 *   get:
 *     summary: Retrieve all comments for a property
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *     responses:
 *       200:
 *         description: List of comments
 */
apiRouter.get("/:propertyId/comments", getCommentsForProperty);

/**
 * @swagger
 * /api/{propertyId}/user-comments:
 *   get:
 *     summary: Retrieve user comments for a property
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: ID of the property
 *     responses:
 *       200:
 *         description: List of user comments
 */
apiRouter.get(
  "/:propertyId/user-comments",
  cookieAuthentication,
  authorizeRole(["user"]),
  getUserCommentsForProperty
);

/**
 * @swagger
 * /api/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
apiRouter.delete(
  "/comment/:commentId",
  cookieAuthentication,
  authorizeRole(["user", "agent"]),
  deleteComment
);

/**
 * @swagger
 * /api/comment/{commentId}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Thank you for the feedback!"
 *     responses:
 *       201:
 *         description: Reply added successfully
 */
apiRouter.post(
  "/comment/:commentId/reply",
  cookieAuthentication,
  authorizeRole(["agent"]),
  replyToComment
);

/**
 * @swagger
 * /api/comment/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
apiRouter.put(
  "/comment/:commentId",
  cookieAuthentication,
  authorizeRole(["user", "agent"]),
  updateComment
);

/**
 * @swagger
 * /api/comment/{commentId}:
 *   get:
 *     summary: Retrieve a comment with its replies
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: Comment with replies
 */
apiRouter.get("/comment/:commentId", getCommentWithReplies);

export default apiRouter;
