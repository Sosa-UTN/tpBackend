import userService from "../services/userService.js";

async function registerUser(req, res) {
    try {
        const userData = req.body;
        const newUser = await userService.registerUser(userData);
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const allUsers = await userService.getAllUsers();
        return res.status(200).json(allUsers);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function getUser(req, res) {
    try {
        const userId = req.params.id
        const user = await userService.getUser(userId)
        if (!user) {
            return res.status(404).json({ error: "Este usuario no existe." })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.params.id
        const userData = req.body
        const updatedUser = await userService.updateUser(userId, userData)
        if (!updatedUser) {
            return res.status(404).json({ error: "Este usuario no existe." })
        }
        return res.status(200).json(updatedUser)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.id
        const deletedUser = await userService.deleteUser(userId)
        if (!deletedUser) {
            return res.status(404).json({ error: "Este usuario no existe." })
        }
        return res.status(200).json(deletedUser)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

export default {
    registerUser,
    loginUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}