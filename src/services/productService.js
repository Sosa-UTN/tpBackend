import Product from "models/productModel.js"

async function createProduct(productData) {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
}

async function getAllProducts() {
    return await Product.find().lean();
}