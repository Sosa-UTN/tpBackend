# 🛍️ API E-commerce — Indumentaria y Moda Urbana

**TP Final Backend — UTN BA**

API RESTful para un e-commerce de indumentaria, construida con **Node.js**, **Express** y **MongoDB Atlas**. Implementa CRUD completo para tres entidades (Categorías, Productos y Usuarios), autenticación con JWT, control de acceso por roles (RBAC), y una capa de servicios que separa la lógica de negocio de los controladores.

### Arquitectura en capas

```
src/
├── models/         → Esquemas de Mongoose (estructura de datos)
├── services/       → Lógica de negocio (validaciones, cálculos)
├── controllers/    → Manejo de request/response HTTP
├── routes/         → Definición de endpoints y middlewares
├── middleware/     → Autenticación (JWT) y autorización (Admin)
├── config/         → Conexión a base de datos
└── utils/          → Variables de entorno centralizadas
```

---

## 2. Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución del servidor |
| **Express 5** | Framework HTTP para las rutas y middlewares |
| **MongoDB Atlas** | Base de datos NoSQL en la nube |
| **Mongoose 9** | ODM para modelar los datos y validaciones |
| **JWT (jsonwebtoken)** | Autenticación por tokens |
| **Bcrypt** | Hash de contraseñas |
| **Dotenv** | Variables de entorno |
| **CORS** | Permitir peticiones cross-origin |
| **Jest** | Framework de testing |
| **Supertest** | Testing de endpoints HTTP |

---

## 3. Esquema de la Base de Datos

### Category

| Campo | Tipo | Detalles |
|---|---|---|
| `name` | String | Requerido, único |
| `description` | String | Requerido |
| `slug` | String | Requerido, lowercase |
| `active` | Boolean | Default: `true` |
| `timestamps` | — | `createdAt`, `updatedAt` automáticos |

### Product

| Campo | Tipo | Detalles |
|---|---|---|
| `name` | String | Requerido |
| `sku` | String | Requerido, único |
| `description` | String | Opcional |
| `price` | Number | Requerido, min: 0 |
| `stock` | Number | Entero, min: 0. Se calcula automáticamente si hay variantes |
| `slug` | String | Requerido, único, lowercase |
| `active` | Boolean | Default: `true` |
| `categoryId` | ObjectId | **Referencia** a `Category` (se usa `.populate()`) |
| `variants` | Array | **Subdocumento embebido** (ver abajo) |
| `timestamps` | — | `createdAt`, `updatedAt` automáticos |

**Subdocumento `variants`** (embebido, sin `_id`):

| Campo | Tipo | Detalles |
|---|---|---|
| `sku` | String | SKU de la variante |
| `color` | String | Color de la variante |
| `individualStock` | Number | Entero, min: 0, default: 0 |

> **¿Por qué referencia para `categoryId` y subdocumento para `variants`?**
>
> - `categoryId` usa **referencia** (`ref: "Category"` + `.populate()`) porque las categorías son una entidad independiente compartida por muchos productos. Modificar una categoría se refleja automáticamente en todos los productos que la referencian.
> - `variants` usa **subdocumento embebido** porque las variantes pertenecen exclusivamente a un producto, no se consultan de forma independiente, y siempre se leen junto con el producto padre.

### User

| Campo | Tipo | Detalles |
|---|---|---|
| `name` | String | Requerido |
| `email` | String | Requerido, único, lowercase |
| `password` | String | Requerido, `select: false` (no se devuelve en queries) |
| `role` | String | Enum: `admin`, `client`. Default: `client` |
| `phoneNumber` | String | Opcional |
| `address` | String | Opcional |
| `postalCode` | String | Opcional |
| `timestamps` | — | `createdAt`, `updatedAt` automáticos |

> La contraseña se hashea automáticamente con **bcrypt** en un hook `pre('save')` antes de guardarse en la base de datos.

---

## 4. Instrucciones de Instalación y Ejecución

### Requisitos previos
- **Node.js** (v18 o superior)
- **NPM** (incluido con Node.js)
> *Nota: No es necesario tener MongoDB instalado localmente, ya que la API se conecta directamente a un clúster en la nube (MongoDB Atlas).*

---

### Pasos para levantar el proyecto

1. **Clonar el repositorio y acceder a la carpeta**
   ```bash
   git clone https://github.com/Sosa-UTN/tpBackend.git
   cd tpBackend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Colocar el archivo `.env` (adjunto en la entrega)**
   > 📌 **Aviso para la corrección:**  
   > Copiar y pegar en la raíz del proyecto (junto a `package.json`) el archivo `.env` que fue **adjuntado en la entrega**.  
   > Dicho archivo ya contiene la conexión activa a MongoDB Atlas y la clave secreta de JWT listas para usar (no es necesario crear ninguna base de datos propia).  
   > *(En caso de requerir ver la plantilla de variables, se deja disponible el archivo `.env.example`).*

4. **Sembrar datos de prueba (Seed)**
   ```bash
   npm run seed
   ```
   *Limpia las colecciones y carga automáticamente las categorías de indumentaria, productos con variantes y los usuarios de prueba (Admin y Cliente).*

5. **Ejecutar las pruebas automáticas**
   ```bash
   npm test
   ```
   *Ejecuta los **33 tests de integración** con Jest y Supertest (resultado esperado: 3 suites passed, 33 passed).*

6. **Iniciar el servidor**
   ```bash
   npm start
   ```
   *La API quedará escuchando en `http://localhost:3000` lista para recibir peticiones desde Thunder Client o Postman.*

---

## 5. Listado Completo de Endpoints

> **URL Base:** `http://localhost:3000`  
> **Autenticación:** En rutas protegidas (🔒 Admin), incluir el header: `Authorization: Bearer <token>`

### Raíz

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Bienvenida y listado de endpoints disponibles |

### Usuarios (`/api/users`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/users/register` | Público | Registrar un nuevo usuario |
| POST | `/api/users/login` | Público | Iniciar sesión y obtener token JWT |
| GET | `/api/users` | 🔒 Admin | Listar todos los usuarios |
| GET | `/api/users/:id` | 🔒 Admin | Obtener un usuario por ID |
| PUT | `/api/users/:id` | 🔒 Admin | Actualizar un usuario |
| DELETE | `/api/users/:id` | 🔒 Admin | Eliminar un usuario |

### Categorías (`/api/categories`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/categories` | Público | Listar todas las categorías |
| GET | `/api/categories/:id` | Público | Obtener una categoría por ID |
| POST | `/api/categories` | 🔒 Admin | Crear una categoría |
| PUT | `/api/categories/:id` | 🔒 Admin | Actualizar una categoría |
| DELETE | `/api/categories/:id` | 🔒 Admin | Eliminar una categoría |

### Productos (`/api/products`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Listar todos los productos (incluye datos de categoría) |
| GET | `/api/products/:id` | Público | Obtener un producto por ID (incluye datos de categoría) |
| POST | `/api/products` | 🔒 Admin | Crear un producto |
| PUT | `/api/products/:id` | 🔒 Admin | Actualizar un producto |
| DELETE | `/api/products/:id` | 🔒 Admin | Eliminar un producto |

> **🔒 Rutas protegidas:** Requieren enviar el header `Authorization: Bearer <token>` obtenido del login. Solo usuarios con `role: "admin"` pueden acceder.

### Códigos de Estado HTTP Utilizados

| Código | Estado | Cuándo se devuelve |
|---|---|---|
| `200` | OK | Petición exitosa en consultas (`GET`), actualizaciones (`PUT`), eliminaciones (`DELETE`) y login exitoso. |
| `201` | Created | Creación exitosa de un nuevo recurso (`POST` en `/register`, `/api/categories`, `/api/products`). |
| `400` | Bad Request | Datos inválidos, campos obligatorios faltantes o fallas en validaciones del esquema/negocio. |
| `401` | Unauthorized | Falta de token (`Authorization`), token inválido/vencido, o credenciales erróneas en login. |
| `403` | Forbidden | Token válido pero el usuario no tiene permisos suficientes (requiere rol `admin`). |
| `404` | Not Found | Recurso no encontrado por su ID o ruta no mapeada en la API. |
| `500` | Internal Server Error | Error no controlado o fallo de conexión en el servidor. |

### Formato Estándar de Errores

Ante cualquier error de cliente o servidor, la API responde con un formato JSON unificado:

```json
{
  "error": "Descripción detallada del motivo del error"
}
```

---

## 6. Ejemplos de Datos Mock (JSON)

### 🔑 Login de Admin (para obtener el token)

```http
POST /api/users/login
```
```json
{
  "email": "admin@tiendaropa.com",
  "password": "Admin123!"
}
```

**Respuesta** (copiar el `token` para las rutas protegidas):
```json
{
  "user": {
    "_id": "...",
    "name": "Administrador",
    "email": "admin@tiendaropa.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 👤 Registrar un nuevo usuario

```http
POST /api/users/register
```
```json
{
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "password": "MiPassword123",
  "phoneNumber": "1155667788",
  "address": "Av. Corrientes 1234, CABA",
  "postalCode": "C1043"
}
```

### 📁 Crear Categoría

```http
POST /api/categories
Authorization: Bearer <token>
```
```json
{
  "name": "Remeras",
  "description": "Remeras de algodón y poliéster para uso diario",
  "slug": "remeras"
}
```

### ✏️ Actualizar Categoría

```http
PUT /api/categories/:id
Authorization: Bearer <token>
```
```json
{
  "name": "Remeras Oversize",
  "description": "Remeras oversize de algodón premium"
}
```

### 📦 Crear Producto (con variantes)

```http
POST /api/products
Authorization: Bearer <token>
```
```json
{
  "name": "Remera Básica Algodón",
  "sku": "REM-BAS-001",
  "description": "Remera de algodón peinado, corte regular",
  "price": 15999.99,
  "slug": "remera-basica-algodon",
  "categoryId": "<ID de la categoría>",
  "variants": [
    { "sku": "REM-BAS-001-NEG", "color": "Negro", "individualStock": 25 },
    { "sku": "REM-BAS-001-BLA", "color": "Blanco", "individualStock": 30 },
    { "sku": "REM-BAS-001-GRI", "color": "Gris", "individualStock": 15 }
  ]
}
```

> **Nota:** El campo `stock` se calcula automáticamente (25 + 30 + 15 = 70). No es necesario enviarlo.

### ✏️ Actualizar Producto

```http
PUT /api/products/:id
Authorization: Bearer <token>
```
```json
{
  "price": 17499.99,
  "variants": [
    { "sku": "REM-BAS-001-NEG", "color": "Negro", "individualStock": 20 },
    { "sku": "REM-BAS-001-BLA", "color": "Blanco", "individualStock": 35 }
  ]
}
```

---

## 7. Funcionalidades Implementadas y Funcionalidades a Futuro

### ✅ Implementadas

- **CRUD completo** para Categorías, Productos y Usuarios.
- **Autenticación JWT** con registro y login público (token con expiración de 1 día).
- **Control de acceso por roles (RBAC):** middleware `verifyToken` + `verifyAdmin` que bloquea con 403 a no-admins.
- **Hash de contraseñas** con bcrypt en hook `pre('save')` + hash manual en `updateUser` para cubrir `findByIdAndUpdate`.
- **Cálculo automático de stock:** si un producto tiene variantes, el stock total se calcula sumando `individualStock` con `.reduce()`.
- **Populate de categorías** en productos: al consultar un producto se devuelve la categoría completa (no solo el ID).
- **Validación de existencia de categoría** al crear/actualizar productos.
- **Script de sembrado** (`npm run seed`): genera categorías, productos con variantes y usuarios de prueba listos para probar.
- **33 tests de integración** con Jest + Supertest (autenticación, autorización, CRUD de las 3 entidades).
- **Manejador 404** en formato JSON para rutas inexistentes.
- **Configuración centralizada** de variables de entorno en `utils/config.js`.

### 🔮 Funcionalidades a futuro

- **Carrito de compras y órdenes:** entidades `Cart` y `Order` con estados de pedido.
- **Integración con MercadoPago:** procesamiento de pagos online.
- **Subida de imágenes:** integración con Multer + Supabase Storage para fotos de productos.
- **Filtros y paginación:** búsqueda por categoría, rango de precios y paginación en listados.
- **Endpoint `changePassword`:** ruta específica que use `.save()` para pasar por el hook `pre('save')`.
- **Documentación Swagger:** generar documentación interactiva con swagger-jsdoc y swagger-ui-express.

---

## 8. Configuración del Archivo .env

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
# Puerto del servidor
PORT=3000

# Cadena de conexión a MongoDB Atlas
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<basedatos>?retryWrites=true&w=majority

# Clave secreta para JWT
JWT_SECRET=tu_clave_secreta_aqui
```

> **Credenciales de prueba** (generadas por `npm run seed`):
>
> | Rol | Email | Contraseña |
> |---|---|---|
> | 👑 Admin | `admin@tiendaropa.com` | `Admin123!` |
> | 🛍️ Cliente | `cliente@tiendaropa.com` | `Cliente123!` |
