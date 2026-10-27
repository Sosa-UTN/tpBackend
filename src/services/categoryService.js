import Category from "../models/categoryModel.js";

async function createCategory(categoryData) {
    const newCategory = new Category(categoryData);
    await newCategory.save();
    return newCategory;
}

async function getAllCategories() {
    return await Category.find().lean();
}

async function getCategory(id) {
    return await Category.findById(id).lean();
}

async function updateCategory(id, categoryData) {
    return await Category.findByIdAndUpdate(id, categoryData, { new: true }).lean();
}

async function deleteCategory(id) {
    return await Category.findByIdAndDelete(id).lean();
}


export default {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
}
