import mongoose from "mongoose";

//Funcion asyncrona para conectar a mongoDB
async function conectarDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI); //se conecta con el Mongo URI del .env
        console.log('Base de datos conectada');
    } catch (error) {
        console.log(`Error al conectar a la base de datos: ${error}`);
        process.exit(1); // si falla la conexion, termina el proceso con error
    }
}

export default conectarDB;