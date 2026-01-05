// ================================
// BUTTON COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import './Button.css';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'warning'
    | 'outline-primary'
    | 'outline-danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    isIcon?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isIcon = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        isLoading && 'btn-loading',
        isIcon && 'btn-icon',
        fullWidth && 'btn-block',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {leftIcon && !isLoading && <span className="btn-icon-left">{leftIcon}</span>}
            {children}
            {rightIcon && !isLoading && <span className="btn-icon-right">{rightIcon}</span>}
        </button>
    );
}
