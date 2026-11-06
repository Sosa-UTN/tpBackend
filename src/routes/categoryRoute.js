import { Router } from "express";
import categoryController from "../controllers/categoryController.js";
import auth from "../middleware/verifyToken.js";

const router = Router();

// rutas publicas
router.get('/', categoryController.getAllCategories)
router.get('/:id', categoryController.getCategory)

// rutas privadas (Admin)
router.post('/', auth.verifyToken, auth.verifyAdmin, categoryController.createCategory)
router.put('/:id', auth.verifyToken, auth.verifyAdmin, categoryController.updateCategory)
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, categoryController.deleteCategory)

export default router;