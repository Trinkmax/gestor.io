// ================================
// CLIENTS SERVICE
// Sistema de Gestión Comercial
// ================================

import { supabase } from '../lib/supabase';
import type { Client, Payment, AccountMovement } from '../types';

// ========== CLIENTS ==========

export async function getClients(): Promise<Client[]> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

    if (error) throw error;

    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || undefined,
        email: c.email || undefined,
        address: c.address || undefined,
        balance: Number(c.balance),
        notes: c.notes || undefined,
        createdAt: new Date(c.created_at || ''),
        updatedAt: new Date(c.updated_at || ''),
        lastActivityAt: c.last_activity_at ? new Date(c.last_activity_at) : undefined,
    }));
}

export async function getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        balance: Number(data.balance),
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
        lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : undefined,
    };
}

export async function createClient(client: Omit<Client, 'id' | 'balance' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>): Promise<Client> {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: client.name,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        balance: Number(data.balance),
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
        lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : undefined,
    };
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
        .from('clients')
        .update({
            name: updates.name,
            phone: updates.phone,
            email: updates.email,
            address: updates.address,
            notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        balance: Number(data.balance),
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
        lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : undefined,
    };
}

export async function deleteClient(id: string): Promise<void> {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function getDebtors(): Promise<Client[]> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .gt('balance', 0)
        .order('balance', { ascending: false });

    if (error) throw error;

    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || undefined,
        email: c.email || undefined,
        address: c.address || undefined,
        balance: Number(c.balance),
        notes: c.notes || undefined,
        createdAt: new Date(c.created_at || ''),
        updatedAt: new Date(c.updated_at || ''),
        lastActivityAt: c.last_activity_at ? new Date(c.last_activity_at) : undefined,
    }));
}

// ========== PAYMENTS ==========

export async function createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const { data, error } = await supabase
        .from('payments')
        .insert({
            client_id: payment.clientId,
            client_name: payment.clientName,
            amount: payment.amount,
            payment_method: payment.paymentMethod,
            notes: payment.notes,
            user_id: payment.userId,
            user_name: payment.userName,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        amount: Number(data.amount),
        paymentMethod: data.payment_method as 'CASH' | 'TRANSFER',
        notes: data.notes || undefined,
        userId: data.user_id,
        userName: data.user_name,
        createdAt: new Date(data.created_at || ''),
    };
}

export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
        id: p.id,
        clientId: p.client_id,
        clientName: p.client_name,
        amount: Number(p.amount),
        paymentMethod: p.payment_method as 'CASH' | 'TRANSFER',
        notes: p.notes || undefined,
        userId: p.user_id,
        userName: p.user_name,
        createdAt: new Date(p.created_at || ''),
    }));
}

// ========== ACCOUNT MOVEMENTS ==========

export async function getAccountMovementsByClient(clientId: string): Promise<AccountMovement[]> {
    const { data, error } = await supabase
        .from('account_movements')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(m => ({
        id: m.id,
        clientId: m.client_id,
        type: m.type as 'SALE' | 'PAYMENT',
        referenceId: m.reference_id,
        referenceNumber: m.reference_number || undefined,
        amount: Number(m.amount),
        balance: Number(m.balance),
        notes: m.notes || undefined,
        createdAt: new Date(m.created_at || ''),
    }));
}

