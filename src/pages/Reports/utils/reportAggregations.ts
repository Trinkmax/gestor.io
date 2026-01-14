// ================================
// REPORT AGGREGATION UTILITIES
// Pure functions for data aggregation
// ================================

import type { Sale, Client, Product, CashRegister } from '../../../types';

// ========== DATE UTILITIES ==========

export interface DateRange {
    start: Date;
    end: Date;
}

export type DatePreset = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';
export type GroupByPeriod = 'day' | 'week' | 'month';

export function getDateRangeFromPreset(preset: DatePreset, customRange?: DateRange): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
        case '7d': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            return { start: weekAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        }
        case '30d': {
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 29);
            return { start: monthAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        }
        case 'month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: monthStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        }
        case 'year': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return { start: yearStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        }
        case 'custom':
            return customRange || { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        default:
            return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }
}

export function getPreviousPeriod(range: DateRange): DateRange {
    const duration = range.end.getTime() - range.start.getTime();
    return {
        start: new Date(range.start.getTime() - duration - 1),
        end: new Date(range.start.getTime() - 1)
    };
}

export function formatDateKey(date: Date, groupBy: GroupByPeriod): string {
    const d = new Date(date);
    switch (groupBy) {
        case 'day':
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        case 'week': {
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            return `Sem ${weekStart.getDate()}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        case 'month':
            return new Intl.DateTimeFormat('es-AR', { month: 'short', year: '2-digit' }).format(d);
        default:
            return d.toISOString().split('T')[0];
    }
}

// ========== SALES AGGREGATIONS ==========

export interface SalesTimeData {
    date: string;
    rawDate: Date;
    total: number;
    tickets: number;
    avgTicket: number;
    cash: number;
    transfer: number;
    card: number;
    credit: number;
}

export function groupSalesByPeriod(
    sales: Sale[],
    range: DateRange,
    groupBy: GroupByPeriod
): SalesTimeData[] {
    const filtered = sales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end;
    });
    
    const grouped = new Map<string, { total: number; tickets: number; cash: number; transfer: number; card: number; credit: number; rawDate: Date }>();
    
    // Generate all dates in range
    const current = new Date(range.start);
    while (current <= range.end) {
        const key = formatDateKey(current, groupBy);
        if (!grouped.has(key)) {
            grouped.set(key, { total: 0, tickets: 0, cash: 0, transfer: 0, card: 0, credit: 0, rawDate: new Date(current) });
        }
        current.setDate(current.getDate() + 1);
    }
    
    filtered.forEach(sale => {
        const key = formatDateKey(new Date(sale.createdAt), groupBy);
        const existing = grouped.get(key) || { total: 0, tickets: 0, cash: 0, transfer: 0, card: 0, credit: 0, rawDate: new Date(sale.createdAt) };
        existing.total += sale.total;
        existing.tickets += 1;
        switch (sale.paymentMethod) {
            case 'CASH': existing.cash += sale.total; break;
            case 'TRANSFER': existing.transfer += sale.total; break;
            case 'CARD': existing.card += sale.total; break;
            case 'CREDIT': existing.credit += sale.total; break;
        }
        grouped.set(key, existing);
    });
    
    return Array.from(grouped.entries())
        .map(([date, data]) => ({
            date,
            rawDate: data.rawDate,
            total: data.total,
            tickets: data.tickets,
            avgTicket: data.tickets > 0 ? Math.round(data.total / data.tickets) : 0,
            cash: data.cash,
            transfer: data.transfer,
            card: data.card,
            credit: data.credit
        }))
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
}

export interface SalesKPIs {
    totalRevenue: number;
    totalTickets: number;
    avgTicket: number;
    totalItems: number;
    creditPercentage: number;
    daysWithSales: number;
    estimatedMargin: number;
}

export function calculateSalesKPIs(sales: Sale[], products: Product[], range: DateRange): SalesKPIs {
    const filtered = sales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end;
    });
    
    const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
    const totalTickets = filtered.length;
    const avgTicket = totalTickets > 0 ? Math.round(totalRevenue / totalTickets) : 0;
    const totalItems = filtered.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.quantity, 0), 0);
    const creditTotal = filtered.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.total, 0);
    const creditPercentage = totalRevenue > 0 ? Math.round((creditTotal / totalRevenue) * 100) : 0;
    
    // Days with sales
    const uniqueDays = new Set(filtered.map(s => new Date(s.createdAt).toISOString().split('T')[0]));
    const daysWithSales = uniqueDays.size;
    
    // Estimated margin (calculate based on product costs)
    const productMap = new Map(products.map(p => [p.id, p]));
    let totalCost = 0;
    filtered.forEach(sale => {
        sale.items.forEach(item => {
            const product = productMap.get(item.productId);
            if (product?.cost) {
                totalCost += product.cost * item.quantity;
            }
        });
    });
    const estimatedMargin = totalRevenue > 0 && totalCost > 0 
        ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) 
        : 0;
    
    return {
        totalRevenue,
        totalTickets,
        avgTicket,
        totalItems,
        creditPercentage,
        daysWithSales,
        estimatedMargin
    };
}

export function calculateDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ========== PRODUCT AGGREGATIONS ==========

export interface TopProduct {
    id: string;
    name: string;
    revenue: number;
    units: number;
    margin?: number;
    marginPercentage?: number;
    trend?: number; // Sparkline data
}

export function getTopProducts(sales: Sale[], products: Product[], range: DateRange, limit: number = 10): TopProduct[] {
    const filtered = sales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end;
    });
    
    const productMap = new Map(products.map(p => [p.id, p]));
    const aggregated = new Map<string, { revenue: number; units: number; cost: number }>();
    
    filtered.forEach(sale => {
        sale.items.forEach(item => {
            const existing = aggregated.get(item.productId) || { revenue: 0, units: 0, cost: 0 };
            existing.revenue += item.subtotal;
            existing.units += item.quantity;
            const product = productMap.get(item.productId);
            if (product?.cost) {
                existing.cost += product.cost * item.quantity;
            }
            aggregated.set(item.productId, existing);
        });
    });
    
    return Array.from(aggregated.entries())
        .map(([id, data]) => {
            const product = productMap.get(id);
            const margin = data.revenue - data.cost;
            return {
                id,
                name: product?.name || 'Producto desconocido',
                revenue: data.revenue,
                units: data.units,
                margin: margin,
                marginPercentage: data.revenue > 0 ? Math.round((margin / data.revenue) * 100) : 0
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}

export function getTopProductsByMargin(sales: Sale[], products: Product[], range: DateRange, limit: number = 10): TopProduct[] {
    const topProducts = getTopProducts(sales, products, range, 50);
    return topProducts
        .filter(p => p.margin && p.margin > 0)
        .sort((a, b) => (b.margin || 0) - (a.margin || 0))
        .slice(0, limit);
}

// ========== CLIENT/DEBT AGGREGATIONS ==========

export interface DebtorData {
    id: string;
    name: string;
    phone?: string;
    balance: number;
    lastActivityAt?: Date;
    agingBucket: '0-7' | '8-15' | '16-30' | '30+';
    daysSinceActivity: number;
}

export function getAgingBucket(daysSinceActivity: number): '0-7' | '8-15' | '16-30' | '30+' {
    if (daysSinceActivity <= 7) return '0-7';
    if (daysSinceActivity <= 15) return '8-15';
    if (daysSinceActivity <= 30) return '16-30';
    return '30+';
}

export function getDebtorsWithAging(clients: Client[]): DebtorData[] {
    const now = new Date();
    
    return clients
        .filter(c => c.balance > 0)
        .map(c => {
            const lastActivity = c.lastActivityAt || c.createdAt;
            const daysSinceActivity = Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
            return {
                id: c.id,
                name: c.name,
                phone: c.phone,
                balance: c.balance,
                lastActivityAt: c.lastActivityAt,
                agingBucket: getAgingBucket(daysSinceActivity),
                daysSinceActivity
            };
        })
        .sort((a, b) => b.balance - a.balance);
}

export interface AgingBucketData {
    bucket: string;
    label: string;
    count: number;
    total: number;
    color: string;
}

export function getAgingDistribution(debtors: DebtorData[]): AgingBucketData[] {
    const buckets: Record<string, { count: number; total: number }> = {
        '0-7': { count: 0, total: 0 },
        '8-15': { count: 0, total: 0 },
        '16-30': { count: 0, total: 0 },
        '30+': { count: 0, total: 0 }
    };
    
    debtors.forEach(d => {
        buckets[d.agingBucket].count++;
        buckets[d.agingBucket].total += d.balance;
    });
    
    return [
        { bucket: '0-7', label: '0-7 días', ...buckets['0-7'], color: '#22c55e' },
        { bucket: '8-15', label: '8-15 días', ...buckets['8-15'], color: '#f59e0b' },
        { bucket: '16-30', label: '16-30 días', ...buckets['16-30'], color: '#f97316' },
        { bucket: '30+', label: '30+ días', ...buckets['30+'], color: '#ef4444' }
    ];
}

// ========== CASH REGISTER AGGREGATIONS ==========

export interface CashRegisterSummary {
    id: string;
    date: Date;
    openedBy: string;
    closedBy?: string;
    totalSales: number;
    totalExpenses: number;
    expectedCash: number;
    actualCash?: number;
    difference?: number;
    salesCount: number;
}

export function getCashRegisterHistory(registers: CashRegister[], range: DateRange): CashRegisterSummary[] {
    return registers
        .filter(r => {
            const d = new Date(r.openedAt);
            return d >= range.start && d <= range.end && r.isClosed;
        })
        .map(r => ({
            id: r.id,
            date: new Date(r.openedAt),
            openedBy: r.openedByName,
            closedBy: r.closedByName,
            totalSales: r.totalCash + r.totalTransfer + r.totalCard + r.totalCredit,
            totalExpenses: r.totalExpensesCash + r.totalExpensesTransfer,
            expectedCash: r.expectedAmount || (r.openingAmount + r.totalCash - r.totalExpensesCash),
            actualCash: r.closingAmount,
            difference: r.difference,
            salesCount: r.salesCount
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ========== HEATMAP DATA ==========

export interface HeatmapCell {
    dayOfWeek: number;
    dayLabel: string;
    hour: number;
    hourLabel: string;
    value: number;
    intensity: number; // 0-1 for coloring
}

export function getSalesHeatmap(sales: Sale[], range: DateRange): HeatmapCell[] {
    const filtered = sales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end;
    });
    
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const matrix: Record<string, number> = {};
    
    // Initialize all cells
    for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour <= 22; hour++) {
            matrix[`${day}-${hour}`] = 0;
        }
    }
    
    // Aggregate sales
    filtered.forEach(sale => {
        const d = new Date(sale.createdAt);
        const day = d.getDay();
        const hour = d.getHours();
        if (hour >= 8 && hour <= 22) {
            matrix[`${day}-${hour}`] += sale.total;
        }
    });
    
    const maxValue = Math.max(...Object.values(matrix), 1);
    
    const cells: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour <= 22; hour++) {
            const value = matrix[`${day}-${hour}`];
            cells.push({
                dayOfWeek: day,
                dayLabel: dayLabels[day],
                hour,
                hourLabel: `${hour}:00`,
                value,
                intensity: value / maxValue
            });
        }
    }
    
    return cells;
}

// ========== TICKET DISTRIBUTION ==========

export interface TicketDistribution {
    range: string;
    count: number;
    min: number;
    max: number;
}

export function getTicketDistribution(sales: Sale[], range: DateRange): TicketDistribution[] {
    const filtered = sales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end;
    });
    
    const ranges = [
        { min: 0, max: 1000, label: '$0-1K' },
        { min: 1000, max: 2500, label: '$1K-2.5K' },
        { min: 2500, max: 5000, label: '$2.5K-5K' },
        { min: 5000, max: 10000, label: '$5K-10K' },
        { min: 10000, max: 25000, label: '$10K-25K' },
        { min: 25000, max: Infinity, label: '$25K+' }
    ];
    
    return ranges.map(r => ({
        range: r.label,
        min: r.min,
        max: r.max,
        count: filtered.filter(s => s.total >= r.min && s.total < r.max).length
    }));
}

// ========== INSIGHTS GENERATION ==========

export interface Insight {
    id: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionPath?: string;
}

export function generateInsights(
    sales: Sale[],
    products: Product[],
    clients: Client[],
    range: DateRange
): Insight[] {
    const insights: Insight[] = [];
    const kpis = calculateSalesKPIs(sales, products, range);
    const topProducts = getTopProducts(sales, products, range, 3);
    const debtors = getDebtorsWithAging(clients);
    
    // Credit percentage insight
    if (kpis.creditPercentage > 30) {
        insights.push({
            id: 'high-credit',
            type: 'warning',
            icon: '⚠️',
            title: `Fiado representa ${kpis.creditPercentage}% del total`,
            description: 'Considerá revisar las políticas de crédito para reducir la exposición.',
            actionLabel: 'Ver deudores',
            actionPath: '/clientes?filter=debtors'
        });
    }
    
    // Top 3 products concentration
    const top3Revenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
    const top3Percentage = kpis.totalRevenue > 0 ? Math.round((top3Revenue / kpis.totalRevenue) * 100) : 0;
    if (top3Percentage > 50) {
        insights.push({
            id: 'product-concentration',
            type: 'info',
            icon: '📊',
            title: `Top 3 productos: ${top3Percentage}% de ventas`,
            description: `${topProducts.map(p => p.name).join(', ')} son los más vendidos.`,
            actionLabel: 'Ver productos',
            actionPath: '/productos'
        });
    }
    
    // Old debt warning
    const oldDebt = debtors.filter(d => d.agingBucket === '30+');
    if (oldDebt.length > 0) {
        const totalOldDebt = oldDebt.reduce((sum, d) => sum + d.balance, 0);
        insights.push({
            id: 'old-debt',
            type: 'alert',
            icon: '🚨',
            title: `${oldDebt.length} clientes con deuda +30 días`,
            description: `Total: $${totalOldDebt.toLocaleString('es-AR')} en riesgo de incobrabilidad.`,
            actionLabel: 'Ver deudores',
            actionPath: '/clientes?filter=debtors'
        });
    }
    
    // Low stock + top sellers
    const lowStockTopSellers = products.filter(p => 
        p.isActive && 
        p.minStock && 
        p.stock <= p.minStock && 
        topProducts.some(tp => tp.id === p.id)
    );
    if (lowStockTopSellers.length > 0) {
        insights.push({
            id: 'low-stock-top',
            type: 'warning',
            icon: '📦',
            title: `${lowStockTopSellers.length} productos top con stock bajo`,
            description: lowStockTopSellers.map(p => p.name).slice(0, 3).join(', '),
            actionLabel: 'Ver stock',
            actionPath: '/productos?filter=low-stock'
        });
    }
    
    // Margin insight
    if (kpis.estimatedMargin > 0) {
        insights.push({
            id: 'margin',
            type: kpis.estimatedMargin > 30 ? 'success' : 'info',
            icon: '💰',
            title: `Margen bruto estimado: ${kpis.estimatedMargin}%`,
            description: kpis.estimatedMargin > 30 
                ? 'Excelente rentabilidad en el período.'
                : 'Margen ajustado, revisar costos y precios.'
        });
    }
    
    return insights.slice(0, 5);
}

// ========== PAYMENT METHOD MIX OVER TIME ==========

export interface PaymentMixData {
    date: string;
    cash: number;
    cashPct: number;
    transfer: number;
    transferPct: number;
    card: number;
    cardPct: number;
    credit: number;
    creditPct: number;
    total: number;
}

export function getPaymentMixOverTime(sales: Sale[], range: DateRange, groupBy: GroupByPeriod): PaymentMixData[] {
    const timeData = groupSalesByPeriod(sales, range, groupBy);
    
    return timeData.map(d => {
        const total = d.cash + d.transfer + d.card + d.credit;
        return {
            date: d.date,
            cash: d.cash,
            cashPct: total > 0 ? Math.round((d.cash / total) * 100) : 0,
            transfer: d.transfer,
            transferPct: total > 0 ? Math.round((d.transfer / total) * 100) : 0,
            card: d.card,
            cardPct: total > 0 ? Math.round((d.card / total) * 100) : 0,
            credit: d.credit,
            creditPct: total > 0 ? Math.round((d.credit / total) * 100) : 0,
            total
        };
    });
}
