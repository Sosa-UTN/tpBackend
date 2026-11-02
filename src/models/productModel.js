import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            trim: true
        },
        color: {
            type: String,
            trim: true
        },
        individualStock: {
            type: Number,
            default: 0,
            min: [0, "El stock individual no puede ser negativo"],
            validate: {
                validator: Number.isInteger,
                message: "El stock individual debe ser un número entero"
            }
        }
    },
    { _id: false }
);

const ProductSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "El ID de categoría es obligatorio"]
        },
        sku: {
            type: String,
            required: [true, "El SKU del producto es obligatorio"],
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, "El nombre del producto es obligatorio"],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, "El precio del producto es obligatorio"],
            min: [0, "El precio del producto no puede ser negativo"]
        },
        slug: {
            type: String,
            required: [true, "El slug del producto es obligatorio"],
            unique: true,
            trim: true,
            lowercase: true
        },
        stock: {
            type: Number,
            required: [true, "El stock del producto es obligatorio"],
            default: 0,
            min: [0, "El stock del producto no puede ser negativo"],
            validate: {
                validator: Number.isInteger,
                message: "El stock del producto debe ser un número entero"
            }
        },
        variants: [variantSchema],
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
