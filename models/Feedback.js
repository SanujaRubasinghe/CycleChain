import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  userId: { type: String, required: true }, // To identify who created the feedback
  isAdmin: { type: Boolean, default: false } // To distinguish admin feedback
}, { timestamps: true });

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
