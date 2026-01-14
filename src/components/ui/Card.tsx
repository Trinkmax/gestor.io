// ================================
// CARD COMPONENTS
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import { TrendingUp, TrendingDown, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import './Card.css';

// Base Card
export interface CardProps {
    children: React.ReactNode;
    className?: string;
    shadow?: boolean;
}

export function Card({ children, className = '', shadow = false }: CardProps) {
    return (
        <div className={`card ${shadow ? 'card-shadow' : ''} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    subtitle,
    actions
}: {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className="card-header">
            <div>
                <h3 className="card-title">{title}</h3>
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="card-actions">{actions}</div>}
        </div>
    );
}

export function CardBody({
    children,
    compact = false,
    noPadding = false,
}: {
    children: React.ReactNode;
    compact?: boolean;
    noPadding?: boolean;
}) {
    const className = noPadding ? 'card-body-none' :
        compact ? 'card-body-compact' :
            'card-body';
    return <div className={className}>{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
    return <div className="card-footer">{children}</div>;
}

// Stat Card
export interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    iconColor?: 'primary' | 'success' | 'warning' | 'danger';
    change?: {
        value: number;
        label?: string;
    };
    onClick?: () => void;
    hint?: string;
}

export function StatCard({ label, value, icon, iconColor = 'primary', change, onClick, hint }: StatCardProps) {
    const Component = onClick ? 'button' : 'div';
    
    return (
        <Component 
            className={`card stat-card ${onClick ? 'stat-card-clickable' : ''}`}
            onClick={onClick}
            type={onClick ? 'button' : undefined}
            aria-label={onClick ? `${label}: ${value}. Clic para ver más.` : undefined}
        >
            <div className="stat-card-header">
                <div>
                    <p className="stat-card-label">{label}</p>
                    <p className="stat-card-value">{value}</p>
                    {change && (
                        <span className={`stat-card-change ${change.value >= 0 ? 'positive' : 'negative'}`}>
                            {change.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {change.value >= 0 ? '+' : ''}{change.value}%
                            {change.label && <span> {change.label}</span>}
                        </span>
                    )}
                    {hint && <p className="stat-card-hint">{hint}</p>}
                </div>
                {icon && (
                    <div className={`stat-card-icon ${iconColor}`}>
                        {icon}
                    </div>
                )}
            </div>
        </Component>
    );
}


// Alert Card
export interface AlertCardProps {
    type: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    message: string;
    action?: React.ReactNode;
}

const alertIcons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
};

export function AlertCard({ type, title, message, action }: AlertCardProps) {
    const Icon = alertIcons[type];

    return (
        <div className={`alert-card ${type}`}>
            <Icon size={20} className="alert-card-icon" />
            <div className="alert-card-content">
                {title && <h4 className="alert-card-title">{title}</h4>}
                <p className="alert-card-message">{message}</p>
            </div>
            {action}
        </div>
    );
}
