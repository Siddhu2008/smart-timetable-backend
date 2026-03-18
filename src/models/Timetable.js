import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["class", "teacher", "room", "lab"], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    schedule: { type: mongoose.Schema.Types.Mixed, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true }
  },
  { timestamps: true }
);

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
