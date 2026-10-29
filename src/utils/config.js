import dotenv from 'dotenv';

// Carga las variables de entorno sin imprimir alertas en cada arranque
dotenv.config({ quiet: true });

// Puerto del servidor con valor por defecto
export const PORT = process.env.PORT || 3000;

// URL de conexión a MongoDB Atlas
export const MONGO_URI = process.env.MONGO_URI;

// Clave secreta para firmar y verificar tokens JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_dev_key_12345';

// Estrategia de almacenamiento ('local' o 'supabase')
export const STORAGE = process.env.STORAGE || 'local';

// Carpeta de almacenamiento de imágenes
export const CARPETA_IMAGENES = process.env.CARPETA_IMAGENES || 'uploads';

export default {
    PORT,
    MONGO_URI,
    JWT_SECRET,
    STORAGE,
    CARPETA_IMAGENES
};
