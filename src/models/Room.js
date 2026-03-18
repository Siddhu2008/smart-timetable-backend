import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    slots: [{ type: String }]
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ["lecture hall", "seminar", "auditorium"], required: true },
    availability: [availabilitySchema]
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
