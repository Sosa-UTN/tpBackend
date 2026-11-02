import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre del usuario es obligatorio"],
            trim: true
        },
        email: {
            type: ?,
            required: [true, "El email del usuario es obligatorio"],
            trim: true
        },
        password: {
            type: ?,
            required: [true, "La contraseña del usuario es obligatorio"],
            trim: true
        },
        phoneNumber: {
            type: Number,
            required: [true, "El telefono del usuario es obligatorio"],
        },
        adress: {
            type: ?,
            required: [true, "La dirección del usuario es obligatorio"],
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: [true, "El ID del rol es obligatorio"]
        }

    },
    { timestamps: true }
);

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            [true, "El nombre del usuario es obligatorio"],
        }
    }
)

export default mongoose.model("User", userSchema);