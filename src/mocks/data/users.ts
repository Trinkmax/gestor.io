// ================================
// MOCK USERS DATA
// Sistema de Gestión Comercial
// ================================

import type { User } from '../../types';

export const mockUsers: User[] = [
    {
        id: 'user-owner-001',
        name: 'Carlos Rodríguez',
        email: 'carlos@negocio.com',
        role: 'OWNER',
        avatar: undefined,
        createdAt: new Date('2024-01-15'),
        isActive: true,
    },
    {
        id: 'user-employee-001',
        name: 'María González',
        email: 'maria@negocio.com',
        role: 'EMPLOYEE',
        avatar: undefined,
        createdAt: new Date('2024-03-20'),
        isActive: true,
    },
    {
        id: 'user-employee-002',
        name: 'Juan Pérez',
        email: 'juan@negocio.com',
        role: 'EMPLOYEE',
        avatar: undefined,
        createdAt: new Date('2024-06-01'),
        isActive: true,
    },
    {
        id: 'user-accountant-001',
        name: 'Laura Fernández',
        email: 'laura@contadora.com',
        role: 'ACCOUNTANT',
        avatar: undefined,
        createdAt: new Date('2024-02-10'),
        isActive: true,
    },
];
