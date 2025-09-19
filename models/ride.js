// models/Ride.js
import mongoose, { Schema, models } from "mongoose";

const RideSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    bikeId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    distanceKm: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Ride || mongoose.model("Ride", RideSchema);
