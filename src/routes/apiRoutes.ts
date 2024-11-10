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
 */
apiRouter.post("/auth/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
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
 */
apiRouter.post("/auth/login", loginUser);

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
 */
apiRouter.post("/property", cookieAuthentication, authorizeRole(["agent"]), createProperty);

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
apiRouter.post("/:propertyId/comment", cookieAuthentication, authorizeRole(["user", "agent"]), addComment);

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
apiRouter.get("/:propertyId/user-comments", cookieAuthentication, authorizeRole(["user"]), getUserCommentsForProperty);

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
apiRouter.delete("/comment/:commentId", cookieAuthentication, authorizeRole(["user", "agent"]), deleteComment);

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
apiRouter.post("/comment/:commentId/reply", cookieAuthentication, authorizeRole(["agent"]), replyToComment);

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
apiRouter.put("/comment/:commentId", cookieAuthentication, authorizeRole(["user", "agent"]), updateComment);

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
