// ================================
// PERMISSIONS SYSTEM
// Sistema de Gestión Comercial
// ================================

import type { Role, BusinessConfig } from '../types';

// Permission actions
export type Permission =
    // Dashboard
    | 'VIEW_DASHBOARD'
    | 'VIEW_DASHBOARD_FULL'

    // POS
    | 'ACCESS_POS'
    | 'SELL'
    | 'EDIT_SALE_PRICES'

    // Cash Register
    | 'VIEW_CASH_REGISTER'
    | 'OPEN_CASH_REGISTER'
    | 'CLOSE_CASH_REGISTER'
    | 'REGISTER_EXPENSE'

    // Products
    | 'VIEW_PRODUCTS'
    | 'CREATE_PRODUCT'
    | 'EDIT_PRODUCT'
    | 'DELETE_PRODUCT'
    | 'VIEW_PRODUCT_COST'

    // Stock
    | 'VIEW_STOCK'
    | 'ADJUST_STOCK'

    // Clients
    | 'VIEW_CLIENTS'
    | 'CREATE_CLIENT'
    | 'EDIT_CLIENT'
    | 'DELETE_CLIENT'
    | 'VIEW_CLIENT_ACCOUNT'
    | 'REGISTER_PAYMENT'

    // Reports
    | 'VIEW_REPORTS'

    // Exports
    | 'EXPORT_DATA'

    // Users
    | 'VIEW_USERS'
    | 'MANAGE_USERS'

    // Settings
    | 'VIEW_SETTINGS'
    | 'EDIT_SETTINGS';

// Base permissions by role (before config overrides)
const BASE_PERMISSIONS: Record<Role, Permission[]> = {
    OWNER: [
        'VIEW_DASHBOARD',
        'VIEW_DASHBOARD_FULL',
        'ACCESS_POS',
        'SELL',
        'EDIT_SALE_PRICES',
        'VIEW_CASH_REGISTER',
        'OPEN_CASH_REGISTER',
        'CLOSE_CASH_REGISTER',
        'REGISTER_EXPENSE',
        'VIEW_PRODUCTS',
        'CREATE_PRODUCT',
        'EDIT_PRODUCT',
        'DELETE_PRODUCT',
        'VIEW_PRODUCT_COST',
        'VIEW_STOCK',
        'ADJUST_STOCK',
        'VIEW_CLIENTS',
        'CREATE_CLIENT',
        'EDIT_CLIENT',
        'DELETE_CLIENT',
        'VIEW_CLIENT_ACCOUNT',
        'REGISTER_PAYMENT',
        'VIEW_REPORTS',
        'EXPORT_DATA',
        'VIEW_USERS',
        'MANAGE_USERS',
        'VIEW_SETTINGS',
        'EDIT_SETTINGS',
    ],

    EMPLOYEE: [
        'VIEW_DASHBOARD',
        'ACCESS_POS',
        'SELL',
        'VIEW_CASH_REGISTER',
        'VIEW_PRODUCTS',
        'VIEW_STOCK',
        'VIEW_CLIENTS',
        'CREATE_CLIENT',
        'VIEW_CLIENT_ACCOUNT',
        'REGISTER_PAYMENT',
    ],

    ACCOUNTANT: [
        'VIEW_DASHBOARD',
        'VIEW_PRODUCTS',
        'VIEW_STOCK',
        'VIEW_CLIENTS',
        'VIEW_CLIENT_ACCOUNT',
        'VIEW_REPORTS',
        'EXPORT_DATA',
        'VIEW_CASH_REGISTER',
    ],
};

/**
 * Get permissions for a role, considering business config overrides
 */
export function getPermissions(role: Role, config: BusinessConfig): Permission[] {
    const basePermissions = [...BASE_PERMISSIONS[role]];

    if (role === 'EMPLOYEE') {
        // Apply config-based permission overrides for employees
        if (config.employeeCanEditPrices) {
            basePermissions.push('EDIT_SALE_PRICES');
        }

        if (config.employeeCanAdjustStock) {
            basePermissions.push('ADJUST_STOCK');
        }

        if (config.showCostsToEmployee) {
            basePermissions.push('VIEW_PRODUCT_COST');
        }
    }

    if (role === 'ACCOUNTANT') {
        if (config.showCostsToAccountant) {
            basePermissions.push('VIEW_PRODUCT_COST');
        }
    }

    return basePermissions;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
    role: Role,
    permission: Permission,
    config: BusinessConfig
): boolean {
    const permissions = getPermissions(role, config);
    return permissions.includes(permission);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
    const names: Record<Role, string> = {
        OWNER: 'Dueño',
        EMPLOYEE: 'Empleado',
        ACCOUNTANT: 'Contador',
    };
    return names[role];
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: Role): string {
    const colors: Record<Role, string> = {
        OWNER: 'var(--color-primary-600)',
        EMPLOYEE: 'var(--color-success-600)',
        ACCOUNTANT: 'var(--color-warning-600)',
    };
    return colors[role];
}
