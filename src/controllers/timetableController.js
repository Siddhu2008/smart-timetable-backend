import Timetable from "../models/Timetable.js";
import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import Room from "../models/Room.js";
import Lab from "../models/Lab.js";
import Subject from "../models/Subject.js";
import Constraint from "../models/Constraint.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateTimetable } from "../utils/timetableGenerator.js";

const pickConstraint = async (constraintId) => {
  if (constraintId) {
    return Constraint.findById(constraintId);
  }
  return Constraint.findOne().sort({ createdAt: -1 });
};

export const generateTimetableHandler = asyncHandler(async (req, res) => {
  const {
    type: rawType,
    referenceId: rawReferenceId,
    classId,
    semester,
    academicYear,
    workingDays,
    constraintId
  } = req.body;

  const type = classId ? "class" : rawType;
  const referenceId = classId || rawReferenceId;

  if (!type || !referenceId || !semester || !academicYear) {
    res.status(400);
    throw new Error("type/classId, semester, academicYear are required");
  }

  const constraint = await pickConstraint(constraintId);
  const maxLecturesPerDay = constraint?.maxLecturesPerDay || 4;
  const roomRules = {
    capacityStrict: constraint?.roomRules?.capacityStrict ?? true,
    typeMatch: constraint?.roomRules?.typeMatch ?? true
  };
  const labRules = {
    capacityStrict: constraint?.labRules?.capacityStrict ?? false,
    typeMatch: constraint?.labRules?.typeMatch ?? true
  };

  const days = workingDays && workingDays.length ? workingDays : constraint?.workingDays;

  let subjects = [];
  let fixedRoomId = null;
  let fixedLabId = null;

  if (type === "class") {
    subjects = await Subject.find({ class: referenceId });
  } else if (type === "teacher") {
    subjects = await Subject.find({ teacher: referenceId });
  } else if (type === "room") {
    subjects = await Subject.find({ type: "theory" });
    fixedRoomId = referenceId;
  } else if (type === "lab") {
    subjects = await Subject.find({ type: "practical" });
    fixedLabId = referenceId;
  } else {
    res.status(400);
    throw new Error("Invalid type");
  }

  const teacherIds = [...new Set(subjects.map((s) => String(s.teacher)))];
  const classIds = [...new Set(subjects.map((s) => String(s.class)))];

  const [teachers, classes, rooms, labs] = await Promise.all([
    Teacher.find({ _id: { $in: teacherIds } }),
    ClassModel.find({ _id: { $in: classIds } }),
    Room.find(),
    Lab.find()
  ]);

  const classMap = new Map(classes.map((c) => [String(c._id), c]));

  const { schedule, unassigned, error } = generateTimetable({
    days,
    maxLecturesPerDay,
    subjects,
    teachers,
    rooms,
    labs,
    classMap,
    roomRules,
    labRules,
    fixedRoomId,
    fixedLabId,
    academicYear,
    semester
  });

  if (!schedule) {
    res.status(409);
    throw new Error(error || "Insufficient resources or conflicting constraints.");
  }

  const created = await Timetable.create({
    type,
    referenceId,
    schedule,
    semester,
    academicYear
  });

  res.status(201).json({ timetable: created, unassigned });
});

export const getTimetableById = asyncHandler(async (req, res) => {
  const timetable = await Timetable.findById(req.params.id);
  if (!timetable) {
    res.status(404);
    throw new Error("Timetable not found");
  }
  res.json(timetable);
});

export const getPrintableTimetable = asyncHandler(async (req, res) => {
  const timetable = await Timetable.findById(req.params.id);
  if (!timetable) {
    res.status(404);
    throw new Error("Timetable not found");
  }
  res.json({ printable: timetable.schedule?.printable || null });
});

export const getTimetables = asyncHandler(async (req, res) => {
  const { type, refId } = req.query;
  const query = {};
  if (type) query.type = type;
  if (refId) query.referenceId = refId;
  const timetables = await Timetable.find(query).sort({ createdAt: -1 });
  res.json(timetables);
});

export const updateTimetable = asyncHandler(async (req, res) => {
  const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error("Timetable not found");
  }
  res.json(updated);
});

export const deleteTimetable = asyncHandler(async (req, res) => {
  const removed = await Timetable.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404);
    throw new Error("Timetable not found");
  }
  res.json({ message: "Timetable deleted" });
});
