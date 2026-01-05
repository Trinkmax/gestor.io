// ================================
// MOCK CLIENTS DATA
// Sistema de Gestión Comercial
// ================================

import type { Client } from '../../types';

export const mockClients: Client[] = [
    {
        id: 'client-001',
        name: 'Juan Martínez',
        phone: '+54 11 5555-1234',
        email: 'juan.martinez@email.com',
        address: 'Av. Rivadavia 4500, CABA',
        balance: 15500, // Debe dinero
        notes: 'Cliente frecuente, paga semanalmente',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-12-20'),
        lastActivityAt: new Date('2024-12-28'),
    },
    {
        id: 'client-002',
        name: 'María López',
        phone: '+54 11 5555-5678',
        email: 'maria.lopez@email.com',
        balance: 0, // Sin deuda
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-11-15'),
        lastActivityAt: new Date('2024-11-15'),
    },
    {
        id: 'client-003',
        name: 'Roberto Sánchez',
        phone: '+54 11 5555-9012',
        balance: 45200, // Deuda alta
        notes: 'Deuda acumulada de varios meses',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-12-25'),
        lastActivityAt: new Date('2024-12-25'),
    },
    {
        id: 'client-004',
        name: 'Ana García',
        phone: '+54 11 5555-3456',
        email: 'ana.garcia@email.com',
        address: 'Calle Florida 123, CABA',
        balance: 8750,
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-12-15'),
        lastActivityAt: new Date('2024-12-15'),
    },
    {
        id: 'client-005',
        name: 'Carlos Fernández',
        phone: '+54 11 5555-7890',
        balance: -2500, // Saldo a favor (pagó de más)
        notes: 'Tiene saldo a favor',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-12-10'),
        lastActivityAt: new Date('2024-12-10'),
    },
    {
        id: 'client-006',
        name: 'Laura Díaz',
        phone: '+54 11 5555-1111',
        balance: 25800,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-22'),
        lastActivityAt: new Date('2024-12-22'),
    },
    {
        id: 'client-007',
        name: 'Pedro Ramírez',
        phone: '+54 11 5555-2222',
        email: 'pedro.ramirez@email.com',
        balance: 0,
        createdAt: new Date('2024-07-10'),
        updatedAt: new Date('2024-10-20'),
        lastActivityAt: new Date('2024-10-20'),
    },
    {
        id: 'client-008',
        name: 'Sofía Torres',
        phone: '+54 11 5555-3333',
        balance: 12300,
        notes: 'Paga cada 15 días',
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-12-28'),
        lastActivityAt: new Date('2024-12-28'),
    },
    {
        id: 'client-009',
        name: 'Miguel Ruiz',
        phone: '+54 11 5555-4444',
        balance: 3500,
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-12-05'),
        lastActivityAt: new Date('2024-12-05'),
    },
    {
        id: 'client-010',
        name: 'Lucía Moreno',
        phone: '+54 11 5555-5555',
        email: 'lucia.moreno@email.com',
        address: 'Av. Santa Fe 2000, CABA',
        balance: 0,
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-11-30'),
        lastActivityAt: new Date('2024-11-30'),
    },
];

// Helper to get debtors (clients with positive balance)
export function getDebtors(): Client[] {
    return mockClients.filter(c => c.balance > 0)
        .sort((a, b) => b.balance - a.balance);
}

// Helper to get total debt
export function getTotalDebt(): number {
    return mockClients
        .filter(c => c.balance > 0)
        .reduce((sum, c) => sum + c.balance, 0);
}
