import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    slots: [{ type: String }]
  },
  { _id: false }
);

const labSchema = new mongoose.Schema(
  {
    labName: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true },
    labType: { type: String, required: true, trim: true },
    equipment: [{ type: String, trim: true }],
    availability: [availabilitySchema]
  },
  { timestamps: true }
);

const Lab = mongoose.model("Lab", labSchema);
export default Lab;
