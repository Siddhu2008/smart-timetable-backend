import Subject from "../models/Subject.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSubject = asyncHandler(async (req, res) => {
  const created = await Subject.create(req.body);
  res.status(201).json(created);
});

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find()
    .populate("class", "className department studentCount")
    .populate("teacher", "name department");
  res.json(subjects);
});

export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate("class", "className department studentCount")
    .populate("teacher", "name department");
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json(subject);
});

export const updateSubject = asyncHandler(async (req, res) => {
  const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!updated) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json(updated);
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const removed = await Subject.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json({ message: "Subject deleted" });
});
