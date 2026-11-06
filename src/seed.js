import 'dotenv/config';
import mongoose from 'mongoose';
import conectarDB from './config/db.js';
import Category from './models/categoryModel.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';

async function seed() {
    try {
        console.log('🌱 Conectando a la base de datos...');
        await conectarDB();

        // 1. Limpiamos las colecciones existentes para no duplicar datos
        console.log('🧹 Limpiando colecciones anteriores...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        // 2. Creamos las Categorías del local de ropa
        console.log('📦 Creando categorías...');
        const categorias = await Category.insertMany([
            {
                name: 'Remeras y Tops',
                description: 'Prendas superiores urbanas, básicas y estampadas en 100% algodón.',
                slug: 'remeras-y-tops'
            },
            {
                name: 'Pantalones y Jeans',
                description: 'Cortes mom, wide leg, cargos y clásicos en denim y gabardina.',
                slug: 'pantalones-y-jeans'
            },
            {
                name: 'Abrigos y Camperas',
                description: 'Buzos hoodie, camperas de jean y chaquetas de temporada.',
                slug: 'abrigos-y-camperas'
            },
            {
                name: 'Accesorios',
                description: 'Gorras, cinturones, bolsos y complementos de moda.',
                slug: 'accesorios'
            }
        ]);

        // Mapeamos las categorías por slug para vincularlas fácilmente a los productos
        const catMap = {};
        categorias.forEach(cat => {
            catMap[cat.slug] = cat._id;
        });

        // 3. Creamos los Productos con variantes de color o material
        console.log('👕 Creando productos de indumentaria...');
        const productosData = [
            {
                name: 'Remera Oversize Heavy Cotton',
                description: 'Remera de corte amplio, confeccionada en algodón peinado de 240g con cuello reforzado.',
                price: 18500,
                sku: 'REM-OVR-01',
                slug: 'remera-oversize-heavy-cotton',
                categoryId: catMap['remeras-y-tops'],
                variants: [
                    { sku: 'REM-OVR-01-BLA', color: 'Blanco', individualStock: 25 },
                    { sku: 'REM-OVR-01-NEG', color: 'Negro Washed', individualStock: 30 },
                    { sku: 'REM-OVR-01-MOK', color: 'Moka', individualStock: 15 }
                ],
                active: true
            },
            {
                name: 'Pantalón Cargo Drill',
                description: 'Pantalón con seis bolsillos funcionales, botamanga con elástico ajustable y tiro medio.',
                price: 36000,
                sku: 'PAN-CRG-02',
                slug: 'pantalon-cargo-drill',
                categoryId: catMap['pantalones-y-jeans'],
                variants: [
                    { sku: 'PAN-CRG-02-VER', color: 'Verde Militar', individualStock: 18 },
                    { sku: 'PAN-CRG-02-BEI', color: 'Beige Arena', individualStock: 12 },
                    { sku: 'PAN-CRG-02-NEG', color: 'Negro', individualStock: 20 }
                ],
                active: true
            },
            {
                name: 'Campera Trucker Denim',
                description: 'Campera de jean clásica con botones metálicos zamak y bolsillos en pecho.',
                price: 52000,
                sku: 'CAM-DNM-03',
                slug: 'campera-trucker-denim',
                categoryId: catMap['abrigos-y-camperas'],
                variants: [
                    { sku: 'CAM-DNM-03-AZL', color: 'Azul Vintage', individualStock: 10 },
                    { sku: 'CAM-DNM-03-NEG', color: 'Negro Gastado', individualStock: 14 }
                ],
                active: true
            },
            {
                name: 'Cinturón Hebilla Metálica',
                description: 'Cinturón de vestir y casual, ancho 3.5 cm con costuras reforzadas.',
                price: 12500,
                sku: 'CIN-HEB-04',
                slug: 'cinturon-hebilla-metalica',
                categoryId: catMap['accesorios'],
                variants: [
                    { sku: 'CIN-HEB-04-CMR', color: 'Cuero Marrón', individualStock: 20 },
                    { sku: 'CIN-HEB-04-CNG', color: 'Cuero Negro', individualStock: 25 }
                ],
                active: true
            },
            {
                name: 'Gorra Dad Cap Gabardina',
                description: 'Gorra clásica de 6 gajos con bordado minimalista frontal y correa regulable.',
                price: 9800,
                sku: 'GOR-DAD-05',
                slug: 'gorra-dad-cap-gabardina',
                categoryId: catMap['accesorios'],
                variants: [], // Producto simple sin variantes
                stock: 45,
                active: true
            }
        ];

        // Calculamos el stock total para los productos que tienen variantes
        for (const prod of productosData) {
            if (prod.variants && prod.variants.length > 0) {
                prod.stock = prod.variants.reduce((acc, v) => acc + (v.individualStock || 0), 0);
            }
            await Product.create(prod);
        }

        // 4. Creamos Usuarios de prueba (Admin y Cliente)
        console.log('👤 Creando usuarios de prueba...');
        // Usamos User.create para que se active automáticamente el hook pre('save') de bcrypt
        await User.create([
            {
                name: 'Administrador Tienda',
                email: 'admin@tiendaropa.com',
                password: 'Admin123!',
                phoneNumber: '1144556677',
                address: 'Av. Santa Fe 2450',
                postalCode: '1425',
                role: 'admin'
            },
            {
                name: 'Cliente Frecuente',
                email: 'cliente@tiendaropa.com',
                password: 'Cliente123!',
                phoneNumber: '1199887766',
                address: 'Calle Corrientes 1530',
                postalCode: '1042',
                role: 'client'
            }
        ]);

        console.log('\n=============================================');
        console.log('🎉 ¡Base de datos sembrada exitosamente!');
        console.log('=============================================');
        console.log('Credenciales de prueba generadas:');
        console.log('👑 Admin:   admin@tiendaropa.com   | Pass: Admin123!');
        console.log('🛍️ Cliente: cliente@tiendaropa.com | Pass: Cliente123!');
        console.log('=============================================\n');

    } catch (error) {
        console.error('❌ Error al sembrar la base de datos:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
