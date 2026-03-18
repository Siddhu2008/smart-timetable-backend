import express from "express";
import {
  generateTimetableHandler,
  getTimetableById,
  getPrintableTimetable,
  getTimetables,
  updateTimetable,
  deleteTimetable
} from "../controllers/timetableController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/generate", generateTimetableHandler);
router.get("/", getTimetables);
router.get("/:id/printable", getPrintableTimetable);
router.get("/:id", getTimetableById);
router.put("/:id", updateTimetable);
router.delete("/:id", deleteTimetable);

export default router;
