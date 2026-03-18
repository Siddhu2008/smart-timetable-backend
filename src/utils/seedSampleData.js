import dotenv from "dotenv";
import mongoose from "mongoose";
import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import Room from "../models/Room.js";
import Lab from "../models/Lab.js";
import Subject from "../models/Subject.js";

dotenv.config();

const ensureDoc = async (Model, query, data) => {
  const existing = await Model.findOne(query);
  if (existing) return existing;
  return Model.create(data);
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const teachers = [
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
    { name: "Dr. Rahul Bhat", department: "MECH", subjects: ["CAD Lab"] },
    { name: "Dr. Ritu Mishra", department: "CIVIL", subjects: ["Structural Analysis"] },
    { name: "Mr. Ajay Patil", department: "CIVIL", subjects: ["Geotechnical Engineering", "Materials Lab"] },
    { name: "Ms. Sneha Kulkarni", department: "CIVIL", subjects: ["Surveying"] }
  ];

  const teacherDocs = {};
  for (const teacher of teachers) {
    const doc = await ensureDoc(Teacher, { name: teacher.name }, teacher);
    teacherDocs[teacher.name] = doc;
  }

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
    ],
    CIVIL: [
      { name: "Structural Analysis", type: "theory", hours: 4, teacher: "Dr. Ritu Mishra" },
      { name: "Geotechnical Engineering", type: "theory", hours: 4, teacher: "Mr. Ajay Patil" },
      { name: "Surveying", type: "theory", hours: 4, teacher: "Ms. Sneha Kulkarni" },
      { name: "Materials Lab", type: "practical", hours: 4, teacher: "Mr. Ajay Patil" }
    ]
  };

  const classData = [
    { className: "CSE-A", department: "CSE", studentCount: 60 },
    { className: "CSE-B", department: "CSE", studentCount: 55 },
    { className: "CSE-C", department: "CSE", studentCount: 50 },
    { className: "ECE-A", department: "ECE", studentCount: 60 },
    { className: "ECE-B", department: "ECE", studentCount: 55 },
    { className: "ECE-C", department: "ECE", studentCount: 50 },
    { className: "MECH-A", department: "MECH", studentCount: 60 },
    { className: "MECH-B", department: "MECH", studentCount: 55 },
    { className: "CIVIL-A", department: "CIVIL", studentCount: 60 },
    { className: "CIVIL-B", department: "CIVIL", studentCount: 55 }
  ];

  const classDocs = {};
  for (const item of classData) {
    const subjects = subjectTemplates[item.department].map((s) => s.name);
    const doc = await ensureDoc(
      ClassModel,
      { className: item.className, department: item.department },
      { ...item, subjects }
    );
    await ClassModel.updateOne({ _id: doc._id }, { $set: { subjects } });
    classDocs[item.className] = doc;
  }

  const rooms = [
    ...Array.from({ length: 12 }).map((_, idx) => ({
      roomName: `LH-${101 + idx}`,
      capacity: 60,
      type: "lecture hall"
    })),
    { roomName: "AUD-1", capacity: 300, type: "auditorium" }
  ];

  for (const room of rooms) {
    await ensureDoc(Room, { roomName: room.roomName }, room);
  }

  const labs = [
    { labName: "CSE Lab 1", labType: "Programming", capacity: 15, equipment: ["PCs", "IDE", "Projector"] },
    { labName: "CSE Lab 2", labType: "Database", capacity: 15, equipment: ["Servers", "SQL Tools"] },
    { labName: "CSE Lab 3", labType: "Networks", capacity: 15, equipment: ["Routers", "Switches"] },
    { labName: "CSE Lab 4", labType: "AI", capacity: 15, equipment: ["GPU Workstations"] },
    { labName: "ECE Lab 1", labType: "Analog", capacity: 15, equipment: ["Oscilloscopes", "Signal Generators"] },
    { labName: "ECE Lab 2", labType: "Digital", capacity: 15, equipment: ["FPGA Kits", "Logic Analyzers"] },
    { labName: "ECE Lab 3", labType: "Microcontroller", capacity: 15, equipment: ["Arduino Kits"] },
    { labName: "ECE Lab 4", labType: "Communication", capacity: 15, equipment: ["RF Trainers"] },
    { labName: "MECH Lab 1", labType: "Thermal", capacity: 15, equipment: ["Boiler Units", "Calorimeter"] },
    { labName: "MECH Lab 2", labType: "Fluids", capacity: 15, equipment: ["Flow Bench"] },
    { labName: "MECH Lab 3", labType: "Manufacturing", capacity: 15, equipment: ["Lathe", "CNC Trainer"] },
    { labName: "CIVIL Lab 1", labType: "Survey", capacity: 15, equipment: ["Total Station", "Auto Level"] },
    { labName: "CIVIL Lab 2", labType: "Materials", capacity: 15, equipment: ["Compression Tester"] },
    { labName: "Language Lab", labType: "Language", capacity: 15, equipment: ["Headsets", "Language Software"] },
    { labName: "Innovation Lab", labType: "Prototype", capacity: 15, equipment: ["3D Printer", "Electronics Kits"] }
  ];

  for (const lab of labs) {
    await ensureDoc(Lab, { labName: lab.labName }, lab);
  }

  for (const [dept, templates] of Object.entries(subjectTemplates)) {
    const deptClasses = classData.filter((c) => c.department === dept);
    for (const cls of deptClasses) {
      const classDoc = classDocs[cls.className];
      for (const subject of templates) {
        const teacherDoc = teacherDocs[subject.teacher];
        if (!teacherDoc) {
          console.warn(`Missing teacher for ${subject.name}`);
          continue;
        }
        const existing = await Subject.findOne({
          subjectName: subject.name,
          class: classDoc._id
        });
        if (!existing) {
          await Subject.create({
            subjectName: subject.name,
            class: classDoc._id,
            teacher: teacherDoc._id,
            hoursPerWeek: subject.hours,
            type: subject.type
          });
        }
      }
    }
  }

  console.log("Sample data seeded successfully.");
  await mongoose.connection.close();
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
