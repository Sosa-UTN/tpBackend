import categoryService from "../services/categoryService.js";

async function createCategory(req, res) {
    try {
        const categoryData = req.body
        const newCategory = await categoryService.createCategory(categoryData)
        return res.status(201).json(newCategory)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}

async function getAllCategories(req, res) {
    try {
        const allCategories = await categoryService.getAllCategories()
        return res.status(200).json(allCategories)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

async function getCategory(req, res) {
    try {
        const categoryId = req.params.id; // Lo sacamos de la URL
        const category = await categoryService.getCategory(categoryId)
        if (!category) {
            return res.status(404).json({ error: "Esta Categoría no existe" })
        }
        return res.status(200).json(category)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

async function updateCategory(req, res) {
    try {
        const categoryId = req.params.id; // Lo sacamos de la URL
        const categoryData = req.body;     // Lo sacamos del cuerpo
        const updatedCategory = await categoryService.updateCategory(categoryId, categoryData)
        if (!updatedCategory) {
            return res.status(404).json({ error: "Esta Categoría no existe" })
        }
        return res.status(200).json(updatedCategory)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

async function deleteCategory(req, res) {
    try {
        const categoryId = req.params.id; // Lo sacamos de la URL
        const deletedCategory = await categoryService.deleteCategory(categoryId)
        if (!deletedCategory) {
            return res.status(404).json({ error: "Esta Categoría no existe" })
        }
        return res.status(200).json(deletedCategory)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

export default {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
}