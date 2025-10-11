import mongoose, { Schema, models } from "mongoose";

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, default: 1, min: 1 },
  priceSnapshot: { type: Number, required: true },
});

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true, unique: true },
    items: [CartItemSchema],
    total: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

CartSchema.methods.recalc = function () {
  this.total = this.items.reduce((sum, item) => sum + item.priceSnapshot * item.qty, 0);
};

export default models.Cart || mongoose.model("Cart", CartSchema);
