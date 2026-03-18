import Room from "../models/Room.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createRoom = asyncHandler(async (req, res) => {
  const created = await Room.create(req.body);
  res.status(201).json(created);
});

export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
});

export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  res.json(room);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  res.json(room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  res.json({ message: "Room deleted" });
});
