// ================================
// EJEMPLO DE USO DE SERVICIOS SUPABASE
// Sistema de Gestión Comercial
// ================================

// Este archivo muestra ejemplos de cómo usar los servicios de Supabase
// NO ejecutar directamente, solo para referencia

import {
    // Products
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    searchProducts,
    getLowStockProducts,
    getCategories,
    
    // Clients
    getClients,
    getClientById as _getClientById,
    createClient,
    updateClient as _updateClient,
    getDebtors,
    createPayment,
    getAccountMovementsByClient,
    
    // Sales
    getSales as _getSales,
    createSale,
    getSalesByCashRegister,
    getSalesByDateRange,
    
    // Cash Register
    openCashRegister,
    closeCashRegister,
    getOpenCashRegister,
    getCashRegisters,
    createExpense,
    getExpensesByCashRegister,
    
    // Config
    getBusinessConfig,
    updateBusinessConfig,
    getUsers,
    getUserById,
    createUser,
} from '../services';

// ========== EJEMPLOS DE PRODUCTOS ==========

export async function exampleProducts() {
    // Obtener todos los productos activos
    const products = await getProducts();
    console.log('Productos:', products);

    // Buscar productos por nombre o código
    const searchResults = await searchProducts('coca');
    console.log('Búsqueda:', searchResults);

    // Obtener productos con stock bajo
    const lowStock = await getLowStockProducts();
    console.log('Stock bajo:', lowStock);

    // Crear un nuevo producto
    const newProduct = await createProduct({
        name: 'Producto Nuevo',
        code: '1234567890',
        price: 1500,
        cost: 1000,
        stock: 50,
        minStock: 10,
        isActive: true,
        categoryId: 'b0000000-0000-0000-0000-000000000001',
    });
    console.log('Producto creado:', newProduct);

    // Actualizar stock de un producto
    const updated = await updateProduct(newProduct.id, {
        stock: 45,
    });
    console.log('Stock actualizado:', updated);

    // Obtener categorías
    const categories = await getCategories();
    console.log('Categorías:', categories);
}

// ========== EJEMPLOS DE CLIENTES ==========

export async function exampleClients() {
    // Obtener todos los clientes
    const clients = await getClients();
    console.log('Clientes:', clients);

    // Obtener clientes con deuda (deudores)
    const debtors = await getDebtors();
    console.log('Deudores:', debtors);

    // Crear un nuevo cliente
    const newClient = await createClient({
        name: 'Nuevo Cliente',
        phone: '+54 11 1234-5678',
        email: 'cliente@email.com',
        address: 'Calle Falsa 123',
        notes: 'Cliente nuevo de prueba',
    });
    console.log('Cliente creado:', newClient);

    // Registrar un pago de cliente
    const payment = await createPayment({
        clientId: 'd0000000-0000-0000-0000-000000000001',
        clientName: 'Juan Martínez',
        amount: 5000,
        paymentMethod: 'CASH',
        notes: 'Pago parcial',
        userId: 'a0000000-0000-0000-0000-000000000001',
        userName: 'Carlos Rodríguez',
    });
    console.log('Pago registrado:', payment);

    // Obtener movimientos de cuenta de un cliente
    const movements = await getAccountMovementsByClient('d0000000-0000-0000-0000-000000000001');
    console.log('Movimientos:', movements);
}

// ========== EJEMPLOS DE VENTAS ==========

export async function exampleSales() {
    // Obtener caja abierta
    const openCash = await getOpenCashRegister();
    
    if (!openCash) {
        console.log('No hay caja abierta');
        return;
    }

    // Crear una venta
    const sale = await createSale({
        items: [
            {
                id: 'temp-1',
                productId: 'c0000000-0000-0000-0000-000000000001',
                productName: 'Coca Cola 2.25L',
                productCode: '7790895000010',
                quantity: 2,
                unitPrice: 2500,
                subtotal: 5000,
            },
            {
                id: 'temp-2',
                productId: 'c0000000-0000-0000-0000-000000000006',
                productName: 'Fideos Matarazzo 500g',
                productCode: '7790070000019',
                quantity: 3,
                unitPrice: 950,
                subtotal: 2850,
            },
        ],
        total: 7850,
        paymentMethod: 'CASH',
        cashRegisterId: openCash.id,
        userId: 'a0000000-0000-0000-0000-000000000001',
        userName: 'Carlos Rodríguez',
        notes: 'Venta de prueba',
    });
    console.log('Venta creada:', sale);

    // Obtener ventas de la caja actual
    const sales = await getSalesByCashRegister(openCash.id);
    console.log('Ventas de la caja:', sales);

    // Obtener ventas por rango de fechas
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    const salesByDate = await getSalesByDateRange(startDate, endDate);
    console.log('Ventas por fecha:', salesByDate);
}

// ========== EJEMPLOS DE CAJA REGISTRADORA ==========

export async function exampleCashRegister() {
    // Verificar si hay caja abierta
    let openCash = await getOpenCashRegister();

    if (!openCash) {
        // Abrir caja
        openCash = await openCashRegister({
            openingAmount: 50000,
            openingNotes: 'Apertura de caja - turno mañana',
            openedBy: 'a0000000-0000-0000-0000-000000000001',
            openedByName: 'Carlos Rodríguez',
        });
        console.log('Caja abierta:', openCash);
    }

    // Registrar un gasto
    const expense = await createExpense({
        cashRegisterId: openCash.id,
        amount: 5000,
        category: 'FREIGHT',
        paymentMethod: 'CASH',
        notes: 'Flete de mercadería',
        userId: 'a0000000-0000-0000-0000-000000000001',
        userName: 'Carlos Rodríguez',
    });
    console.log('Gasto registrado:', expense);

    // Obtener gastos de la caja
    const expenses = await getExpensesByCashRegister(openCash.id);
    console.log('Gastos de la caja:', expenses);

    // Cerrar caja (al final del día)
    const closedCash = await closeCashRegister({
        id: openCash.id,
        closingAmount: 125000,
        closingNotes: 'Cierre del día - sin diferencias',
        closedBy: 'a0000000-0000-0000-0000-000000000001',
        closedByName: 'Carlos Rodríguez',
    });
    console.log('Caja cerrada:', closedCash);
    console.log('Diferencia:', closedCash.difference);

    // Obtener historial de cajas
    const cashHistory = await getCashRegisters();
    console.log('Historial de cajas:', cashHistory);
}

// ========== EJEMPLOS DE CONFIGURACIÓN ==========

export async function exampleConfig() {
    // Obtener configuración del negocio
    const config = await getBusinessConfig();
    console.log('Configuración:', config);

    // Actualizar configuración
    const updatedConfig = await updateBusinessConfig({
        businessName: 'Mi Negocio Actualizado',
        businessPhone: '+54 11 9876-5432',
        employeeCanEditPrices: true,
        showCostsToEmployee: false,
    });
    console.log('Configuración actualizada:', updatedConfig);

    // Obtener usuarios del sistema
    const users = await getUsers();
    console.log('Usuarios:', users);

    // Obtener un usuario específico
    const user = await getUserById('a0000000-0000-0000-0000-000000000001');
    console.log('Usuario:', user);

    // Crear un nuevo usuario
    const newUser = await createUser({
        name: 'Nuevo Empleado',
        email: 'empleado@negocio.com',
        role: 'EMPLOYEE',
        isActive: true,
    });
    console.log('Usuario creado:', newUser);
}

// ========== EJEMPLO DE FLUJO COMPLETO ==========

export async function exampleCompleteFlow() {
    console.log('=== FLUJO COMPLETO DE VENTA ===');

    // 1. Verificar/Abrir caja
    let cashRegister = await getOpenCashRegister();
    if (!cashRegister) {
        cashRegister = await openCashRegister({
            openingAmount: 50000,
            openingNotes: 'Apertura del día',
            openedBy: 'a0000000-0000-0000-0000-000000000001',
            openedByName: 'Carlos Rodríguez',
        });
        console.log('✅ Caja abierta');
    }

    // 2. Buscar productos para la venta
    const products = await searchProducts('coca');
    console.log('✅ Productos encontrados:', products.length);

    // 3. Crear la venta
    const sale = await createSale({
        items: products.slice(0, 1).map(p => ({
            id: `temp-${p.id}`,
            productId: p.id,
            productName: p.name,
            productCode: p.code,
            quantity: 2,
            unitPrice: p.price,
            subtotal: p.price * 2,
        })),
        total: products[0].price * 2,
        paymentMethod: 'CASH',
        cashRegisterId: cashRegister.id,
        userId: 'a0000000-0000-0000-0000-000000000001',
        userName: 'Carlos Rodríguez',
    });
    console.log('✅ Venta creada:', sale.number);

    // 4. Verificar stock actualizado
    const updatedProduct = await getProductById(products[0].id);
    console.log('✅ Stock actualizado:', updatedProduct?.stock);

    // 5. Verificar totales de caja
    const updatedCash = await getOpenCashRegister();
    console.log('✅ Total en caja:', updatedCash?.totalCash);

    console.log('=== FLUJO COMPLETADO ===');
}

// Para probar los ejemplos, descomenta la línea correspondiente:
// exampleProducts();
// exampleClients();
// exampleSales();
// exampleCashRegister();
// exampleConfig();
// exampleCompleteFlow();

