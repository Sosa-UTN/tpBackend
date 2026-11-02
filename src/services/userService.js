import User from "../models/userModel";

async function createUser(userData) {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
}

async function getAllUsers() {
    return await User.find().lean();
}

async function getUser(userId) {
    return await User.findById(userId).lean();
}

async function updateUser(userId, userData) {
    return await User.findByIdAndUpdate(userId, userData).lean();
}

async function deleteUser(userId) {
    return await User.findByIdAndDelete(userId).lean();
}

export default {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}