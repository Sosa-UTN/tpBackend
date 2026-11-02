import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { MONGO_URI } from "../src/utils/config.js";
import Category from "../src/models/categoryModel.js";

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Pruebas del Módulo de Productos (/api/products)", () => {
    let testCategory = null;
    let createdProductId = "";

    // Antes de probar productos, creamos una categoría real para poder asociarla
    beforeAll(async () => {
        testCategory = await Category.create({
            name: "Categoría para Test Productos",
            description: "Categoría auxiliar para pruebas automáticas",
            slug: `cat-test-${Date.now()}`
        });
    });

    // Al finalizar todas las pruebas, limpiamos la categoría creada
    afterAll(async () => {
        if (testCategory) {
            await Category.findByIdAndDelete(testCategory._id);
        }
    });

    test("1. POST /api/products - Debería fallar (400) si la categoría no existe", async () => {
        const fakeCategoryId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post("/api/products")
            .send({
                categoryId: fakeCategoryId,
                sku: `SKU-FAIL-${Date.now()}`,
                name: "Producto Inválido",
                description: "No debería crearse",
                price: 1500,
                slug: `prod-fail-${Date.now()}`,
                variants: []
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("2. POST /api/products - Debería crear un producto y calcular stock con variantes", async () => {
        const uniqueSuffix = Date.now();

        const response = await request(app)
            .post("/api/products")
            .send({
                categoryId: testCategory._id,
                sku: `SKU-PROD-${uniqueSuffix}`,
                name: "Hilo de Algodón Test",
                description: "Hilo 100% algodón mercerizado",
                price: 1200,
                slug: `hilo-algodon-test-${uniqueSuffix}`,
                variants: [
                    { sku: `VAR-BLA-${uniqueSuffix}`, color: "Blanco", individualStock: 15 },
                    { sku: `VAR-NEG-${uniqueSuffix}`, color: "Negro", individualStock: 25 }
                ]
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe("Hilo de Algodón Test");

        // Verificamos que la lógica de reduce calculó 15 + 25 = 40 de stock total
        expect(response.body.stock).toBe(40);

        // Verificamos que categoryId vino poblado (.populate)
        expect(response.body.categoryId).toHaveProperty("name", testCategory.name);

        createdProductId = response.body._id;
    });

    test("3. GET /api/products - Debería listar todos los productos con su categoría", async () => {
        const response = await request(app).get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        // Verificamos que los productos vengan con categoría poblada
        const found = response.body.find(p => p._id === createdProductId);
        expect(found).toBeDefined();
        expect(found.categoryId).toHaveProperty("name");
    });

    test("4. GET /api/products/:id - Debería obtener un producto por su ID", async () => {
        const response = await request(app).get(`/api/products/${createdProductId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(createdProductId);
        expect(response.body.name).toBe("Hilo de Algodón Test");
        expect(response.body.categoryId).toHaveProperty("_id", testCategory._id.toString());
    });

    test("5. GET /api/products/:id - Debería responder 404 si el ID no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/api/products/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("6. PUT /api/products/:id - Debería actualizar datos y recalcular stock si cambian variantes", async () => {
        const response = await request(app)
            .put(`/api/products/${createdProductId}`)
            .send({
                name: "Hilo de Algodón Test Actualizado",
                price: 1350,
                variants: [
                    { sku: "VAR-1", color: "Rojo", individualStock: 50 },
                    { sku: "VAR-2", color: "Azul", individualStock: 50 }
                ]
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Hilo de Algodón Test Actualizado");
        expect(response.body.price).toBe(1350);
        // Verificamos que recalculó el stock a 50 + 50 = 100
        expect(response.body.stock).toBe(100);
    });

    test("7. DELETE /api/products/:id - Debería eliminar el producto", async () => {
        const response = await request(app).delete(`/api/products/${createdProductId}`);

        expect(response.statusCode).toBe(200);

        // Verificamos que ya no exista
        const check = await request(app).get(`/api/products/${createdProductId}`);
        expect(check.statusCode).toBe(404);
    });
});
