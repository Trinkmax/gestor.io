// ================================
// SKELETON COMPONENT
// Sistema de Gestión Comercial
// ================================

import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circle' | 'rectangle';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function Skeleton({ 
    variant = 'text', 
    width, 
    height, 
    className = '' 
}: SkeletonProps) {
    const style: React.CSSProperties = {
        width: width || (variant === 'circle' ? '40px' : '100%'),
        height: height || (variant === 'circle' ? '40px' : variant === 'text' ? '1em' : '100px'),
    };

    const variantClass = variant === 'circle' ? 'skeleton-circle' : '';

    return (
        <div 
            className={`skeleton ${variantClass} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

// Table Skeleton Row
interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="table-skeleton-row">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex}>
                            <Skeleton 
                                variant="text" 
                                width={colIndex === 0 ? '80%' : '60%'} 
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="card" aria-hidden="true">
            <div className="card-body">
                <Skeleton variant="text" width="40%" height="1.5em" className="mb-4" />
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton 
                        key={i} 
                        variant="text" 
                        width={i === lines - 1 ? '70%' : '100%'} 
                        className="mb-2"
                    />
                ))}
            </div>
        </div>
    );
}
