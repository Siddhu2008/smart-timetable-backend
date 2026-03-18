import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const ensureAdminSeed = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrator";
  if (!email || !password) return;

  const existing = await Admin.findOne({ email });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ name, email, password: hashed });
  console.log("Seeded admin account");
};
