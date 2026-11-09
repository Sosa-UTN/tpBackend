//Crea la aplicación de Express, le agrega los middlewares (como entender JSON o CORS) y le conecta las rutas. No prende el servidor (no hace listen)

import express from 'express';
import cors from 'cors';

import categoryRoute from './routes/categoryRoute.js';
import productRoute from './routes/productRoute.js';
import userRoute from './routes/userRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoute)
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);

// Ruta de bienvenida para saber que la API está funcionando
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API E-commerce - TP Final Backend',
        endpoints: [
            '/api/categories',
            '/api/products',
            '/api/users'
        ]
    });
});

// Manejador 404: cualquier ruta que no exista responde en formato JSON
app.use((req, res) => {
    res.status(404).json({ error: 'Esa dirección no existe' });
});

export default app;