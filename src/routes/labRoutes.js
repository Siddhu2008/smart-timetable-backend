import express from "express";
import { createLab, getLabs, getLabById, updateLab, deleteLab } from "../controllers/labController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getLabs).post(createLab);
router.route("/:id").get(getLabById).put(updateLab).delete(deleteLab);

export default router;
