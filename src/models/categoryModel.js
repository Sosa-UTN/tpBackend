import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre de la categoría es obligatorio"],
            trim: true,
            unique: true
        },
        description: {
            type: String,
            required: [true, "La descripción de la categoría es obligatoria"],
            trim: true
        },
        slug: {
            type: String,
            required: [true, "El slug de la categoría es obligatorio"],
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
