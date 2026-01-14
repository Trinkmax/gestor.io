// ================================
// PRODUCTS SERVICE
// Sistema de Gestión Comercial
// ================================

import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';

// ========== PRODUCTS ==========

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true)
        .order('name');

    if (error) throw error;

    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        code: p.code || undefined,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        stock: p.stock,
        minStock: p.min_stock || undefined,
        isActive: p.is_active || true,
        categoryId: p.category_id || undefined,
        createdAt: new Date(p.created_at || ''),
        updatedAt: new Date(p.updated_at || ''),
    }));
}

export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        code: data.code || undefined,
        price: Number(data.price),
        cost: data.cost ? Number(data.cost) : undefined,
        stock: data.stock,
        minStock: data.min_stock || undefined,
        isActive: data.is_active || true,
        categoryId: data.category_id || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
    };
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            code: product.code,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            min_stock: product.minStock,
            is_active: product.isActive,
            category_id: product.categoryId,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        code: data.code || undefined,
        price: Number(data.price),
        cost: data.cost ? Number(data.cost) : undefined,
        stock: data.stock,
        minStock: data.min_stock || undefined,
        isActive: data.is_active || true,
        categoryId: data.category_id || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
    };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .update({
            name: updates.name,
            code: updates.code,
            price: updates.price,
            cost: updates.cost,
            stock: updates.stock,
            min_stock: updates.minStock,
            is_active: updates.isActive,
            category_id: updates.categoryId,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        code: data.code || undefined,
        price: Number(data.price),
        cost: data.cost ? Number(data.cost) : undefined,
        stock: data.stock,
        minStock: data.min_stock || undefined,
        isActive: data.is_active || true,
        categoryId: data.category_id || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || ''),
    };
}

export async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .order('name')
        .limit(20);

    if (error) throw error;

    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        code: p.code || undefined,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        stock: p.stock,
        minStock: p.min_stock || undefined,
        isActive: p.is_active || true,
        categoryId: p.category_id || undefined,
        createdAt: new Date(p.created_at || ''),
        updatedAt: new Date(p.updated_at || ''),
    }));
}

export async function getLowStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('min_stock', 'is', null)
        .filter('stock', 'lte', 'min_stock')
        .order('stock');

    if (error) throw error;

    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        code: p.code || undefined,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        stock: p.stock,
        minStock: p.min_stock || undefined,
        isActive: p.is_active || true,
        categoryId: p.category_id || undefined,
        createdAt: new Date(p.created_at || ''),
        updatedAt: new Date(p.updated_at || ''),
    }));
}

// ========== CATEGORIES ==========

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;

    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        color: c.color || undefined,
    }));
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: category.name,
            color: category.color,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        color: data.color || undefined,
    };
}

