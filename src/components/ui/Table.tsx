// ================================
// TABLE COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';
import { Package } from 'lucide-react';
import './Table.css';

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyTitle?: string;
    emptyMessage?: string;
    emptyAction?: React.ReactNode;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    isLoading,
    emptyTitle = 'No hay datos',
    emptyMessage = 'No se encontraron registros para mostrar.',
    emptyAction,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} style={{ width: col.width }}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="table-skeleton">
                                {columns.map((col, j) => (
                                    <td key={col.key}>
                                        <div className={`skeleton ${j === 0 ? 'skeleton-lg' : 'skeleton-sm'}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="table-empty">
                <Package size={48} className="table-empty-icon" />
                <h3 className="table-empty-title">{emptyTitle}</h3>
                <p className="table-empty-message">{emptyMessage}</p>
                {emptyAction}
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className={`table ${onRowClick ? 'table-clickable' : ''}`}>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={col.align ? `text-${col.align}` : ''}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    className={col.align ? `text-${col.align}` : ''}
                                >
                                    {col.render
                                        ? col.render(item)
                                        : String((item as any)[col.key] ?? '')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Status Badge for tables
export interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'warning' | 'danger';
    label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    return (
        <span className={`table-status ${status}`}>
            {label}
        </span>
    );
}

// Filter Pills
export interface FilterPillProps {
    label: string;
    isActive: boolean;
    count?: number;
    onClick: () => void;
}

export function FilterPill({ label, isActive, count, onClick }: FilterPillProps) {
    return (
        <button
            type="button"
            className={`filter-pill ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {label}
            {count !== undefined && <span>({count})</span>}
        </button>
    );
}
