import ClassModel from "../models/Class.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createClass = asyncHandler(async (req, res) => {
  const created = await ClassModel.create(req.body);
  res.status(201).json(created);
});

export const getClasses = asyncHandler(async (req, res) => {
  const classes = await ClassModel.find().sort({ createdAt: -1 });
  res.json(classes);
});

export const getClassById = asyncHandler(async (req, res) => {
  const found = await ClassModel.findById(req.params.id);
  if (!found) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json(found);
});

export const updateClass = asyncHandler(async (req, res) => {
  const updated = await ClassModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!updated) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json(updated);
});

export const deleteClass = asyncHandler(async (req, res) => {
  const removed = await ClassModel.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ message: "Class deleted" });
});
