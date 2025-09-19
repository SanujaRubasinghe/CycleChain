// client/models/Cart.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, default: 1, min: 1 },
    priceSnapshot: { type: Number, required: true }, // store price at time of add
  },
  { _id: true, timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true },
    items: [CartItemSchema],
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.methods.recalc = function () {
  this.total = this.items.reduce((s, i) => s + (i.priceSnapshot * i.qty), 0);
};

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
