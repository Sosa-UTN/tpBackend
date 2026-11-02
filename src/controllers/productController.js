import ProductService from "../services/productService.js";

async function createProduct(req, res) {
    try {
        const productData = req.body;
        const newProduct = await ProductService.createProduct(productData);
        return res.status(201).json(newProduct);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const allProducts = await ProductService.getAllProducts();
        return res.status(200).json(allProducts);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function getProduct(req, res) {
    try {
        const productId = req.params.id;
        const product = await ProductService.getProduct(productId);
        if (!product) {
            return res.status(404).json({ error: "El producto buscado no existe" })
        }
        return res.status(200).json(product);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const productId = req.params.id;
        const productData = req.body;
        const updatedProduct = await ProductService.updateProduct(productId, productData);
        if (!updatedProduct) {
            return res.status(404).json({ error: "El producto buscado no existe" })
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const productId = req.params.id;
        const deletedProduct = await ProductService.deleteProduct(productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: "El producto buscado no existe" })
        }
        return res.status(200).json(deletedProduct);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export default {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
}