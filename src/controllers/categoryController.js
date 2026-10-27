import categoryService from "../services/categoryService.js";

async function createCategory(req, res) {
    try {
        const categoryData = req.body
        const newCategory = await categoryService.createCategory(categoryData)
        res.status(201).json(newCategory)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}