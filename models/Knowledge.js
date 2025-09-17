import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true, index: "vector_index" },
});

export default mongoose.models.Knowledge ||
  mongoose.model("Knowledge", knowledgeSchema)
