// ================================
// CASH REGISTER SERVICE
// Sistema de Gestión Comercial
// ================================

import { supabase } from '../lib/supabase';
import type { CashRegister, Expense } from '../types';

// ========== CASH REGISTERS ==========

export async function getCashRegisters(): Promise<CashRegister[]> {
    const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .order('opened_at', { ascending: false })
        .limit(50);

    if (error) throw error;

    return (data || []).map(cr => ({
        id: cr.id,
        openingAmount: Number(cr.opening_amount),
        openingNotes: cr.opening_notes || undefined,
        openedBy: cr.opened_by,
        openedByName: cr.opened_by_name,
        openedAt: new Date(cr.opened_at || ''),
        closingAmount: cr.closing_amount ? Number(cr.closing_amount) : undefined,
        expectedAmount: cr.expected_amount ? Number(cr.expected_amount) : undefined,
        difference: cr.difference ? Number(cr.difference) : undefined,
        closingNotes: cr.closing_notes || undefined,
        closedBy: cr.closed_by || undefined,
        closedByName: cr.closed_by_name || undefined,
        closedAt: cr.closed_at ? new Date(cr.closed_at) : undefined,
        totalCash: Number(cr.total_cash || 0),
        totalTransfer: Number(cr.total_transfer || 0),
        totalCard: Number(cr.total_card || 0),
        totalCredit: Number(cr.total_credit || 0),
        totalExpensesCash: Number(cr.total_expenses_cash || 0),
        totalExpensesTransfer: Number(cr.total_expenses_transfer || 0),
        salesCount: cr.sales_count || 0,
        isClosed: cr.is_closed || false,
    }));
}

export async function getOpenCashRegister(): Promise<CashRegister | null> {
    const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('is_closed', false)
        .order('opened_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
    }
    if (!data) return null;

    return {
        id: data.id,
        openingAmount: Number(data.opening_amount),
        openingNotes: data.opening_notes || undefined,
        openedBy: data.opened_by,
        openedByName: data.opened_by_name,
        openedAt: new Date(data.opened_at || ''),
        closingAmount: data.closing_amount ? Number(data.closing_amount) : undefined,
        expectedAmount: data.expected_amount ? Number(data.expected_amount) : undefined,
        difference: data.difference ? Number(data.difference) : undefined,
        closingNotes: data.closing_notes || undefined,
        closedBy: data.closed_by || undefined,
        closedByName: data.closed_by_name || undefined,
        closedAt: data.closed_at ? new Date(data.closed_at) : undefined,
        totalCash: Number(data.total_cash || 0),
        totalTransfer: Number(data.total_transfer || 0),
        totalCard: Number(data.total_card || 0),
        totalCredit: Number(data.total_credit || 0),
        totalExpensesCash: Number(data.total_expenses_cash || 0),
        totalExpensesTransfer: Number(data.total_expenses_transfer || 0),
        salesCount: data.sales_count || 0,
        isClosed: data.is_closed || false,
    };
}

export async function openCashRegister(data: {
    openingAmount: number;
    openingNotes?: string;
    openedBy: string;
    openedByName: string;
}): Promise<CashRegister> {
    const { data: crData, error } = await supabase
        .from('cash_registers')
        .insert({
            opening_amount: data.openingAmount,
            opening_notes: data.openingNotes,
            opened_by: data.openedBy,
            opened_by_name: data.openedByName,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: crData.id,
        openingAmount: Number(crData.opening_amount),
        openingNotes: crData.opening_notes || undefined,
        openedBy: crData.opened_by,
        openedByName: crData.opened_by_name,
        openedAt: new Date(crData.opened_at || ''),
        totalCash: Number(crData.total_cash || 0),
        totalTransfer: Number(crData.total_transfer || 0),
        totalCard: Number(crData.total_card || 0),
        totalCredit: Number(crData.total_credit || 0),
        totalExpensesCash: Number(crData.total_expenses_cash || 0),
        totalExpensesTransfer: Number(crData.total_expenses_transfer || 0),
        salesCount: crData.sales_count || 0,
        isClosed: crData.is_closed || false,
    };
}

export async function closeCashRegister(data: {
    id: string;
    closingAmount: number;
    closingNotes?: string;
    closedBy: string;
    closedByName: string;
}): Promise<CashRegister> {
    // Get current cash register to calculate expected amount
    const { data: current, error: fetchError } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('id', data.id)
        .single();

    if (fetchError) throw fetchError;

    const expectedAmount = 
        Number(current.opening_amount) +
        Number(current.total_cash || 0) -
        Number(current.total_expenses_cash || 0);

    const difference = data.closingAmount - expectedAmount;

    const { data: crData, error } = await supabase
        .from('cash_registers')
        .update({
            closing_amount: data.closingAmount,
            expected_amount: expectedAmount,
            difference: difference,
            closing_notes: data.closingNotes,
            closed_by: data.closedBy,
            closed_by_name: data.closedByName,
            closed_at: new Date().toISOString(),
            is_closed: true,
        })
        .eq('id', data.id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: crData.id,
        openingAmount: Number(crData.opening_amount),
        openingNotes: crData.opening_notes || undefined,
        openedBy: crData.opened_by,
        openedByName: crData.opened_by_name,
        openedAt: new Date(crData.opened_at || ''),
        closingAmount: Number(crData.closing_amount),
        expectedAmount: Number(crData.expected_amount),
        difference: Number(crData.difference),
        closingNotes: crData.closing_notes || undefined,
        closedBy: crData.closed_by || undefined,
        closedByName: crData.closed_by_name || undefined,
        closedAt: new Date(crData.closed_at || ''),
        totalCash: Number(crData.total_cash || 0),
        totalTransfer: Number(crData.total_transfer || 0),
        totalCard: Number(crData.total_card || 0),
        totalCredit: Number(crData.total_credit || 0),
        totalExpensesCash: Number(crData.total_expenses_cash || 0),
        totalExpensesTransfer: Number(crData.total_expenses_transfer || 0),
        salesCount: crData.sales_count || 0,
        isClosed: true,
    };
}

// ========== EXPENSES ==========

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            cash_register_id: expense.cashRegisterId,
            amount: expense.amount,
            category: expense.category,
            payment_method: expense.paymentMethod,
            notes: expense.notes,
            user_id: expense.userId,
            user_name: expense.userName,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        cashRegisterId: data.cash_register_id,
        amount: Number(data.amount),
        category: data.category as any,
        paymentMethod: data.payment_method as 'CASH' | 'TRANSFER',
        notes: data.notes || undefined,
        userId: data.user_id,
        userName: data.user_name,
        createdAt: new Date(data.created_at || ''),
    };
}

export async function getExpensesByCashRegister(cashRegisterId: string): Promise<Expense[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('cash_register_id', cashRegisterId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(e => ({
        id: e.id,
        cashRegisterId: e.cash_register_id,
        amount: Number(e.amount),
        category: e.category as any,
        paymentMethod: e.payment_method as 'CASH' | 'TRANSFER',
        notes: e.notes || undefined,
        userId: e.user_id,
        userName: e.user_name,
        createdAt: new Date(e.created_at || ''),
    }));
}

