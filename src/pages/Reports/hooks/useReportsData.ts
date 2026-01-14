// ================================
// REPORTS HOOK - DATA FETCHING & STATE
// Custom hook for reports data management
// ================================

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Sale, Product, Client, CashRegister, Expense } from '../../../types';
import { mockProducts, mockCategories } from '../../../mocks/data/products';
import { mockClients } from '../../../mocks/data/clients';
import { getAllSales, getAllCashRegisters, getAllExpenses } from '../../../mocks/data/reportData';
import {
    getDateRangeFromPreset,
    getPreviousPeriod,
    calculateSalesKPIs,
    calculateDelta,
    groupSalesByPeriod,
    getTopProducts,
    getTopProductsByMargin,
    getDebtorsWithAging,
    getAgingDistribution,
    getCashRegisterHistory,
    getSalesHeatmap,
    getTicketDistribution,
    getPaymentMixOverTime,
    generateInsights,
} from '../utils/reportAggregations';
import type {
    DateRange,
    DatePreset,
    GroupByPeriod,
    SalesKPIs,
    SalesTimeData,
    TopProduct,
    DebtorData,
    AgingBucketData,
    CashRegisterSummary,
    HeatmapCell,
    TicketDistribution,
    PaymentMixData,
    Insight
} from '../utils/reportAggregations';

export type { DateRange, DatePreset, GroupByPeriod };

export interface ReportFilters {
    preset: DatePreset;
    customRange: DateRange | null;
    groupBy: GroupByPeriod;
    compareEnabled: boolean;
    paymentMethods: string[];
    includeCredit: boolean | 'only';
    userId?: string;
    categoryId?: string;
}

const defaultFilters: ReportFilters = {
    preset: '30d',
    customRange: null,
    groupBy: 'day',
    compareEnabled: true,
    paymentMethods: [],
    includeCredit: true
};

function getDefaultGroupBy(preset: DatePreset): GroupByPeriod {
    switch (preset) {
        case 'today':
        case '7d':
            return 'day';
        case '30d':
        case 'month':
            return 'day';
        case 'year':
            return 'month';
        default:
            return 'day';
    }
}

export function useReportsData() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Parse filters from URL
    const filters = useMemo<ReportFilters>(() => {
        const preset = (searchParams.get('preset') as DatePreset) || defaultFilters.preset;
        const groupBy = (searchParams.get('groupBy') as GroupByPeriod) || getDefaultGroupBy(preset);
        const compareEnabled = searchParams.get('compare') !== 'false';
        const paymentMethods = searchParams.get('payment')?.split(',').filter(Boolean) || [];
        const includeCredit = searchParams.get('credit') === 'only' 
            ? 'only' 
            : searchParams.get('credit') !== 'false';
        
        let customRange: DateRange | null = null;
        if (preset === 'custom') {
            const startStr = searchParams.get('start');
            const endStr = searchParams.get('end');
            if (startStr && endStr) {
                customRange = {
                    start: new Date(startStr),
                    end: new Date(endStr)
                };
            }
        }
        
        return {
            preset,
            customRange,
            groupBy,
            compareEnabled,
            paymentMethods,
            includeCredit,
            userId: searchParams.get('user') || undefined,
            categoryId: searchParams.get('category') || undefined
        };
    }, [searchParams]);
    
    // Update filters and URL
    const updateFilters = useCallback((updates: Partial<ReportFilters>) => {
        const newFilters = { ...filters, ...updates };
        
        // Auto-adjust groupBy when preset changes
        if (updates.preset && !updates.groupBy) {
            newFilters.groupBy = getDefaultGroupBy(updates.preset);
        }
        
        const params = new URLSearchParams();
        params.set('preset', newFilters.preset);
        params.set('groupBy', newFilters.groupBy);
        if (!newFilters.compareEnabled) params.set('compare', 'false');
        if (newFilters.paymentMethods.length > 0) params.set('payment', newFilters.paymentMethods.join(','));
        if (newFilters.includeCredit === false) params.set('credit', 'false');
        if (newFilters.includeCredit === 'only') params.set('credit', 'only');
        if (newFilters.userId) params.set('user', newFilters.userId);
        if (newFilters.categoryId) params.set('category', newFilters.categoryId);
        if (newFilters.customRange && newFilters.preset === 'custom') {
            params.set('start', newFilters.customRange.start.toISOString().split('T')[0]);
            params.set('end', newFilters.customRange.end.toISOString().split('T')[0]);
        }
        
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);
    
    const resetFilters = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);
    
    // Current and previous period ranges
    const dateRange = useMemo(() => 
        getDateRangeFromPreset(filters.preset, filters.customRange || undefined),
        [filters.preset, filters.customRange]
    );
    
    const previousRange = useMemo(() => 
        getPreviousPeriod(dateRange),
        [dateRange]
    );
    
    // Raw data (simulated fetch)
    const [rawData, setRawData] = useState<{
        sales: Sale[];
        products: Product[];
        clients: Client[];
        cashRegisters: CashRegister[];
        expenses: Expense[];
    } | null>(null);
    
    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        setError(null);
        
        // Simulate async fetch
        const timer = setTimeout(() => {
            if (!mounted) return;
            try {
                setRawData({
                    sales: getAllSales(),
                    products: mockProducts,
                    clients: mockClients,
                    cashRegisters: getAllCashRegisters(),
                    expenses: getAllExpenses()
                });
                setIsLoading(false);
            } catch {
                setError('Error cargando datos de reportes');
                setIsLoading(false);
            }
        }, 300);
        
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, []);
    
    // Filter sales based on filters
    const filteredSales = useMemo(() => {
        if (!rawData) return [];
        
        return rawData.sales.filter(sale => {
            // Date filter
            const saleDate = new Date(sale.createdAt);
            if (saleDate < dateRange.start || saleDate > dateRange.end) return false;
            
            // Payment method filter
            if (filters.paymentMethods.length > 0 && !filters.paymentMethods.includes(sale.paymentMethod)) {
                return false;
            }
            
            // Credit filter
            if (filters.includeCredit === false && sale.paymentMethod === 'CREDIT') {
                return false;
            }
            if (filters.includeCredit === 'only' && sale.paymentMethod !== 'CREDIT') {
                return false;
            }
            
            // User filter
            if (filters.userId && sale.userId !== filters.userId) {
                return false;
            }
            
            return true;
        });
    }, [rawData, dateRange, filters.paymentMethods, filters.includeCredit, filters.userId]);
    
    // Previous period sales for comparison
    const previousSales = useMemo(() => {
        if (!rawData || !filters.compareEnabled) return [];
        
        return rawData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= previousRange.start && saleDate <= previousRange.end;
        });
    }, [rawData, previousRange, filters.compareEnabled]);
    
    // KPIs with deltas
    const kpis = useMemo<{ current: SalesKPIs; previous: SalesKPIs; deltas: Record<keyof SalesKPIs, number> } | null>(() => {
        if (!rawData) return null;
        
        const current = calculateSalesKPIs(filteredSales, rawData.products, dateRange);
        const previous = calculateSalesKPIs(previousSales, rawData.products, previousRange);
        
        const deltas: Record<keyof SalesKPIs, number> = {
            totalRevenue: calculateDelta(current.totalRevenue, previous.totalRevenue),
            totalTickets: calculateDelta(current.totalTickets, previous.totalTickets),
            avgTicket: calculateDelta(current.avgTicket, previous.avgTicket),
            totalItems: calculateDelta(current.totalItems, previous.totalItems),
            creditPercentage: current.creditPercentage - previous.creditPercentage,
            daysWithSales: calculateDelta(current.daysWithSales, previous.daysWithSales),
            estimatedMargin: current.estimatedMargin - previous.estimatedMargin
        };
        
        return { current, previous, deltas };
    }, [rawData, filteredSales, previousSales, dateRange, previousRange]);
    
    // Time series data
    const timeSeriesData = useMemo<SalesTimeData[]>(() => {
        if (!rawData) return [];
        return groupSalesByPeriod(filteredSales, dateRange, filters.groupBy);
    }, [rawData, filteredSales, dateRange, filters.groupBy]);
    
    // Payment mix over time
    const paymentMixData = useMemo<PaymentMixData[]>(() => {
        if (!rawData) return [];
        return getPaymentMixOverTime(filteredSales, dateRange, filters.groupBy);
    }, [rawData, filteredSales, dateRange, filters.groupBy]);
    
    // Top products
    const topProducts = useMemo<TopProduct[]>(() => {
        if (!rawData) return [];
        return getTopProducts(filteredSales, rawData.products, dateRange, 10);
    }, [rawData, filteredSales, dateRange]);
    
    // Top products by margin
    const topProductsByMargin = useMemo<TopProduct[]>(() => {
        if (!rawData) return [];
        return getTopProductsByMargin(filteredSales, rawData.products, dateRange, 10);
    }, [rawData, filteredSales, dateRange]);
    
    // Debtors with aging
    const debtors = useMemo<DebtorData[]>(() => {
        if (!rawData) return [];
        return getDebtorsWithAging(rawData.clients);
    }, [rawData]);
    
    const agingDistribution = useMemo<AgingBucketData[]>(() => {
        return getAgingDistribution(debtors);
    }, [debtors]);
    
    // Cash register history
    const cashRegisterHistory = useMemo<CashRegisterSummary[]>(() => {
        if (!rawData) return [];
        return getCashRegisterHistory(rawData.cashRegisters, dateRange);
    }, [rawData, dateRange]);
    
    // Heatmap data
    const heatmapData = useMemo<HeatmapCell[]>(() => {
        if (!rawData) return [];
        return getSalesHeatmap(filteredSales, dateRange);
    }, [rawData, filteredSales, dateRange]);
    
    // Ticket distribution
    const ticketDistribution = useMemo<TicketDistribution[]>(() => {
        if (!rawData) return [];
        return getTicketDistribution(filteredSales, dateRange);
    }, [rawData, filteredSales, dateRange]);
    
    // Insights
    const insights = useMemo<Insight[]>(() => {
        if (!rawData) return [];
        return generateInsights(filteredSales, rawData.products, rawData.clients, dateRange);
    }, [rawData, filteredSales, dateRange]);
    
    // Expense aggregation
    const expensesByCategory = useMemo(() => {
        if (!rawData) return [];
        
        const filtered = rawData.expenses.filter(e => {
            const d = new Date(e.createdAt);
            return d >= dateRange.start && d <= dateRange.end;
        });
        
        const byCategory = new Map<string, { category: string; total: number; count: number }>();
        
        filtered.forEach(e => {
            const cat = e.category || 'OTHER';
            const existing = byCategory.get(cat) || { category: cat, total: 0, count: 0 };
            existing.total += e.amount;
            existing.count++;
            byCategory.set(cat, existing);
        });
        
        return Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
    }, [rawData, dateRange]);
    
    const totalExpenses = useMemo(() => {
        return expensesByCategory.reduce((sum, c) => sum + c.total, 0);
    }, [expensesByCategory]);
    
    return {
        // State
        isLoading,
        error,
        filters,
        dateRange,
        previousRange,
        
        // Actions
        updateFilters,
        resetFilters,
        
        // Computed data
        kpis,
        timeSeriesData,
        paymentMixData,
        topProducts,
        topProductsByMargin,
        debtors,
        agingDistribution,
        cashRegisterHistory,
        heatmapData,
        ticketDistribution,
        insights,
        expensesByCategory,
        totalExpenses,
        
        // Reference data
        products: rawData?.products || [],
        clients: rawData?.clients || [],
        categories: mockCategories,
        
        // Helpers
        totalDebt: debtors.reduce((sum, d) => sum + d.balance, 0)
    };
}
