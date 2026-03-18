import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    studentCount: { type: Number, required: true },
    subjects: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

const ClassModel = mongoose.model("Class", classSchema);
export default ClassModel;
