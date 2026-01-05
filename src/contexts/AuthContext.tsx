// ================================
// AUTH CONTEXT
// Sistema de Gestión Comercial
// ================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User, Role, BusinessConfig } from '../types';
import { hasPermission as checkPermission, getPermissions, type Permission } from '../utils/permissions';
import { mockUsers } from '../mocks/data/users';
import { defaultBusinessConfig } from '../mocks/data/config';

interface AuthContextType {
    currentUser: User | null;
    businessConfig: BusinessConfig;
    isAuthenticated: boolean;

    // Permission helpers
    hasPermission: (permission: Permission) => boolean;
    permissions: Permission[];

    // Auth actions (mock)
    login: (userId: string) => void;
    logout: () => void;

    // Role switching (for testing only)
    switchRole: (role: Role) => void;

    // Config management
    updateBusinessConfig: (updates: Partial<BusinessConfig>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Start with the owner user for testing
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId) {
            return mockUsers.find(u => u.id === savedUserId) || mockUsers[0];
        }
        return mockUsers[0]; // Default to owner
    });

    const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
        const savedConfig = localStorage.getItem('businessConfig');
        if (savedConfig) {
            try {
                return JSON.parse(savedConfig);
            } catch {
                return defaultBusinessConfig;
            }
        }
        return defaultBusinessConfig;
    });

    const isAuthenticated = currentUser !== null;

    const permissions = useMemo(() => {
        if (!currentUser) return [];
        return getPermissions(currentUser.role, businessConfig);
    }, [currentUser, businessConfig]);

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        return checkPermission(currentUser.role, permission, businessConfig);
    }, [currentUser, businessConfig]);

    const login = useCallback((userId: string) => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUserId', userId);
        }
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('currentUserId');
    }, []);

    // For testing: switch role of current user
    const switchRole = useCallback((role: Role) => {
        const userWithRole = mockUsers.find(u => u.role === role);
        if (userWithRole) {
            setCurrentUser(userWithRole);
            localStorage.setItem('currentUserId', userWithRole.id);
        }
    }, []);

    const updateBusinessConfig = useCallback((updates: Partial<BusinessConfig>) => {
        setBusinessConfig(prev => {
            const newConfig = { ...prev, ...updates };
            localStorage.setItem('businessConfig', JSON.stringify(newConfig));
            return newConfig;
        });
    }, []);

    const value: AuthContextType = {
        currentUser,
        businessConfig,
        isAuthenticated,
        hasPermission,
        permissions,
        login,
        logout,
        switchRole,
        updateBusinessConfig,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
