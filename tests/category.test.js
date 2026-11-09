import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { MONGO_URI, JWT_SECRET } from "../src/utils/config.js";
import Category from "../src/models/categoryModel.js";

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
    // Limpieza de datos creados en el test
    await Category.deleteMany({ slug: { $regex: /^cat-test-(noauth|client|hilos)/ } });
    await mongoose.connection.close();
});

describe("Pruebas del Módulo de Categorías (/api/categories) con Autorización", () => {
    let createdCategoryId = "";
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

    // --- PRUEBAS DE SEGURIDAD (AUTORIZACIÓN) ---

    test("1. POST /api/categories - Debería rechazar (401) si no se envía Token", async () => {
        const response = await request(app)
            .post("/api/categories")
            .send({
                name: "Categoría Sin Auth",
                description: "No debería crearse",
                slug: `cat-test-noauth-${uniqueSuffix}`
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("2. POST /api/categories - Debería rechazar (403) si el usuario NO es admin", async () => {
        const response = await request(app)
            .post("/api/categories")
            .set("Authorization", `Bearer ${clientToken}`)
            .send({
                name: "Categoría Client",
                description: "No debería crearse",
                slug: `cat-test-client-${uniqueSuffix}`
            });

        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("error");
    });

    // --- PRUEBAS CRUD CON TOKEN DE ADMIN ---

    test("3. POST /api/categories - Debería crear una categoría con token de Admin", async () => {
        const response = await request(app)
            .post("/api/categories")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Hilos y Lanas Test",
                description: "Artículos de mercería para costura",
                slug: `cat-test-hilos-${uniqueSuffix}`
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe("Hilos y Lanas Test");
        expect(response.body.slug).toBe(`cat-test-hilos-${uniqueSuffix}`);

        createdCategoryId = response.body._id;
    });

    test("4. GET /api/categories - Debería listar todas las categorías (Pública, sin token)", async () => {
        const response = await request(app).get("/api/categories");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("5. GET /api/categories/:id - Debería obtener la categoría por su ID (Pública, sin token)", async () => {
        const response = await request(app).get(`/api/categories/${createdCategoryId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(createdCategoryId);
        expect(response.body.name).toBe("Hilos y Lanas Test");
    });

    test("6. GET /api/categories/:id - Debería responder 404 si el ID no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/api/categories/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("7. PUT /api/categories/:id - Debería actualizar la categoría con token de Admin", async () => {
        const response = await request(app)
            .put(`/api/categories/${createdCategoryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Hilos y Lanas Premium",
                description: "Descripción actualizada",
                slug: `cat-test-premium-${uniqueSuffix}`
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Hilos y Lanas Premium");
        expect(response.body.description).toBe("Descripción actualizada");
    });

    test("8. DELETE /api/categories/:id - Debería rechazar (401) la eliminación sin token", async () => {
        const response = await request(app).delete(`/api/categories/${createdCategoryId}`);

        expect(response.statusCode).toBe(401);
    });

    test("9. DELETE /api/categories/:id - Debería eliminar la categoría con token de Admin", async () => {
        const response = await request(app)
            .delete(`/api/categories/${createdCategoryId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        // Verificamos que ya no exista
        const getCheck = await request(app).get(`/api/categories/${createdCategoryId}`);
        expect(getCheck.statusCode).toBe(404);
    });
});
