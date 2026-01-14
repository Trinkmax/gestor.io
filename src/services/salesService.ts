// ================================
// SALES SERVICE
// Sistema de Gestión Comercial
// ================================

import { supabase } from '../lib/supabase';
import type { Sale } from '../types';

// ========== SALES ==========

export async function getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw error;

    return (data || []).map(s => ({
        id: s.id,
        number: s.number,
        items: (s.sale_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productCode: item.product_code || undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        total: Number(s.total),
        paymentMethod: s.payment_method as any,
        clientId: s.client_id || undefined,
        clientName: s.client_name || undefined,
        cashRegisterId: s.cash_register_id,
        userId: s.user_id,
        userName: s.user_name,
        notes: s.notes || undefined,
        createdAt: new Date(s.created_at || ''),
    }));
}

export async function getSaleById(id: string): Promise<Sale | null> {
    const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id,
        number: data.number,
        items: (data.sale_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productCode: item.product_code || undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        total: Number(data.total),
        paymentMethod: data.payment_method as any,
        clientId: data.client_id || undefined,
        clientName: data.client_name || undefined,
        cashRegisterId: data.cash_register_id,
        userId: data.user_id,
        userName: data.user_name,
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at || ''),
    };
}

export async function createSale(sale: Omit<Sale, 'id' | 'number' | 'createdAt'>): Promise<Sale> {
    // Get next sale number
    const { data: nextNumber, error: numberError } = await supabase
        .rpc('get_next_sale_number');

    if (numberError) throw numberError;

    // Create sale
    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
            number: nextNumber,
            total: sale.total,
            payment_method: sale.paymentMethod,
            client_id: sale.clientId,
            client_name: sale.clientName,
            cash_register_id: sale.cashRegisterId,
            user_id: sale.userId,
            user_name: sale.userName,
            notes: sale.notes,
        })
        .select()
        .single();

    if (saleError) throw saleError;

    // Create sale items
    const saleItems = sale.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productCode,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
    }));

    const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)
        .select();

    if (itemsError) throw itemsError;

    return {
        id: saleData.id,
        number: saleData.number,
        items: (itemsData || []).map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productCode: item.product_code || undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        total: Number(saleData.total),
        paymentMethod: saleData.payment_method as any,
        clientId: saleData.client_id || undefined,
        clientName: saleData.client_name || undefined,
        cashRegisterId: saleData.cash_register_id,
        userId: saleData.user_id,
        userName: saleData.user_name,
        notes: saleData.notes || undefined,
        createdAt: new Date(saleData.created_at || ''),
    };
}

export async function getSalesByCashRegister(cashRegisterId: string): Promise<Sale[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('cash_register_id', cashRegisterId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(s => ({
        id: s.id,
        number: s.number,
        items: (s.sale_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productCode: item.product_code || undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        total: Number(s.total),
        paymentMethod: s.payment_method as any,
        clientId: s.client_id || undefined,
        clientName: s.client_name || undefined,
        cashRegisterId: s.cash_register_id,
        userId: s.user_id,
        userName: s.user_name,
        notes: s.notes || undefined,
        createdAt: new Date(s.created_at || ''),
    }));
}

export async function getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(s => ({
        id: s.id,
        number: s.number,
        items: (s.sale_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productCode: item.product_code || undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
        })),
        total: Number(s.total),
        paymentMethod: s.payment_method as any,
        clientId: s.client_id || undefined,
        clientName: s.client_name || undefined,
        cashRegisterId: s.cash_register_id,
        userId: s.user_id,
        userName: s.user_name,
        notes: s.notes || undefined,
        createdAt: new Date(s.created_at || ''),
    }));
}

