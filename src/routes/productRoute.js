import { Router } from "express";
import productController from "../controllers/productController.js"
import auth from "../middleware/verifyToken.js";


const router = Router();

// rutas publicas
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// rutas privadas (Admin)
router.post('/', auth.verifyToken, auth.verifyAdmin, productController.createProduct);
router.put('/:id', auth.verifyToken, auth.verifyAdmin, productController.updateProduct);
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, productController.deleteProduct);

export default router;