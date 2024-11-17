// apiServices.test.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { PropertyListing } from "../models/propertyLisingModel";
import { getCommentsForProperty } from "./apiServices";

// Mock the Mongoose models
jest.mock("../models/propertyLisingModel");
jest.mock("../models/commentModel");

describe("getCommentsForProperty", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {
      params: {
        propertyId: new mongoose.Types.ObjectId().toString(),
      },
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should return 404 if property is not found", async () => {
    (PropertyListing.findById as jest.Mock).mockResolvedValue(null);

    await getCommentsForProperty(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Annonce non trouvée" });
  });

  it("should handle errors", async () => {
    const error = new Error("Database error");
    (PropertyListing.findById as jest.Mock).mockRejectedValue(error);

    await getCommentsForProperty(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Erreur lors de la récupération des commentaires",
      error,
    });
  });
});
