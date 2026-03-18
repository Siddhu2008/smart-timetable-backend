import express from "express";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getSubjects).post(createSubject);
router.route("/:id").get(getSubjectById).put(updateSubject).delete(deleteSubject);

export default router;
