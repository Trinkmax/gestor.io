// ================================
// MOCK BUSINESS CONFIG
// Sistema de Gestión Comercial
// ================================

import type { BusinessConfig } from '../../types';

export const defaultBusinessConfig: BusinessConfig = {
    // Business info
    businessName: 'Mi Comercio',
    businessPhone: '+54 11 1234-5678',
    businessEmail: 'contacto@micomercio.com',
    businessAddress: 'Av. Corrientes 1234, CABA',

    // Operational settings
    requireCashRegisterForSales: true,
    allowNegativeStock: true, // Warn but allow by default
    employeeCanEditPrices: false,
    employeeCanAdjustStock: false,
    showCostsToEmployee: false,
    showCostsToAccountant: true,
    allowCreditOverpayment: true, // Allow saldo a favor
};
