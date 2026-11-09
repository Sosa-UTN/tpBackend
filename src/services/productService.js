import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js"


async function createProduct(productData) {
    const category = await Category.findById(productData.categoryId)
    // valido que exista la categoria
    if (!category) {
        throw new Error("Categoría no encontrada");
    }
    // si existen variaciones calculo el stock total sumando el stock de cada variante
    if (productData.variants && productData.variants.length > 0) {
        productData.stock = productData.variants.reduce(
            (total, variant) => total + (variant.individualStock || 0),
            0
        );
    }
    const newProduct = new Product(productData);
    await newProduct.save();
    await newProduct.populate('categoryId');
    return newProduct;
}

async function getAllProducts() {
    return await Product.find().populate('categoryId').lean(); //.populate('categoryId') es para que se agregue la categoria
}

async function getProduct(productId) {
    return await Product.findById(productId).populate('categoryId').lean();
}

async function updateProduct(productId, productData) {
    // valido que exista la categoria
    if (productData.categoryId) {
        const category = await Category.findById(productData.categoryId);
        if (!category) {
            throw new Error("Categoría no encontrada");
        }
    }
    // si hay variantes calculo el stock total sumando el stock de cada variante
    if (productData.variants && productData.variants.length > 0) {
        productData.stock = productData.variants.reduce(
            (total, variant) => total + (variant.individualStock || 0),
            0
        );
    }
    return await Product.findByIdAndUpdate(productId, productData, { returnDocument: 'after', runValidators: true }).populate('categoryId').lean();
}

async function deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId).lean();
}

export default {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
}