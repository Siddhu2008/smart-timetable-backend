import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { ensureAdminSeed } from "./utils/seedAdmin.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await ensureAdminSeed();
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
};

start();
