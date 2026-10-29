import mongoose from "mongoose";
import { MONGO_URI } from "../utils/config.js";

// Función asíncrona para conectar a MongoDB
async function conectarDB() {
    try {
        if (!MONGO_URI) {
            throw new Error("No se definió la variable MONGO_URI en el entorno (.env)");
        }
        await mongoose.connect(MONGO_URI);
        console.log('Base de datos conectada');
    } catch (error) {
        console.log(`Error al conectar a la base de datos: ${error.message || error}`);
        process.exit(1); // Si falla la conexión crítica, termina el proceso
    }
}

export default conectarDB;
