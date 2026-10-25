// Punto de entrada de la aplicación. Se encarga de arrancar el servidor y conectar a la base de datos.

import 'dotenv/config'; //se lee del node_modules y busca el archivo .env en la raiz del proyecto
import app from './app.js'; //importa la aplicacion que creamos en app.js
import conectarDB from './config/db.js'; //importa la funcion de conexion a la base de datos

conectarDB();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`El servidor funciona en el puerto ${PORT}`));

