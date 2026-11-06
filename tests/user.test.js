import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { MONGO_URI, JWT_SECRET } from "../src/utils/config.js";
import User from "../src/models/userModel.js";

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
    // Limpieza de los usuarios creados durante la prueba
    await User.deleteMany({ email: { $regex: /@usertest\.com$/ } });
    await mongoose.connection.close();
});

describe("Pruebas del Módulo de Usuarios y Autenticación (/api/users)", () => {
    const uniqueSuffix = Date.now();
    let createdUserId = "";

    // Tokens simulados para probar la seguridad en las rutas
    const adminToken = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), role: "admin" },
        JWT_SECRET || "secreto_default"
    );

    const clientToken = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), role: "client" },
        JWT_SECRET || "secreto_default"
    );

    const testUser = {
        name: "Usuario Test",
        email: `usuario_${uniqueSuffix}@usertest.com`,
        password: "Password123!",
        phoneNumber: "1122334455",
        address: "Calle Falsa 123",
        postalCode: "1000"
    };

    // --- 1. REGISTRO (POST /register) ---

    test("1. POST /api/users/register - Debería registrar un nuevo usuario (201)", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send(testUser);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.email).toBe(testUser.email.toLowerCase());
        expect(response.body.role).toBe("client");
        // Verificamos que la contraseña no viaje en la respuesta
        expect(response.body.password).toBeUndefined();

        createdUserId = response.body._id;
    });

    test("2. POST /api/users/register - Debería fallar (400) si el email ya existe", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send(testUser);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    // --- 2. LOGIN (POST /login) ---

    test("3. POST /api/users/login - Debería autenticar al usuario y devolver un JWT (200)", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe(testUser.email.toLowerCase());
        expect(response.body.user.password).toBeUndefined();
    });

    test("4. POST /api/users/login - Debería rechazar (401) si la contraseña es incorrecta", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: testUser.email,
                password: "PasswordIncorrecta"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("5. POST /api/users/login - Debería rechazar (401) si el usuario no existe", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: `inexistente_${Date.now()}@usertest.com`,
                password: "CualquierPassword"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    // --- 3. RUTAS PROTEGIDAS DE ADMINISTRACIÓN (CRUD) ---

    test("6. GET /api/users - Debería rechazar (401) si no se envía Token", async () => {
        const response = await request(app).get("/api/users");

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("error");
    });

    test("7. GET /api/users - Debería rechazar (403) si el usuario NO es admin", async () => {
        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${clientToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("error");
    });

    test("8. GET /api/users - Debería listar usuarios con token de Admin (200)", async () => {
        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("9. GET /api/users/:id - Debería obtener un usuario por ID con token de Admin", async () => {
        const response = await request(app)
            .get(`/api/users/${createdUserId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(createdUserId);
        expect(response.body.email).toBe(testUser.email.toLowerCase());
    });

    test("10. GET /api/users/:id - Debería responder 404 si el ID no existe (con Admin)", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app)
            .get(`/api/users/${nonExistentId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("11. PUT /api/users/:id - Debería actualizar datos del usuario con token de Admin", async () => {
        const response = await request(app)
            .put(`/api/users/${createdUserId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Usuario Modificado",
                phoneNumber: "9988776655"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Usuario Modificado");
        expect(response.body.phoneNumber).toBe("9988776655");
    });

    test("12. DELETE /api/users/:id - Debería rechazar (401) la eliminación sin token", async () => {
        const response = await request(app).delete(`/api/users/${createdUserId}`);

        expect(response.statusCode).toBe(401);
    });

    test("13. DELETE /api/users/:id - Debería eliminar el usuario con token de Admin", async () => {
        const response = await request(app)
            .delete(`/api/users/${createdUserId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        // Verificamos que ya no exista
        const check = await request(app)
            .get(`/api/users/${createdUserId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(check.statusCode).toBe(404);
    });
});
