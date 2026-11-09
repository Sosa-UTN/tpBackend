import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config.js";



async function registerUser(userData) {
    //valido que no exista un usuario con ese mail
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error("El email ya se encuentra registrado");
    }

    const newUser = new User(userData);
    await newUser.save();
    newUser.password = undefined;
    return newUser;
}

async function loginUser(email, password) {
    //traigo el user (con la contraseña)
    const user = await User.findOne({ email }).select("+password");
    //valido que exista el usuario
    if (!user) {
        throw new Error("Credenciales inválidas")
    }
    // comparo la contraseña dada con la real
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Credenciales inválidas")
    }
    //creo el token
    const token = jwt.sign(
        // 1. EL PAYLOAD (La información visible dentro del token)
        { id: user._id, role: user.role },
        // 2. LA CLAVE SECRETA (La firma del servidor)
        JWT_SECRET,
        // 3. LAS OPCIONES (El vencimiento)
        { expiresIn: "1d" }
    );

    //borro la contraseña para no devolverla
    user.password = undefined;
    //devuelvo el user y el token
    return { user, token };
}

async function getAllUsers() {
    return await User.find().lean();
}

async function getUser(userId) {
    return await User.findById(userId).lean();
}

async function updateUser(userId, userData) {
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    }
    return await User.findByIdAndUpdate(userId, userData, { new: true, runValidators: true }).lean();
}

async function deleteUser(userId) {
    return await User.findByIdAndDelete(userId).lean();
}

export default {
    registerUser,
    loginUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}