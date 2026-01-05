// ================================
// BADGE COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import './Badge.css';

export type BadgeVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'solid-primary'
    | 'solid-success'
    | 'solid-warning'
    | 'solid-danger'
    | 'outline-primary'
    | 'outline-success'
    | 'outline-warning'
    | 'outline-danger';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    withDot?: boolean;
    pulse?: boolean;
    className?: string;
}

export function Badge({
    children,
    variant = 'secondary',
    size = 'md',
    withDot = false,
    pulse = false,
    className = '',
}: BadgeProps) {
    const classes = [
        'badge',
        `badge-${variant}`,
        size !== 'md' && `badge-${size}`,
        pulse && 'badge-pulse',
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {withDot && <span className="badge-dot" />}
            {children}
        </span>
    );
}
