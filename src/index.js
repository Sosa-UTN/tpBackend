// Punto de entrada de la aplicación. Se encarga de arrancar el servidor y conectar a la base de datos.

import app from './app.js';
import conectarDB from './config/db.js';
import { PORT } from './utils/config.js';

// Conexión a la base de datos
conectarDB();

// Puesta en marcha del servidor
app.listen(PORT, () => console.log(`El servidor funciona en el puerto ${PORT}`));
