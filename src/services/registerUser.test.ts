import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import {
  jest,
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from "@jest/globals"; // Import necessary Jest functions
import { app } from "../app";

jest.mock("jsonwebtoken");

let mongoServer: MongoMemoryServer;

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

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("registerUser", () => {
  it("should return 400 if any required field is missing", async () => {
    const response = await request(app)
      .post("/api/auth/register") // Adjust the endpoint as necessary
      .send({ username: "testuser", password: "password123" }); // Missing email and role

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Tous les champs sont requis.");
  });

  it("should return 400 if email already exists", async () => {
    const user = new User({
      username: "existinguser",
      password: "password123",
      email: "test@example.com",
      role: "user",
    });
    await user.save();

    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      role: "user",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("L'email existe déjà.");
  });

  it("should register a user and return 201 with a success message", async () => {
    (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      role: "user",
      agencyName: "Test Agency",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Utilisateur enregistré avec succès.");

    const user = await User.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
    expect(user?.token).toBe("fakeToken");
  });

  it("should return 500 if there is a server error", async () => {
    jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      role: "user",
      agencyName: "Test Agency",
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Erreur interne du serveur.");
  });
});
