import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: [{ type: String }],
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cart: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
            quantity: { type: Number, default: 1 }
        }
    ]

}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
