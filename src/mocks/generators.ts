// ================================
// MOCK DATA GENERATORS
// Sistema de Gestión Comercial
// ================================

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate sequential number
let saleNumberCounter = 1005;
export function generateSaleNumber(): number {
    return ++saleNumberCounter;
}

// Simulate async delay (for loading states)
export function delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Random delay between min and max
export function randomDelay(min: number = 200, max: number = 500): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(ms);
}

// Format currency as Argentine Peso
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date in Spanish
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

// Format date and time
export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Format time only
export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Format relative date (today, yesterday, etc.)
export function formatRelativeDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(date);
}

// Payment method display names
export const paymentMethodNames: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
    CREDIT: 'Fiado',
};

// Expense category display names
export const expenseCategoryNames: Record<string, string> = {
    FREIGHT: 'Flete',
    SUPPLIES: 'Insumos',
    SERVICES: 'Servicios',
    OTHER: 'Otros',
};

// Parse numeric input (handles comma as decimal separator)
export function parseNumericInput(value: string): number {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

// Validate required string
export function isValidString(value: string | undefined | null, minLength: number = 1): boolean {
    return typeof value === 'string' && value.trim().length >= minLength;
}

// Validate positive number
export function isPositiveNumber(value: number | undefined | null): boolean {
    return typeof value === 'number' && value > 0 && isFinite(value);
}

// Validate non-negative number
export function isNonNegativeNumber(value: number | undefined | null): boolean {
    return typeof value === 'number' && value >= 0 && isFinite(value);
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
