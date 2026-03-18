import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    token: generateToken(admin._id),
    admin: { id: admin._id, name: admin.name, email: admin.email }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});
