import express from "express";
import { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getRooms).post(createRoom);
router.route("/:id").get(getRoomById).put(updateRoom).delete(deleteRoom);

export default router;
