import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import constraintRoutes from "./routes/constraintRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "SMART TIMETABLE GENERATOR SYSTEM API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/constraints", constraintRoutes);
app.use("/api/timetable", timetableRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
