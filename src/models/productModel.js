import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        variants: [
            {
                sku: { type: String, trim: true },
                color: { type: String, trim: true },
                individualStock: { type: Number, default: 0, min: 0 }
            }
        ],
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);