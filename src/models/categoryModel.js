import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Category description is required"],
            trim: true
        },
        slug: {
            type: String,
            required: [true, "Category slug is required"],
            trim: true,
            lowercase: true
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
