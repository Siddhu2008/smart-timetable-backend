import express from "express";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
} from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getClasses).post(createClass);
router.route("/:id").get(getClassById).put(updateClass).delete(deleteClass);

export default router;
