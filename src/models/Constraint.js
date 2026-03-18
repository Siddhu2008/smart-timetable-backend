import mongoose from "mongoose";

const constraintSchema = new mongoose.Schema(
  {
    maxLecturesPerDay: { type: Number, default: 4 },
    breakTime: { type: String, default: "Break" },
    workingDays: [{ type: String }],
    slotDuration: { type: Number, default: 60 },
    slotsPerDay: { type: Number, default: 8 },
    recessAfter: { type: Number, default: 4 },
    shortBreakAfter: { type: Number, default: 6 },
    practicalConsecutive: { type: Boolean, default: true },
    teacherRules: { type: mongoose.Schema.Types.Mixed },
    roomRules: { type: mongoose.Schema.Types.Mixed },
    labRules: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

const Constraint = mongoose.model("Constraint", constraintSchema);
export default Constraint;
