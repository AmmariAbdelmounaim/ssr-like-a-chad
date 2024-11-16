import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define a User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  agencyName?: string;
  role: "user" | "agent";
  token?: string;
}

// Define a User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: false },
  password: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  agencyName: { type: String, required: false },
  role: { type: String, required: false, enum: ["user", "agent"] },
  token: { type: String, required: false },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  if (this.password) this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
