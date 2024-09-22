import mongoose, { CallbackError, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define a User interface
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  agencyName?: string;
  role: "user" | "agent";
  token?: string;
}

// Define a User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: false },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  agencyName: { type: String, required: false },
  role: { type: String, required: true, enum: ["user", "agent"] },
  token: { type: String, required: false },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
