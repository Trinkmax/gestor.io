// ================================
// PERMISSION GATE COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Permission } from '../../utils/permissions';

interface PermissionGateProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showLocked?: boolean;
}

/**
 * Wrapper component that shows children only if user has permission.
 * Can optionally show a "locked" indicator for unauthorized users.
 */
export function PermissionGate({
    permission,
    children,
    fallback = null,
    showLocked = false,
}: PermissionGateProps) {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    if (showLocked) {
        return (
            <div
                className="permission-locked"
                title="No autorizado"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'not-allowed',
                }}
            >
                <Lock size={14} />
                <span>No autorizado</span>
            </div>
        );
    }

    return <>{fallback}</>;
}

/**
 * Hook to check if an action is allowed
 */
export function usePermission(permission: Permission): boolean {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
}
