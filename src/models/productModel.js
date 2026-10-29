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
            min: [0, "Individual stock cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Individual stock must be an integer"
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
            required: [true, "Category ID is required"]
        },
        sku: {
            type: String,
            required: [true, "Product SKU is required"],
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Product price cannot be negative"]
        },
        slug: {
            type: String,
            required: [true, "Product slug is required"],
            unique: true,
            trim: true,
            lowercase: true
        },
        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            default: 0,
            min: [0, "Product stock cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Product stock must be an integer"
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
