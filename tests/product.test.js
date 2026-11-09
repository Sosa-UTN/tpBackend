import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { MONGO_URI, JWT_SECRET } from "../src/utils/config.js";
import Category from "../src/models/categoryModel.js";
import Product from "../src/models/productModel.js";

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Pruebas del Módulo de Productos (/api/products) con Autorización", () => {
    let testCategory = null;
    let createdProductId = "";
    const uniqueSuffix = Date.now();

    // Generamos tokens válidos para pruebas usando la clave secreta
    const adminToken = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), role: "admin" },
        JWT_SECRET || "secreto_default"
    );

    const clientToken = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), role: "client" },
        JWT_SECRET || "secreto_default"
    );

    // Antes de probar productos, creamos una categoría real para poder asociarla
    beforeAll(async () => {
        testCategory = await Category.create({
            name: "Categoría para Test Productos",
            description: "Categoría auxiliar para pruebas automáticas",
            slug: `aux-category-prod-${uniqueSuffix}`
        });
    });

    // Al finalizar todas las pruebas, limpiamos los datos de prueba
    afterAll(async () => {
        if (testCategory) {
            await Category.findByIdAndDelete(testCategory._id);
        }
        await Product.deleteMany({ slug: { $regex: /^prod-test-|^hilo-algodon-test-/ } });
    });

    // --- PRUEBAS DE SEGURIDAD (AUTORIZACIÓN) ---

    test("1. POST /api/products - Debería rechazar (401) si no se envía Token", async () => {
        const response = await request(app)
            .post("/api/products")
            .send({
                categoryId: testCategory._id,
                sku: `SKU-NOAUTH-${uniqueSuffix}`,
                name: "Producto Sin Token",
                description: "No debería crearse",
                price: 1500,
                slug: `prod-test-noauth-${uniqueSuffix}`,
                variants: []
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("2. POST /api/products - Debería rechazar (403) si el usuario NO es admin", async () => {
        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${clientToken}`)
            .send({
                categoryId: testCategory._id,
                sku: `SKU-CLIENT-${uniqueSuffix}`,
                name: "Producto Client",
                description: "No debería crearse",
                price: 1500,
                slug: `prod-test-client-${uniqueSuffix}`,
                variants: []
            });

        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("error");
    });

    // --- PRUEBAS DE REGLAS DE NEGOCIO Y CRUD CON TOKEN DE ADMIN ---

    test("3. POST /api/products - Debería fallar (400) si la categoría asociada no existe", async () => {
        const fakeCategoryId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categoryId: fakeCategoryId,
                sku: `SKU-FAIL-${uniqueSuffix}`,
                name: "Producto Inválido",
                description: "No debería crearse",
                price: 1500,
                slug: `prod-test-fail-${uniqueSuffix}`,
                variants: []
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("4. POST /api/products - Debería crear un producto y calcular stock con variantes (Admin)", async () => {
        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
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

    test("5. GET /api/products - Debería listar todos los productos (Pública, sin token)", async () => {
        const response = await request(app).get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        // Verificamos que los productos vengan con categoría poblada
        const found = response.body.find(p => p._id === createdProductId);
        expect(found).toBeDefined();
        expect(found.categoryId).toHaveProperty("name");
    });

    test("6. GET /api/products/:id - Debería obtener un producto por su ID (Pública, sin token)", async () => {
        const response = await request(app).get(`/api/products/${createdProductId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(createdProductId);
        expect(response.body.name).toBe("Hilo de Algodón Test");
        expect(response.body.categoryId).toHaveProperty("_id", testCategory._id.toString());
    });

    test("7. GET /api/products/:id - Debería responder 404 si el ID no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/api/products/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("8. PUT /api/products/:id - Debería rechazar (401) la actualización sin token", async () => {
        const response = await request(app)
            .put(`/api/products/${createdProductId}`)
            .send({ price: 1500 });

        expect(response.statusCode).toBe(401);
    });

    test("9. PUT /api/products/:id - Debería actualizar y recalcular stock si cambian variantes (Admin)", async () => {
        const response = await request(app)
            .put(`/api/products/${createdProductId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Hilo de Algodón Test Actualizado",
                price: 1350,
                variants: [
                    { sku: `VAR-1-${uniqueSuffix}`, color: "Rojo", individualStock: 50 },
                    { sku: `VAR-2-${uniqueSuffix}`, color: "Azul", individualStock: 50 }
                ]
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Hilo de Algodón Test Actualizado");
        expect(response.body.price).toBe(1350);
        // Verificamos que recalculó el stock a 50 + 50 = 100
        expect(response.body.stock).toBe(100);
    });

    test("10. DELETE /api/products/:id - Debería rechazar (401) la eliminación sin token", async () => {
        const response = await request(app).delete(`/api/products/${createdProductId}`);

        expect(response.statusCode).toBe(401);
    });

    test("11. DELETE /api/products/:id - Debería eliminar el producto con token de Admin", async () => {
        const response = await request(app)
            .delete(`/api/products/${createdProductId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        // Verificamos que ya no exista
        const check = await request(app).get(`/api/products/${createdProductId}`);
        expect(check.statusCode).toBe(404);
    });
});
