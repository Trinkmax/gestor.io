// ================================
// COMPACT KPI COMPONENT
// Compact stat display with delta
// ================================

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './CompactKPI.css';

interface CompactKPIProps {
    label: string;
    value: string | number;
    delta?: number;
    deltaLabel?: string;
    showDelta?: boolean;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    onClick?: () => void;
}

export function CompactKPI({
    label,
    value,
    delta,
    deltaLabel,
    showDelta = true,
    icon,
    variant = 'default',
    onClick
}: CompactKPIProps) {
    const deltaType = delta === undefined || delta === 0 
        ? 'neutral' 
        : delta > 0 
            ? 'positive' 
            : 'negative';
    
    const Component = onClick ? 'button' : 'div';
    
    return (
        <Component
            className={`compact-kpi ${variant} ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
            type={onClick ? 'button' : undefined}
        >
            {icon && <div className={`compact-kpi-icon ${variant}`}>{icon}</div>}
            <div className="compact-kpi-content">
                <span className="compact-kpi-label">{label}</span>
                <span className="compact-kpi-value">{value}</span>
                {showDelta && delta !== undefined && (
                    <span className={`compact-kpi-delta ${deltaType}`}>
                        {deltaType === 'positive' && <TrendingUp size={12} />}
                        {deltaType === 'negative' && <TrendingDown size={12} />}
                        {deltaType === 'neutral' && <Minus size={12} />}
                        <span>
                            {delta > 0 ? '+' : ''}{delta}%
                            {deltaLabel && <span className="delta-label"> {deltaLabel}</span>}
                        </span>
                    </span>
                )}
            </div>
        </Component>
    );
}

// Grid container for KPIs
export function KPIGrid({ children }: { children: React.ReactNode }) {
    return <div className="kpi-grid">{children}</div>;
}
