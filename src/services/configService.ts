// ================================
// CONFIG SERVICE
// Sistema de Gestión Comercial
// ================================

import { supabase } from '../lib/supabase';
import type { BusinessConfig, User } from '../types';

// ========== BUSINESS CONFIG ==========

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export async function getBusinessConfig(): Promise<BusinessConfig> {
    const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .eq('id', CONFIG_ID)
        .single();

    if (error) throw error;

    return {
        businessName: data.business_name,
        businessPhone: data.business_phone || undefined,
        businessEmail: data.business_email || undefined,
        businessAddress: data.business_address || undefined,
        requireCashRegisterForSales: data.require_cash_register_for_sales || false,
        allowNegativeStock: data.allow_negative_stock || false,
        employeeCanEditPrices: data.employee_can_edit_prices || false,
        employeeCanAdjustStock: data.employee_can_adjust_stock || false,
        showCostsToEmployee: data.show_costs_to_employee || false,
        showCostsToAccountant: data.show_costs_to_accountant || false,
        allowCreditOverpayment: data.allow_credit_overpayment || false,
    };
}

export async function updateBusinessConfig(updates: Partial<BusinessConfig>): Promise<BusinessConfig> {
    const { data, error } = await supabase
        .from('business_config')
        .update({
            business_name: updates.businessName,
            business_phone: updates.businessPhone,
            business_email: updates.businessEmail,
            business_address: updates.businessAddress,
            require_cash_register_for_sales: updates.requireCashRegisterForSales,
            allow_negative_stock: updates.allowNegativeStock,
            employee_can_edit_prices: updates.employeeCanEditPrices,
            employee_can_adjust_stock: updates.employeeCanAdjustStock,
            show_costs_to_employee: updates.showCostsToEmployee,
            show_costs_to_accountant: updates.showCostsToAccountant,
            allow_credit_overpayment: updates.allowCreditOverpayment,
        })
        .eq('id', CONFIG_ID)
        .select()
        .single();

    if (error) throw error;

    return {
        businessName: data.business_name,
        businessPhone: data.business_phone || undefined,
        businessEmail: data.business_email || undefined,
        businessAddress: data.business_address || undefined,
        requireCashRegisterForSales: data.require_cash_register_for_sales || false,
        allowNegativeStock: data.allow_negative_stock || false,
        employeeCanEditPrices: data.employee_can_edit_prices || false,
        employeeCanAdjustStock: data.employee_can_adjust_stock || false,
        showCostsToEmployee: data.show_costs_to_employee || false,
        showCostsToAccountant: data.show_costs_to_accountant || false,
        allowCreditOverpayment: data.allow_credit_overpayment || false,
    };
}

// ========== USERS ==========

export async function getUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

    if (error) throw error;

    return (data || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        avatar: u.avatar || undefined,
        createdAt: new Date(u.created_at || ''),
        isActive: u.is_active || false,
    }));
}

export async function getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        avatar: data.avatar || undefined,
        createdAt: new Date(data.created_at || ''),
        isActive: data.is_active || false,
    };
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .insert({
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            is_active: user.isActive,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        avatar: data.avatar || undefined,
        createdAt: new Date(data.created_at || ''),
        isActive: data.is_active || false,
    };
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .update({
            name: updates.name,
            email: updates.email,
            role: updates.role,
            avatar: updates.avatar,
            is_active: updates.isActive,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        avatar: data.avatar || undefined,
        createdAt: new Date(data.created_at || ''),
        isActive: data.is_active || false,
    };
}

export async function deleteUser(id: string): Promise<void> {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

