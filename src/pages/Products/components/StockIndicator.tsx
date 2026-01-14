// ================================
// STOCK INDICATOR
// Indicador visual de stock con barra de progreso
// ================================

import { AlertTriangle } from 'lucide-react';

interface StockIndicatorProps {
    current: number;
    min?: number;
    showBar?: boolean;
    compact?: boolean;
}

export function StockIndicator({ current, min, showBar = true, compact = false }: StockIndicatorProps) {
    const isLow = min !== undefined && current <= min;
    const percentage = min !== undefined && min > 0 ? Math.min((current / (min * 2)) * 100, 100) : 100;

    return (
        <div className={`stock-indicator ${compact ? 'stock-indicator-compact' : ''}`}>
            <div className="stock-indicator-value">
                <span className={isLow ? 'text-danger font-semibold' : ''}>
                    {current}
                </span>
                {min !== undefined && (
                    <span className="text-tertiary text-xs"> / mín {min}</span>
                )}
                {isLow && <AlertTriangle size={14} className="text-warning" />}
            </div>
            {showBar && min !== undefined && (
                <div className="stock-indicator-bar">
                    <div
                        className={`stock-indicator-bar-fill ${
                            percentage < 50 ? 'stock-indicator-bar-low' : 
                            percentage < 80 ? 'stock-indicator-bar-medium' : 
                            'stock-indicator-bar-good'
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
