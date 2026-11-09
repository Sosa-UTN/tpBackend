# E-Commerce REST API - Backend TP Final

API REST profesional y robusta para la gestión de un e-commerce de indumentaria y catálogo de productos, desarrollada con **Node.js**, **Express**, **MongoDB Atlas** y **Mongoose**, implementando autenticación y autorización basada en roles (RBAC) con **JSON Web Tokens (JWT)** y encriptación de contraseñas con **Bcrypt**.

---

## 📋 Tabla de Contenidos
1. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
2. [Requisitos Previos e Instalación](#-requisitos-previos-e-instalación)
3. [Variables de Entorno](#-variables-de-entorno)
4. [Cómo Correr el Proyecto](#-cómo-correr-el-proyecto)
5. [Pruebas Automatizadas (Testing)](#-pruebas-automatizadas-testing)
6. [Cómo está armada la Base de Datos](#-cómo-está-armada-la-base-de-datos)
7. [Documentación de Endpoints](#-documentación-de-endpoints)
8. [Datos de Prueba Listos para Usar (Copy & Paste)](#-datos-de-prueba-listos-para-usar-copy--paste)

---

## 🏛 Arquitectura del Proyecto

El backend implementa una **arquitectura en capas** limpia y desacoplada, asegurando separación de responsabilidades y mantenibilidad:

```
src/
 ├── config/         # Conexión a MongoDB Atlas (db.js)
 ├── models/         # Esquemas de datos Mongoose (Category, Product, User)
 ├── services/       # Lógica de negocio pura (cálculo de stock, encriptación, validaciones)
 ├── controllers/    # Manejo de peticiones HTTP (req, res, códigos de estado)
 ├── routes/         # Enrutadores Express (públicos y protegidos)
 ├── middleware/     # Seguridad: verifyToken (JWT) y verifyAdmin (RBAC)
 ├── utils/          # Configuración centralizada de variables de entorno (config.js)
 ├── seed.js         # Script de sembrado de datos iniciales
 ├── app.js          # Configuración de Express, CORS y middlewares globales
 └── index.js        # Punto de entrada y encendido del servidor (listen)
tests/               # Batería de 33 tests automáticos de integración con Jest y Supertest
```

---

## ⚙ Requisitos Previos e Instalación

* **Node.js** v18 o superior instalado en el equipo.
* Cuenta en **MongoDB Atlas** (o instancia local de MongoDB).
* Gestor de paquetes **npm** (incluido con Node.js).

### Instalación de dependencias:
Abrir una terminal en la carpeta raíz del proyecto y ejecutar:
```bash
npm install
```

---

## 🔐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como plantilla el archivo `.env.example`:

```env
# Puerto del servidor
PORT=3000

# Cadena de conexión a MongoDB Atlas
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<basedatos>?retryWrites=true&w=majority

# Clave secreta para firmar tokens JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# Configuración de almacenamiento
STORAGE=local
CARPETA_IMAGENES=uploads
```

---

## 🚀 Cómo Correr el Proyecto

### 1. Sembrar la Base de Datos con Datos de Prueba (`Seed`)
Para poblar la base de datos limpia con categorías, productos con variantes y usuarios con contraseñas encriptadas:
```bash
npm run seed
```

### 2. Iniciar el Servidor en Desarrollo
Para levantar el servidor con recarga automática ante cambios (`node --watch`):
```bash
npm start
```
El servidor responderá en: `http://localhost:3000`

---

## 🧪 Pruebas Automatizadas (Testing)

El proyecto incluye **33 tests automáticos de integración** desarrollados con **Jest** y **Supertest**, cubriendo:
* Validación de esquemas y códigos de error (400, 401, 403, 404).
* Reglas de negocio: cálculo automático de stock por suma de variantes con `.reduce()`.
* Cruce de datos con `.populate()`.
* Seguridad: rechazo de accesos sin token (`401`) y con rol de cliente en rutas de administrador (`403`).
* Ciclo CRUD completo en todas las colecciones.

Para ejecutar los tests:
```bash
npm test
```

---

## 🗄 Cómo está armada la Base de Datos

La base de datos está implementada sobre **MongoDB Atlas** (NoSQL orientada a documentos). Aplica estrategias combinadas de **referenciación** y **datos embebidos**:

### 1. Colección `categories` (Categorías)
Entidad independiente y referenciada:
* `name`: String, obligatorio, único, trim.
* `description`: String, obligatorio.
* `slug`: String, obligatorio, único, minúsculas.
* `active`: Boolean (default `true`).
* `timestamps`: `createdAt` y `updatedAt` automáticos.

### 2. Colección `products` (Productos)
Combina referencia a categoría con subdocumentos de variantes embebidos:
* `name`: String, obligatorio.
* `sku`: String, obligatorio, único.
* `description`: String.
* `price`: Number, obligatorio, mínimo 0.
* `stock`: Number, calculado automáticamente o asignado (entero no negativo).
* `slug`: String, obligatorio, único.
* `categoryId`: `ObjectId` que referencia a la colección `categories` (cruzado mediante `.populate()`).
* `variants`: **Array de subdocumentos embebidos** (`{ _id: false }`):
  * `sku`: String (código único de la variante).
  * `color`: String (color / presentación).
  * `individualStock`: Number (stock de la variante).
* `active`: Boolean (default `true`).

> **Lógica de negocio aplicada:** Si el producto incluye variantes, el servicio calcula el stock total automáticamente sumando el stock individual de cada variante con `.reduce()`.

### 3. Colección `users` (Usuarios y Autenticación)
* `name`: String, obligatorio.
* `email`: String, obligatorio, único, minúsculas (evita duplicados por diferencias de mayúsculas).
* `password`: String, obligatorio, **oculto por defecto (`select: false`)**.
  * Se encripta con **Bcrypt** (10 rondas de salt) mediante un hook `pre('save')` automático y en updates con contraseña nueva.
* `role`: String con `enum: ['admin', 'client']` (default `'client'`).
* `phoneNumber`, `address`, `postalCode`: Strings opcionales de perfil y envío.

---

## 📡 Documentación de Endpoints

### Ruta Base y Bienvenida
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | 🌍 Público | Estado de la API y listado de endpoints disponibles |

---

### Autenticación y Usuarios (`/api/users`)
| Método | Endpoint | Acceso | Header Requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | 🌍 Público | Ninguno | Registra un nuevo usuario (`client`) con contraseña encriptada |
| `POST` | `/api/users/login` | 🌍 Público | Ninguno | Inicia sesión y devuelve el token JWT firmado |
| `GET` | `/api/users` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Lista todos los usuarios de la plataforma |
| `GET` | `/api/users/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Obtiene un usuario puntual por su ID |
| `PUT` | `/api/users/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Actualiza datos de un usuario (hashea contraseña si se envía) |
| `DELETE` | `/api/users/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Elimina un usuario por su ID |

---

### Categorías (`/api/categories`)
| Método | Endpoint | Acceso | Header Requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | 🌍 Público | Ninguno | Lista todas las categorías |
| `GET` | `/api/categories/:id` | 🌍 Público | Ninguno | Obtiene una categoría puntual por su ID |
| `POST` | `/api/categories` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Crea una nueva categoría |
| `PUT` | `/api/categories/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Actualiza una categoría existente |
| `DELETE` | `/api/categories/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Elimina una categoría por su ID |

---

### Productos (`/api/products`)
| Método | Endpoint | Acceso | Header Requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | 🌍 Público | Ninguno | Lista productos (incluye categoría poblada con `.populate`) |
| `GET` | `/api/products/:id` | 🌍 Público | Ninguno | Obtiene el detalle de un producto por su ID |
| `POST` | `/api/products` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Crea un producto (calcula stock con variantes y valida categoría) |
| `PUT` | `/api/products/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Actualiza producto y recalcula stock |
| `DELETE` | `/api/products/:id` | 🔒 Admin | `Authorization: Bearer <TOKEN>` | Elimina un producto por su ID |

---

## 📦 Datos de Prueba Listos para Usar (Copy & Paste)

### 1. Usuarios Preexistentes (Generados por `npm run seed`)
* 👑 **Administrador:**
  * **Email:** `admin@tiendaropa.com`
  * **Password:** `Admin123!`
* 🛍️ **Cliente:**
  * **Email:** `cliente@tiendaropa.com`
  * **Password:** `Cliente123!`

---

### 2. Login de Administrador (Obtener Token)
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/users/login`
* **Body (JSON):**
```json
{
  "email": "admin@tiendaropa.com",
  "password": "Admin123!"
}
```
> Copiar el valor del campo `token` de la respuesta para usarlo en los endpoints protegidos con el header:  
> `Authorization: Bearer <TOKEN_OBTENIDO>`

---

### 3. Crear una Categoría (`POST /api/categories`)
* **Header:** `Authorization: Bearer <TOKEN_ADMIN>`
* **Body (JSON):**
```json
{
  "name": "Calzado Urbano",
  "description": "Zapatillas deportivas y urbanas de lona y cuero sintético.",
  "slug": "calzado-urbano"
}
```

---

### 4. Crear un Producto con Variantes (`POST /api/products`)
* **Header:** `Authorization: Bearer <TOKEN_ADMIN>`
* **Body (JSON):** *(Reemplazar `"categoryId"` con un `_id` válido de categoría)*
```json
{
  "name": "Zapatillas Canvas Low",
  "description": "Zapatillas urbanas de lona con suela vulcanizada reforzada.",
  "price": 28500,
  "sku": "ZAP-CAN-01",
  "slug": "zapatillas-canvas-low",
  "categoryId": "COLOCAR_ACA_EL_ID_DE_LA_CATEGORIA",
  "variants": [
    {
      "sku": "ZAP-CAN-01-NEG",
      "color": "Negro All Star",
      "individualStock": 20
    },
    {
      "sku": "ZAP-CAN-01-BLA",
      "color": "Blanco Óptico",
      "individualStock": 15
    }
  ]
}
```
*(El backend calculará automáticamente `stock: 35` sumando 20 + 15)*.

---

### 5. Registrar un Nuevo Usuario (`POST /api/users/register`)
* **Acceso:** Público
* **Body (JSON):**
```json
{
  "name": "Gonzalo Rodríguez",
  "email": "gonzalo@correo.com",
  "password": "PasswordSeguro2026!",
  "phoneNumber": "1155667788",
  "address": "Av. Libertador 3200",
  "postalCode": "1426"
}
```
