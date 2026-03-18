import dotenv from "dotenv";
import mongoose from "mongoose";
import Teacher from "./src/models/Teacher.js";
import ClassModel from "./src/models/Class.js";
import Room from "./src/models/Room.js";
import Lab from "./src/models/Lab.js";
import Subject from "./src/models/Subject.js";
import Constraint from "./src/models/Constraint.js";
import Timetable from "./src/models/Timetable.js";

dotenv.config();

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }
  await mongoose.connect(process.env.MONGO_URI);
};

const main = async () => {
  await connect();
  console.log("Connected to MongoDB");

  await Promise.all([
    Teacher.deleteMany({}),
    ClassModel.deleteMany({}),
    Room.deleteMany({}),
    Lab.deleteMany({}),
    Subject.deleteMany({}),
    Constraint.deleteMany({}),
    Timetable.deleteMany({})
  ]);

  console.log("Database cleared successfully");

  const teachers = await Teacher.insertMany([
    { name: "Dr. Ananya Rao", department: "CSE", subjects: ["Data Structures"] },
    { name: "Mr. Kiran Mehta", department: "CSE", subjects: ["DBMS"] },
    { name: "Ms. Priya Nair", department: "CSE", subjects: ["Operating Systems"] },
    { name: "Dr. Arjun Verma", department: "CSE", subjects: ["Programming Lab"] },
    { name: "Dr. Meera Shah", department: "ECE", subjects: ["Analog Circuits"] },
    { name: "Mr. Rohan Kulkarni", department: "ECE", subjects: ["Digital Systems"] },
    { name: "Ms. Neha Iyer", department: "ECE", subjects: ["Signals & Systems"] },
    { name: "Dr. Vikram Singh", department: "ECE", subjects: ["Electronics Lab"] },
    { name: "Dr. Suresh Kumar", department: "MECH", subjects: ["Thermodynamics"] },
    { name: "Ms. Kavita Joshi", department: "MECH", subjects: ["Fluid Mechanics"] },
    { name: "Mr. Deepak Menon", department: "MECH", subjects: ["Machine Design"] },
    { name: "Dr. Rahul Bhat", department: "MECH", subjects: ["CAD Lab"] }
  ]);

  const teacherByName = new Map(teachers.map((t) => [t.name, t]));

  const classes = await ClassModel.insertMany([
    { className: "CSE-A", department: "CSE", studentCount: 60, subjects: [] },
    { className: "CSE-B", department: "CSE", studentCount: 55, subjects: [] },
    { className: "ECE-A", department: "ECE", studentCount: 60, subjects: [] },
    { className: "ECE-B", department: "ECE", studentCount: 55, subjects: [] },
    { className: "MECH-A", department: "MECH", studentCount: 60, subjects: [] },
    { className: "MECH-B", department: "MECH", studentCount: 55, subjects: [] }
  ]);

  const classByName = new Map(classes.map((c) => [c.className, c]));

  const roomDocs = [];
  for (let i = 101; i <= 110; i += 1) {
    roomDocs.push({ roomName: `LH-${i}`, capacity: 60, type: "lecture hall" });
  }
  roomDocs.push({ roomName: "AUD-1", capacity: 300, type: "auditorium" });
  await Room.insertMany(roomDocs);

  await Lab.insertMany([
    { labName: "CSE Lab 1", labType: "Programming", capacity: 20 },
    { labName: "CSE Lab 2", labType: "Database", capacity: 20 },
    { labName: "ECE Lab 1", labType: "Analog", capacity: 20 },
    { labName: "ECE Lab 2", labType: "Digital", capacity: 20 },
    { labName: "MECH Lab 1", labType: "Thermal", capacity: 20 },
    { labName: "MECH Lab 2", labType: "Manufacturing", capacity: 20 }
  ]);

  const subjectTemplates = {
    CSE: [
      { name: "Data Structures", type: "theory", hours: 4, teacher: "Dr. Ananya Rao" },
      { name: "DBMS", type: "theory", hours: 4, teacher: "Mr. Kiran Mehta" },
      { name: "Operating Systems", type: "theory", hours: 4, teacher: "Ms. Priya Nair" },
      { name: "Programming Lab", type: "practical", hours: 4, teacher: "Dr. Arjun Verma" }
    ],
    ECE: [
      { name: "Analog Circuits", type: "theory", hours: 4, teacher: "Dr. Meera Shah" },
      { name: "Digital Systems", type: "theory", hours: 4, teacher: "Mr. Rohan Kulkarni" },
      { name: "Signals & Systems", type: "theory", hours: 4, teacher: "Ms. Neha Iyer" },
      { name: "Electronics Lab", type: "practical", hours: 4, teacher: "Dr. Vikram Singh" }
    ],
    MECH: [
      { name: "Thermodynamics", type: "theory", hours: 4, teacher: "Dr. Suresh Kumar" },
      { name: "Fluid Mechanics", type: "theory", hours: 4, teacher: "Ms. Kavita Joshi" },
      { name: "Machine Design", type: "theory", hours: 4, teacher: "Mr. Deepak Menon" },
      { name: "CAD Lab", type: "practical", hours: 4, teacher: "Dr. Rahul Bhat" }
    ]
  };

  const subjectDocs = [];
  classes.forEach((cls) => {
    const templates = subjectTemplates[cls.department] || [];
    templates.forEach((subject) => {
      const teacher = teacherByName.get(subject.teacher);
      if (!teacher) return;
      subjectDocs.push({
        subjectName: subject.name,
        class: classByName.get(cls.className)._id,
        teacher: teacher._id,
        hoursPerWeek: subject.hours,
        type: subject.type
      });
    });
  });

  await Subject.insertMany(subjectDocs);

  const classSubjectsMap = {};
  subjectDocs.forEach((subject) => {
    const classId = String(subject.class);
    if (!classSubjectsMap[classId]) classSubjectsMap[classId] = new Set();
    classSubjectsMap[classId].add(subject.subjectName);
  });
  await Promise.all(
    classes.map((cls) =>
      ClassModel.updateOne(
        { _id: cls._id },
        { $set: { subjects: Array.from(classSubjectsMap[String(cls._id)] || []) } }
      )
    )
  );

  await Constraint.create({
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slotsPerDay: 8,
    slotDuration: 60,
    breakTime: "RECESS",
    recessAfter: 4,
    shortBreakAfter: 6,
    maxLecturesPerDay: 5,
    practicalConsecutive: true,
    teacherRules: { noBackToBack: true, minGap: 0 },
    roomRules: { capacityStrict: true, typeMatch: true },
    labRules: { capacityStrict: false, typeMatch: true }
  });

  console.log("New sample data inserted successfully");
  await mongoose.connection.close();
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
