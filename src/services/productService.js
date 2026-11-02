import Product from "../models/productModel.js";

async function createProduct(productData) {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
}

async function getAllProducts() {
    return await Product.find().populate('categoryId').lean(); //.populate('categoryId') es para que se agregue la categoria
}

async function getProduct(productId) {
    return await Product.findById(productId).populate('categoryId').lean();
}

async function updateProduct(productId) {
    return
}