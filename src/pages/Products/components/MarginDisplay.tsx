// ================================
// MARGIN DISPLAY
// Display de margen con monto y porcentaje
// ================================

import { formatCurrency } from '../../../mocks/generators';

interface MarginDisplayProps {
    price: number;
    cost?: number;
    showPercentage?: boolean;
    compact?: boolean;
}

export function MarginDisplay({ price, cost, showPercentage = true, compact = false }: MarginDisplayProps) {
    if (!cost || cost === 0) {
        return <span className="text-tertiary">-</span>;
    }

    const marginAmount = price - cost;
    const marginPercentage = ((marginAmount / cost) * 100).toFixed(1);
    const isLowMargin = parseFloat(marginPercentage) < 20;

    return (
        <div className={`margin-display ${compact ? 'margin-display-compact' : ''}`}>
            <span className={isLowMargin ? 'text-warning font-semibold' : 'text-success'}>
                {formatCurrency(marginAmount)}
            </span>
            {showPercentage && (
                <span className={`margin-display-percentage ${isLowMargin ? 'text-warning' : 'text-secondary'}`}>
                    ({marginPercentage}%)
                </span>
            )}
        </div>
    );
}
