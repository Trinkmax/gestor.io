// ================================
// SUPABASE CLIENT CONFIGURATION
// Sistema de Gestión Comercial
// ================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tucxkgscnrahclaeudgs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3hrZ3NjbnJhaGNsYWV1ZGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODY3NTcsImV4cCI6MjA2NzY2Mjc1N30.yHdUB407k-T9Bbw6VHMgXGM-tSljpG-PHWNA7AZkKpg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
    if (error?.message) {
        return error.message;
    }
    return 'Ha ocurrido un error inesperado';
}

