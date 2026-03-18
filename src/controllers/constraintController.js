import Constraint from "../models/Constraint.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createConstraint = asyncHandler(async (req, res) => {
  const created = await Constraint.create(req.body);
  res.status(201).json(created);
});

export const getConstraints = asyncHandler(async (req, res) => {
  const constraints = await Constraint.find().sort({ createdAt: -1 });
  res.json(constraints);
});

export const getConstraintById = asyncHandler(async (req, res) => {
  const constraint = await Constraint.findById(req.params.id);
  if (!constraint) {
    res.status(404);
    throw new Error("Constraint not found");
  }
  res.json(constraint);
});

export const updateConstraint = asyncHandler(async (req, res) => {
  const updated = await Constraint.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!updated) {
    res.status(404);
    throw new Error("Constraint not found");
  }
  res.json(updated);
});

export const deleteConstraint = asyncHandler(async (req, res) => {
  const removed = await Constraint.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404);
    throw new Error("Constraint not found");
  }
  res.json({ message: "Constraint deleted" });
});
