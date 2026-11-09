import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config.js";

function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        // 1. Validamos que venga el header y que empiece con "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Acceso denegado: Token no proporcionado o formato inválido" });
        }

        // 2. Extraemos el token puro (lo que viene después del espacio)
        const token = authHeader.split(" ")[1];

        // 3. Verificamos la firma y fecha de expiración del token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Inyectamos los datos del usuario en la petición
        req.user = decoded;

        // 5. Dejamos que la petición continúe al siguiente paso
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

function verifyAdmin(req, res, next) {
    // Verificamos si existe el usuario decodificado y su rol es 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // Tiene permisos de administrador, continúa
    } else {
        return res.status(403).json({ error: "Acceso denegado: Se requieren permisos de administrador" });
    }
}

export default {
    verifyToken,
    verifyAdmin
};