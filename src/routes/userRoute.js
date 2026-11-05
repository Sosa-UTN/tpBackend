import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

// Autenticación (Públicas)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Administración de usuarios (CRUD)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;