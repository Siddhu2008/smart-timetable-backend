import express from "express";
import {
  createConstraint,
  getConstraints,
  getConstraintById,
  updateConstraint,
  deleteConstraint
} from "../controllers/constraintController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getConstraints).post(createConstraint);
router.route("/:id").get(getConstraintById).put(updateConstraint).delete(deleteConstraint);

export default router;
