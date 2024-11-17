import {
  createProperty,
  getAgentProperties,
  getAllProperties,
  updateProperty,
} from "./apiServices";
import { Request, Response } from "express";
import { MulterRequest } from "../types/multerRequest";
import { IUser } from "../models/userModel";
import { PropertyListing } from "../models/propertyLisingModel";
import mongoose from "mongoose";

jest.mock("../models/propertyLisingModel");

describe("createProperty", () => {
  let req: Partial<MulterRequest>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {
      body: {
        title: "Test Property",
        propertyType: "Apartment",
        publicationStatus: "publié",
        propertyStatus: "available",
        description: "A beautiful apartment",
        price: 100000,
        availabilityDate: new Date(),
      },
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: "agent",
      } as unknown as IUser,
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should create a new property and return 201 status", async () => {
    const mockObjectId = new mongoose.Types.ObjectId();
    const saveMock = jest.fn().mockResolvedValue({
      _id: mockObjectId,
      ...req.body,
      agent: (req.user as IUser)?._id,
      photos: ["http://example.com/image1.jpg"],
    });
    (PropertyListing as unknown as jest.Mock).mockImplementation(() => ({
      save: saveMock,
    }));

    await createProperty(req as unknown as Request, res as Response);

    expect(PropertyListing).toHaveBeenCalledWith({
      ...req.body,
      agent: (req.user as IUser)?._id,
    });
    expect(saveMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Propriété créée avec succès.",
      property: expect.objectContaining({
        _id: mockObjectId,
        title: "Test Property",
        photos: ["http://example.com/image1.jpg"],
      }),
    });
  });

  it("should return 500 status on error", async () => {
    const saveMock = jest.fn().mockRejectedValue(new Error("Database error"));
    (PropertyListing as unknown as jest.Mock).mockImplementation(() => ({
      save: saveMock,
    }));

    await createProperty(req as unknown as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Erreur interne du serveur.",
    });
  });
});

describe("getAllProperties", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should return a list of properties with 200 status", async () => {
    const mockProperties = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Test Property 1",
        publicationStatus: "publié",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Test Property 2",
        publicationStatus: "publié",
      },
    ];
    (PropertyListing.find as jest.Mock).mockResolvedValue(mockProperties);

    await getAllProperties(req as Request, res as Response);

    expect(PropertyListing.find).toHaveBeenCalledWith({
      publicationStatus: "publié",
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockProperties);
  });

  it("should return 404 status when no properties are found", async () => {
    (PropertyListing.find as jest.Mock).mockResolvedValue([]);

    await getAllProperties(req as Request, res as Response);

    expect(PropertyListing.find).toHaveBeenCalledWith({
      publicationStatus: "publié",
    });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Aucune propriété trouvée.",
    });
  });

  it("should return 500 status on error", async () => {
    (PropertyListing.find as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await getAllProperties(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Erreur interne du serveur.",
    });
  });
});

describe("getAgentProperties", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {
      user: { _id: new mongoose.Types.ObjectId() } as IUser,
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should return a list of properties for the agent with 200 status", async () => {
    const mockProperties = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Agent Property 1",
        agent: (req.user as IUser)?._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Agent Property 2",
        agent: (req.user as IUser)?._id,
      },
    ];
    (PropertyListing.find as jest.Mock).mockResolvedValue(mockProperties);

    await getAgentProperties(req as Request, res as Response);

    expect(PropertyListing.find).toHaveBeenCalledWith({
      agent: (req.user as IUser)?._id,
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockProperties);
  });

  it("should return 404 status when no properties are found for the agent", async () => {
    (PropertyListing.find as jest.Mock).mockResolvedValue([]);

    await getAgentProperties(req as Request, res as Response);

    expect(PropertyListing.find).toHaveBeenCalledWith({
      agent: (req.user as IUser)?._id,
    });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Aucune propriété trouvée pour cet agent.",
    });
  });

  it("should return 500 status on error", async () => {
    (PropertyListing.find as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await getAgentProperties(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Erreur interne du serveur.",
    });
  });
});

describe("updateProperty", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {
      params: { propertyId: new mongoose.Types.ObjectId().toString() },
      body: { title: "Updated Property Title" },
      user: { _id: new mongoose.Types.ObjectId() } as IUser,
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should update the property and return 200 status", async () => {
    const mockProperty = {
      _id: req?.params?.propertyId,
      title: "Original Property Title",
      agent: (req.user as IUser)?._id,
    };
    const updatedProperty = {
      ...mockProperty,
      title: req.body.title,
    };

    (PropertyListing.findOne as jest.Mock).mockResolvedValue(mockProperty);
    (PropertyListing.findByIdAndUpdate as jest.Mock).mockResolvedValue(
      updatedProperty
    );

    await updateProperty(req as Request, res as Response);

    expect(PropertyListing.findOne).toHaveBeenCalledWith({
      _id: req?.params?.propertyId,
      agent: (req.user as IUser)?._id,
    });
    expect(PropertyListing.findByIdAndUpdate).toHaveBeenCalledWith(
      req?.params?.propertyId,
      { $set: req.body },
      { new: true }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Propriété mise à jour avec succès.",
      property: updatedProperty,
    });
  });

  it("should return 404 status when property is not found", async () => {
    (PropertyListing.findOne as jest.Mock).mockResolvedValue(null);

    await updateProperty(req as Request, res as Response);

    expect(PropertyListing.findOne).toHaveBeenCalledWith({
      _id: req?.params?.propertyId,
      agent: (req.user as IUser)?._id,
    });
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Propriété non trouvée.",
    });
  });

  it("should return 400 status when trying to update the agent", async () => {
    req.body.agent = new mongoose.Types.ObjectId().toString();

    const mockProperty = {
      _id: req?.params?.propertyId,
      title: "Original Property Title",
      agent: (req.user as IUser)?._id,
    };

    (PropertyListing.findOne as jest.Mock).mockResolvedValue(mockProperty);

    await updateProperty(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "La modification de l'agent n'est pas autorisée.",
    });
  });

  it("should return 500 status on error", async () => {
    (PropertyListing.findOne as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await updateProperty(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Erreur interne du serveur.",
    });
  });
});
