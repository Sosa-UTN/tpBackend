import { Router } from "express";
import userController from "../controllers/userController.js";
import auth from "../middleware/verifyToken.js";


const router = Router();

// Autenticación (Públicas)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Administración de usuarios (CRUD)
router.get('/', auth.verifyToken, auth.verifyAdmin, userController.getAllUsers);
router.get('/:id', auth.verifyToken, auth.verifyAdmin, userController.getUser);
router.put('/:id', auth.verifyToken, auth.verifyAdmin, userController.updateUser);
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, userController.deleteUser);

export default router;