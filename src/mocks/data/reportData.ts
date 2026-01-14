// ================================
// EXTENDED MOCK DATA FOR REPORTS
// Generates realistic sales history
// ================================

import type { Sale, CashRegister, Expense } from '../../types';
import { mockProducts } from './products';
import { mockClients } from './clients';

// Generate extended sales history for the last 60 days
function generateExtendedSales(): Sale[] {
    const sales: Sale[] = [];
    const now = new Date();
    const paymentMethods: ('CASH' | 'TRANSFER' | 'CARD' | 'CREDIT')[] = ['CASH', 'TRANSFER', 'CARD', 'CREDIT'];
    const paymentWeights = [0.4, 0.25, 0.2, 0.15]; // CASH is most common
    
    const users = [
        { id: 'user-owner-001', name: 'Carlos Rodríguez' },
        { id: 'user-employee-001', name: 'María González' }
    ];
    
    let saleNumber = 900;
    
    // Generate sales for last 60 days
    for (let daysAgo = 59; daysAgo >= 0; daysAgo--) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);
        
        // Skip some days randomly (10% chance of no sales)
        if (Math.random() < 0.1) continue;
        
        // Generate 8-35 sales per day (more on weekends)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const baseSales = isWeekend ? 25 : 18;
        const numSales = Math.floor(baseSales + Math.random() * 15);
        
        for (let i = 0; i < numSales; i++) {
            // Random hour between 8am and 10pm
            const hour = 8 + Math.floor(Math.random() * 14);
            const minute = Math.floor(Math.random() * 60);
            const saleDate = new Date(date);
            saleDate.setHours(hour, minute, Math.floor(Math.random() * 60));
            
            // Generate 1-5 items per sale
            const numItems = 1 + Math.floor(Math.random() * 4);
            const items: Sale['items'] = [];
            const usedProducts = new Set<string>();
            
            for (let j = 0; j < numItems; j++) {
                const product = mockProducts[Math.floor(Math.random() * (mockProducts.length - 1))]; // Exclude inactive
                if (usedProducts.has(product.id) || !product.isActive) continue;
                usedProducts.add(product.id);
                
                const quantity = 1 + Math.floor(Math.random() * 3);
                items.push({
                    id: `item-${saleNumber}-${j}`,
                    productId: product.id,
                    productName: product.name,
                    productCode: product.code,
                    quantity,
                    unitPrice: product.price,
                    subtotal: product.price * quantity
                });
            }
            
            if (items.length === 0) continue;
            
            const total = items.reduce((sum: number, item) => sum + item.subtotal, 0);
            
            // Select payment method with weights
            const rand = Math.random();
            let cumulative = 0;
            let selectedMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'CREDIT' = 'CASH';
            for (let k = 0; k < paymentMethods.length; k++) {
                cumulative += paymentWeights[k];
                if (rand < cumulative) {
                    selectedMethod = paymentMethods[k];
                    break;
                }
            }
            
            const user = users[Math.floor(Math.random() * users.length)];
            
            const sale: Sale = {
                id: `sale-ext-${saleNumber}`,
                number: saleNumber,
                items,
                total,
                paymentMethod: selectedMethod,
                cashRegisterId: `cash-day-${daysAgo}`,
                userId: user.id,
                userName: user.name,
                createdAt: saleDate
            };
            
            // Add client for credit sales
            if (selectedMethod === 'CREDIT') {
                const client = mockClients[Math.floor(Math.random() * mockClients.length)];
                sale.clientId = client.id;
                sale.clientName = client.name;
            }
            
            sales.push(sale);
            saleNumber++;
        }
    }
    
    return sales;
}

// Generate cash register history for the last 60 days
function generateCashRegisterHistory(): CashRegister[] {
    const registers: CashRegister[] = [];
    const now = new Date();
    
    const users = [
        { id: 'user-owner-001', name: 'Carlos Rodríguez' },
        { id: 'user-employee-001', name: 'María González' }
    ];
    
    for (let daysAgo = 59; daysAgo >= 0; daysAgo--) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        
        // Skip some days
        if (Math.random() < 0.05) continue;
        
        const openedBy = users[Math.floor(Math.random() * users.length)];
        const closedBy = users[Math.floor(Math.random() * users.length)];
        
        const openingAmount = 30000 + Math.floor(Math.random() * 30000);
        const totalCash = 40000 + Math.floor(Math.random() * 80000);
        const totalTransfer = 20000 + Math.floor(Math.random() * 50000);
        const totalCard = 10000 + Math.floor(Math.random() * 40000);
        const totalCredit = 5000 + Math.floor(Math.random() * 25000);
        const totalExpensesCash = 2000 + Math.floor(Math.random() * 15000);
        const totalExpensesTransfer = Math.floor(Math.random() * 5000);
        const salesCount = 15 + Math.floor(Math.random() * 25);
        
        const expectedAmount = openingAmount + totalCash - totalExpensesCash;
        const difference = Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 2000);
        const closingAmount = expectedAmount + difference;
        
        const openedAt = new Date(date);
        openedAt.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);
        
        const closedAt = new Date(date);
        closedAt.setHours(19 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0);
        
        // Don't close today's register
        const isClosed = daysAgo > 0;
        
        registers.push({
            id: `cash-day-${daysAgo}`,
            openingAmount,
            openingNotes: daysAgo === 0 ? 'Inicio de jornada' : '',
            openedBy: openedBy.id,
            openedByName: openedBy.name,
            openedAt,
            
            closingAmount: isClosed ? closingAmount : undefined,
            expectedAmount: isClosed ? expectedAmount : undefined,
            difference: isClosed ? difference : undefined,
            closingNotes: isClosed ? (difference === 0 ? 'Caja cuadrada' : (difference < 0 ? 'Faltante menor' : 'Sobrante')) : undefined,
            closedBy: isClosed ? closedBy.id : undefined,
            closedByName: isClosed ? closedBy.name : undefined,
            closedAt: isClosed ? closedAt : undefined,
            
            totalCash,
            totalTransfer,
            totalCard,
            totalCredit,
            totalExpensesCash,
            totalExpensesTransfer,
            salesCount,
            
            isClosed
        });
    }
    
    return registers;
}

// Generate expense history
function generateExpenseHistory(): Expense[] {
    const expenses: Expense[] = [];
    const now = new Date();
    
    const categories: ('FREIGHT' | 'SUPPLIES' | 'SERVICES' | 'OTHER')[] = ['FREIGHT', 'SUPPLIES', 'SERVICES', 'OTHER'];
    const categoryWeights = [0.35, 0.3, 0.2, 0.15];
    
    const users = [
        { id: 'user-owner-001', name: 'Carlos Rodríguez' },
        { id: 'user-employee-001', name: 'María González' }
    ];
    
    let expenseId = 100;
    
    for (let daysAgo = 59; daysAgo >= 0; daysAgo--) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        
        // 0-3 expenses per day
        const numExpenses = Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numExpenses; i++) {
            const hour = 9 + Math.floor(Math.random() * 10);
            const expenseDate = new Date(date);
            expenseDate.setHours(hour, Math.floor(Math.random() * 60), 0);
            
            // Select category with weights
            const rand = Math.random();
            let cumulative = 0;
            let selectedCategory: 'FREIGHT' | 'SUPPLIES' | 'SERVICES' | 'OTHER' = 'OTHER';
            for (let k = 0; k < categories.length; k++) {
                cumulative += categoryWeights[k];
                if (rand < cumulative) {
                    selectedCategory = categories[k];
                    break;
                }
            }
            
            const user = users[Math.floor(Math.random() * users.length)];
            const paymentMethod: 'CASH' | 'TRANSFER' = Math.random() < 0.7 ? 'CASH' : 'TRANSFER';
            
            const amounts: Record<string, [number, number]> = {
                'FREIGHT': [3000, 15000],
                'SUPPLIES': [1000, 8000],
                'SERVICES': [2000, 20000],
                'OTHER': [500, 5000]
            };
            
            const [min, max] = amounts[selectedCategory];
            const amount = min + Math.floor(Math.random() * (max - min));
            
            const notes: Record<string, string[]> = {
                'FREIGHT': ['Flete distribuidora', 'Flete proveedor', 'Envío mercadería'],
                'SUPPLIES': ['Bolsas', 'Limpieza', 'Packaging', 'Insumos varios'],
                'SERVICES': ['Luz', 'Gas', 'Internet', 'Agua', 'Contadora'],
                'OTHER': ['Gastos varios', 'Mantenimiento', 'Otros']
            };
            
            const noteOptions = notes[selectedCategory];
            const note = noteOptions[Math.floor(Math.random() * noteOptions.length)];
            
            expenses.push({
                id: `exp-ext-${expenseId}`,
                cashRegisterId: `cash-day-${daysAgo}`,
                amount,
                category: selectedCategory,
                paymentMethod,
                notes: note,
                userId: user.id,
                userName: user.name,
                createdAt: expenseDate
            });
            
            expenseId++;
        }
    }
    
    return expenses;
}

// Export the generated data
export const extendedSales = generateExtendedSales();
export const extendedCashRegisters = generateCashRegisterHistory();
export const extendedExpenses = generateExpenseHistory();

// Get all sales (extended + original mock for today)
export function getAllSales(): Sale[] {
    return extendedSales;
}

// Get all cash registers
export function getAllCashRegisters(): CashRegister[] {
    return extendedCashRegisters;
}

// Get all expenses
export function getAllExpenses(): Expense[] {
    return extendedExpenses;
}
