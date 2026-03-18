import Lab from "../models/Lab.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createLab = asyncHandler(async (req, res) => {
  const created = await Lab.create(req.body);
  res.status(201).json(created);
});

export const getLabs = asyncHandler(async (req, res) => {
  const labs = await Lab.find().sort({ createdAt: -1 });
  res.json(labs);
});

export const getLabById = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  res.json(lab);
});

export const updateLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  res.json(lab);
});

export const deleteLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findByIdAndDelete(req.params.id);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  res.json({ message: "Lab deleted" });
});
