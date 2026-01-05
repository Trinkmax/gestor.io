// ================================
// UI CONTEXT (Toasts, Modals, etc.)
// Sistema de Gestión Comercial
// ================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Toast, ConfirmDialogState } from '../types';
import { generateId } from '../mocks/generators';

interface UIContextType {
    // Toasts
    toasts: Toast[];
    showToast: (type: Toast['type'], message: string, duration?: number) => void;
    dismissToast: (id: string) => void;

    // Confirm dialog
    confirmDialog: ConfirmDialogState | null;
    showConfirm: (options: Omit<ConfirmDialogState, 'isOpen'>) => void;
    hideConfirm: () => void;

    // Loading overlay
    isLoading: boolean;
    showLoading: () => void;
    hideLoading: () => void;

    // Sidebar (for mobile)
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const showToast = useCallback((type: Toast['type'], message: string, duration: number = 4000) => {
        const id = generateId('toast');
        const toast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showConfirm = useCallback((options: Omit<ConfirmDialogState, 'isOpen'>) => {
        setConfirmDialog({ ...options, isOpen: true });
    }, []);

    const hideConfirm = useCallback(() => {
        setConfirmDialog(null);
    }, []);

    const showLoading = useCallback(() => setIsLoading(true), []);
    const hideLoading = useCallback(() => setIsLoading(false), []);

    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const value: UIContextType = {
        toasts,
        showToast,
        dismissToast,
        confirmDialog,
        showConfirm,
        hideConfirm,
        isLoading,
        showLoading,
        hideLoading,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI(): UIContextType {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
