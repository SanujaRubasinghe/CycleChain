import mongoose, { Schema, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, default: 1, min: 1 },
    // snapshot to keep price stable even if product changes later
    priceSnapshot: { type: Number, required: true },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default models.Cart || mongoose.model("Cart", CartSchema);
