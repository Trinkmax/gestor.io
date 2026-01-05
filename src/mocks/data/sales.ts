// ================================
// MOCK CASH REGISTER & SALES DATA
// Sistema de Gestión Comercial
// ================================

import type { CashRegister, Sale, Expense, Payment, AccountMovement } from '../../types';

// Current open cash register (simulates today's session)
export const mockCashRegisters: CashRegister[] = [
    // Today's cash register (OPEN)
    {
        id: 'cash-001',
        openingAmount: 50000,
        openingNotes: 'Inicio de jornada',
        openedBy: 'user-owner-001',
        openedByName: 'Carlos Rodríguez',
        openedAt: new Date('2026-01-04T08:00:00'),

        totalCash: 85600,
        totalTransfer: 45200,
        totalCard: 28500,
        totalCredit: 15500,
        totalExpensesCash: 12500,
        totalExpensesTransfer: 3000,
        salesCount: 24,

        isClosed: false,
    },
    // Yesterday (CLOSED with difference)
    {
        id: 'cash-002',
        openingAmount: 45000,
        openingNotes: '',
        openedBy: 'user-employee-001',
        openedByName: 'María González',
        openedAt: new Date('2026-01-03T08:30:00'),

        closingAmount: 115500, // Counted
        expectedAmount: 116200, // Calculated
        difference: -700, // Faltante
        closingNotes: 'Diferencia menor, posible error de vuelto',
        closedBy: 'user-owner-001',
        closedByName: 'Carlos Rodríguez',
        closedAt: new Date('2026-01-03T20:15:00'),

        totalCash: 78200,
        totalTransfer: 38500,
        totalCard: 22000,
        totalCredit: 12800,
        totalExpensesCash: 7000,
        totalExpensesTransfer: 0,
        salesCount: 31,

        isClosed: true,
    },
    // Two days ago (CLOSED, balanced)
    {
        id: 'cash-003',
        openingAmount: 40000,
        openedBy: 'user-owner-001',
        openedByName: 'Carlos Rodríguez',
        openedAt: new Date('2026-01-02T09:00:00'),

        closingAmount: 98500,
        expectedAmount: 98500,
        difference: 0,
        closingNotes: 'Caja cuadrada',
        closedBy: 'user-owner-001',
        closedByName: 'Carlos Rodríguez',
        closedAt: new Date('2026-01-02T19:45:00'),

        totalCash: 65500,
        totalTransfer: 42000,
        totalCard: 18000,
        totalCredit: 8500,
        totalExpensesCash: 7000,
        totalExpensesTransfer: 2500,
        salesCount: 28,

        isClosed: true,
    },
];

// Today's sales
export const mockSales: Sale[] = [
    {
        id: 'sale-001',
        number: 1001,
        items: [
            { id: 'item-001', productId: 'prod-001', productName: 'Coca Cola 2.25L', productCode: '7790895000010', quantity: 2, unitPrice: 2500, subtotal: 5000 },
            { id: 'item-002', productId: 'prod-006', productName: 'Fideos Matarazzo 500g', productCode: '7790070000019', quantity: 3, unitPrice: 950, subtotal: 2850 },
        ],
        total: 7850,
        paymentMethod: 'CASH',
        cashRegisterId: 'cash-001',
        userId: 'user-employee-001',
        userName: 'María González',
        createdAt: new Date('2026-01-04T09:15:00'),
    },
    {
        id: 'sale-002',
        number: 1002,
        items: [
            { id: 'item-003', productId: 'prod-017', productName: 'Marlboro Box 20', productCode: '7791000000017', quantity: 2, unitPrice: 3500, subtotal: 7000 },
        ],
        total: 7000,
        paymentMethod: 'TRANSFER',
        cashRegisterId: 'cash-001',
        userId: 'user-employee-001',
        userName: 'María González',
        createdAt: new Date('2026-01-04T09:45:00'),
    },
    {
        id: 'sale-003',
        number: 1003,
        items: [
            { id: 'item-004', productId: 'prod-010', productName: 'Yerba Taragüí 1kg', productCode: '7790387000017', quantity: 1, unitPrice: 4500, subtotal: 4500 },
            { id: 'item-005', productId: 'prod-011', productName: 'Leche La Serenísima 1L', productCode: '7790742000011', quantity: 2, unitPrice: 1200, subtotal: 2400 },
            { id: 'item-006', productId: 'prod-019', productName: 'Pan Lactal Bimbo 500g', productCode: '7790040000019', quantity: 1, unitPrice: 1800, subtotal: 1800 },
        ],
        total: 8700,
        paymentMethod: 'CARD',
        cashRegisterId: 'cash-001',
        userId: 'user-owner-001',
        userName: 'Carlos Rodríguez',
        createdAt: new Date('2026-01-04T10:30:00'),
    },
    {
        id: 'sale-004',
        number: 1004,
        items: [
            { id: 'item-007', productId: 'prod-005', productName: 'Fernet Branca 750ml', productCode: '8000440000016', quantity: 2, unitPrice: 9500, subtotal: 19000 },
            { id: 'item-008', productId: 'prod-004', productName: 'Cerveza Quilmes 1L', productCode: '7790315000012', quantity: 6, unitPrice: 1800, subtotal: 10800 },
        ],
        total: 29800,
        paymentMethod: 'CREDIT',
        clientId: 'client-001',
        clientName: 'Juan Martínez',
        cashRegisterId: 'cash-001',
        userId: 'user-employee-001',
        userName: 'María González',
        notes: 'Fiado para evento del fin de semana',
        createdAt: new Date('2026-01-04T11:00:00'),
    },
    {
        id: 'sale-005',
        number: 1005,
        items: [
            { id: 'item-009', productId: 'prod-021', productName: 'Chocolate Milka 100g', productCode: '7622300000021', quantity: 3, unitPrice: 1850, subtotal: 5550 },
            { id: 'item-010', productId: 'prod-022', productName: 'Alfajor Havanna', productCode: '7790895000201', quantity: 4, unitPrice: 1500, subtotal: 6000 },
        ],
        total: 11550,
        paymentMethod: 'CASH',
        cashRegisterId: 'cash-001',
        userId: 'user-owner-001',
        userName: 'Carlos Rodríguez',
        createdAt: new Date('2026-01-04T12:15:00'),
    },
];

// Today's expenses
export const mockExpenses: Expense[] = [
    {
        id: 'exp-001',
        cashRegisterId: 'cash-001',
        amount: 8500,
        category: 'FREIGHT',
        paymentMethod: 'CASH',
        notes: 'Flete de mercadería - Distribuidora Norte',
        userId: 'user-owner-001',
        userName: 'Carlos Rodríguez',
        createdAt: new Date('2026-01-04T10:00:00'),
    },
    {
        id: 'exp-002',
        cashRegisterId: 'cash-001',
        amount: 3000,
        category: 'SERVICES',
        paymentMethod: 'TRANSFER',
        notes: 'Pago parcial luz',
        userId: 'user-owner-001',
        userName: 'Carlos Rodríguez',
        createdAt: new Date('2026-01-04T14:30:00'),
    },
    {
        id: 'exp-003',
        cashRegisterId: 'cash-001',
        amount: 4000,
        category: 'SUPPLIES',
        paymentMethod: 'CASH',
        notes: 'Bolsas y packaging',
        userId: 'user-employee-001',
        userName: 'María González',
        createdAt: new Date('2026-01-04T16:00:00'),
    },
];

// Payments received (for credit accounts)
export const mockPayments: Payment[] = [
    {
        id: 'pay-001',
        clientId: 'client-001',
        clientName: 'Juan Martínez',
        amount: 10000,
        paymentMethod: 'CASH',
        notes: 'Pago parcial de deuda',
        userId: 'user-owner-001',
        userName: 'Carlos Rodríguez',
        createdAt: new Date('2026-01-03T15:30:00'),
    },
    {
        id: 'pay-002',
        clientId: 'client-003',
        clientName: 'Roberto Sánchez',
        amount: 5000,
        paymentMethod: 'TRANSFER',
        notes: '',
        userId: 'user-employee-001',
        userName: 'María González',
        createdAt: new Date('2026-01-02T11:00:00'),
    },
];

// Account movements for client-001 (Juan Martínez)
export const mockAccountMovements: AccountMovement[] = [
    {
        id: 'mov-001',
        clientId: 'client-001',
        type: 'SALE',
        referenceId: 'sale-old-001',
        referenceNumber: 980,
        amount: 12500,
        balance: 12500,
        notes: '',
        createdAt: new Date('2025-12-20T10:00:00'),
    },
    {
        id: 'mov-002',
        clientId: 'client-001',
        type: 'PAYMENT',
        referenceId: 'pay-old-001',
        amount: -5000,
        balance: 7500,
        notes: 'Pago en efectivo',
        createdAt: new Date('2025-12-22T14:00:00'),
    },
    {
        id: 'mov-003',
        clientId: 'client-001',
        type: 'SALE',
        referenceId: 'sale-old-002',
        referenceNumber: 995,
        amount: 8000,
        balance: 15500,
        notes: '',
        createdAt: new Date('2025-12-28T11:30:00'),
    },
    {
        id: 'mov-004',
        clientId: 'client-001',
        type: 'PAYMENT',
        referenceId: 'pay-001',
        amount: -10000,
        balance: 5500,
        notes: 'Pago parcial de deuda',
        createdAt: new Date('2026-01-03T15:30:00'),
    },
    {
        id: 'mov-005',
        clientId: 'client-001',
        type: 'SALE',
        referenceId: 'sale-004',
        referenceNumber: 1004,
        amount: 29800,
        balance: 35300,
        notes: 'Fiado para evento del fin de semana',
        createdAt: new Date('2026-01-04T11:00:00'),
    },
];

// Get current open cash register
export function getOpenCashRegister(): CashRegister | null {
    return mockCashRegisters.find(cr => !cr.isClosed) || null;
}

// Get today's sales
export function getTodaySales(): Sale[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return mockSales.filter(s => {
        const saleDate = new Date(s.createdAt);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
    });
}

// Get today's totals by payment method
export function getTodayTotalsByMethod(): Record<string, number> {
    const sales = getTodaySales();
    return sales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);
}
