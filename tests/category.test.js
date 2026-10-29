import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { MONGO_URI } from "../src/utils/config.js";

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Pruebas del Módulo de Categorías (/api/categories)", () => {
    let createdCategoryId = "";

    test("1. POST /api/categories - Debería crear una categoría nueva", async () => {
        const response = await request(app)
            .post("/api/categories")
            .send({
                name: "Hilos y Lanas Test",
                description: "Artículos de mercería para costura",
                slug: "hilos-y-lanas-test"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe("Hilos y Lanas Test");
        expect(response.body.slug).toBe("hilos-y-lanas-test");

        // Guardamos el ID generado para usarlo en los siguientes tests
        createdCategoryId = response.body._id;
    });

    test("2. GET /api/categories - Debería listar todas las categorías", async () => {
        const response = await request(app).get("/api/categories");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("3. GET /api/categories/:id - Debería obtener la categoría por su ID", async () => {
        const response = await request(app).get(`/api/categories/${createdCategoryId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(createdCategoryId);
        expect(response.body.name).toBe("Hilos y Lanas Test");
    });

    test("4. GET /api/categories/:id - Debería responder 404 si el ID no existe", async () => {
        // Generamos un ObjectId falso de 24 caracteres
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).get(`/api/categories/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("5. PUT /api/categories/:id - Debería actualizar la categoría", async () => {
        const response = await request(app)
            .put(`/api/categories/${createdCategoryId}`)
            .send({
                name: "Hilos y Lanas Premium",
                description: "Descripción actualizada",
                slug: "hilos-premium"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Hilos y Lanas Premium");
        expect(response.body.description).toBe("Descripción actualizada");
    });

    test("6. DELETE /api/categories/:id - Debería eliminar la categoría", async () => {
        const response = await request(app).delete(`/api/categories/${createdCategoryId}`);

        expect(response.statusCode).toBe(200);

        // Verificamos que ya no exista al buscarla
        const getCheck = await request(app).get(`/api/categories/${createdCategoryId}`);
        expect(getCheck.statusCode).toBe(404);
    });
});
