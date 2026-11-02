import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre del usuario es obligatorio"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "El email del usuario es obligatorio"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "La contraseña del usuario es obligatorio"],
            select: false,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        postalCode: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'client'],
                message: '{VALUE} no es un rol válido'
            },
            default: 'client'
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
