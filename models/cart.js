import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
            quantity: { type: Number, default: 1 }
        }
    ]
});

export default mongoose.model("Cart", cartSchema);
