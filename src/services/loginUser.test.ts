import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import { loginUser } from "./apiServices";
import request from "supertest";
import { app } from "../app"; // Assuming you have an Express app exported from this file
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/userModel");

let mongoServer: MongoMemoryServer;

describe("loginUser", () => {
  const mockUser = {
    _id: "user-id",
    email: "test@example.com",
    password: "hashed-password",
    role: "user",
    save: jest.fn(),
    token: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should return 400 if the password is incorrect", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongPassword" });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongPassword",
      "hashed-password"
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email ou mot de passe incorrect.");
  });

  it("should return 200 and a token if credentials are valid", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mockToken");

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id, role: mockUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    expect(response.status).toBe(200);
    expect(response.body.token).toBe("mockToken");
    expect(response.body.role).toBe(mockUser.role);
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
