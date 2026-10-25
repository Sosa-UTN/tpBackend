//Crea la aplicación de Express, le agrega los middlewares (como entender JSON o CORS) y le conecta las rutas. No prende el servidor (no hace listen)

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

export default app;