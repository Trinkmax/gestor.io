// ================================
// REPORT FILTER BAR COMPONENT
// Global sticky filter bar for reports
// ================================

import { useState, useRef, useEffect } from 'react';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Copy,
    Check,
    Filter,
    BarChart3
} from 'lucide-react';
import { Button, FilterPill, Toggle } from '../../../components/ui';
import type { DatePreset, GroupByPeriod, ReportFilters } from '../hooks/useReportsData';
import './ReportFilterBar.css';

interface ReportFilterBarProps {
    filters: ReportFilters;
    onFiltersChange: (updates: Partial<ReportFilters>) => void;
    onReset: () => void;
    dateRange: { start: Date; end: Date };
}

const presetLabels: Record<DatePreset, string> = {
    today: 'Hoy',
    '7d': '7 días',
    '30d': '30 días',
    month: 'Mes actual',
    year: 'Año actual',
    custom: 'Personalizado'
};

const groupByLabels: Record<GroupByPeriod, string> = {
    day: 'Día',
    week: 'Semana',
    month: 'Mes'
};

export function ReportFilterBar({ filters, onFiltersChange, onReset, dateRange }: ReportFilterBarProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showCustomDates, setShowCustomDates] = useState(filters.preset === 'custom');
    const advancedRef = useRef<HTMLDivElement>(null);
    
    // Custom date inputs
    const [customStart, setCustomStart] = useState(
        filters.customRange?.start.toISOString().split('T')[0] || ''
    );
    const [customEnd, setCustomEnd] = useState(
        filters.customRange?.end.toISOString().split('T')[0] || ''
    );
    
    useEffect(() => {
        if (filters.preset === 'custom' && customStart && customEnd) {
            onFiltersChange({
                customRange: {
                    start: new Date(customStart),
                    end: new Date(customEnd + 'T23:59:59')
                }
            });
        }
    }, [customStart, customEnd]);
    
    const handlePresetChange = (preset: DatePreset) => {
        if (preset === 'custom') {
            setShowCustomDates(true);
            // Set default custom range to last 30 days
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            setCustomStart(start.toISOString().split('T')[0]);
            setCustomEnd(end.toISOString().split('T')[0]);
        } else {
            setShowCustomDates(false);
        }
        onFiltersChange({ preset });
    };
    
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };
    
    const formatDateRange = () => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        const start = dateRange.start.toLocaleDateString('es-AR', options);
        const end = dateRange.end.toLocaleDateString('es-AR', options);
        return `${start} - ${end}`;
    };
    
    const hasActiveFilters = filters.paymentMethods.length > 0 || 
        filters.includeCredit !== true || 
        filters.userId || 
        filters.categoryId;
    
    return (
        <div className="report-filter-bar">
            {/* Primera Fila: Período */}
            <div className="filter-bar-row">
                <div className="filter-bar-section filter-bar-section-period">
                    <div className="filter-bar-label">
                        <Calendar size={16} />
                        <span>PERÍODO</span>
                    </div>
                    <div className="filter-bar-content">
                        <div className="filter-pills">
                            {(['today', '7d', '30d', 'month', 'year', 'custom'] as DatePreset[]).map(preset => (
                                <FilterPill
                                    key={preset}
                                    label={presetLabels[preset]}
                                    isActive={filters.preset === preset}
                                    onClick={() => handlePresetChange(preset)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Date Range Display */}
                <div className="filter-bar-badge">
                    <span className="filter-date-range">{formatDateRange()}</span>
                </div>
            </div>
            
            {/* Custom Dates Row (condicional) */}
            {showCustomDates && (
                <div className="filter-bar-row filter-custom-dates-row">
                    <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="filter-date-input"
                    />
                    <span className="filter-date-separator">→</span>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="filter-date-input"
                    />
                </div>
            )}
            
            {/* Segunda Fila: Agrupar + Comparar + Acciones */}
            <div className="filter-bar-row filter-bar-row-secondary">
                <div className="filter-bar-section filter-bar-section-group">
                    <div className="filter-bar-label">
                        <BarChart3 size={16} />
                        <span>AGRUPAR</span>
                    </div>
                    <div className="filter-bar-content">
                        <div className="filter-pills">
                            {(['day', 'week', 'month'] as GroupByPeriod[]).map(period => (
                                <FilterPill
                                    key={period}
                                    label={groupByLabels[period]}
                                    isActive={filters.groupBy === period}
                                    onClick={() => onFiltersChange({ groupBy: period })}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="filter-bar-separator" />
                
                <div className="filter-bar-toggle">
                    <Toggle
                        label="Comparar período"
                        checked={filters.compareEnabled}
                        onChange={checked => onFiltersChange({ compareEnabled: checked })}
                        size="sm"
                    />
                </div>
                
                <div className="filter-bar-actions">
                    <button
                        className={`filter-action-btn ${showAdvanced ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        title="Filtros avanzados"
                    >
                        <Filter size={16} />
                        {hasActiveFilters && <span className="filter-badge" />}
                    </button>
                    
                    <button
                        className="filter-action-btn"
                        onClick={handleCopyLink}
                        title="Copiar enlace"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    
                    <button
                        className="filter-action-btn"
                        onClick={onReset}
                        title="Limpiar filtros"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvanced && (
                <div className="report-filter-bar-advanced" ref={advancedRef}>
                    <div className="advanced-filter-grid">
                        {/* Payment Methods */}
                        <div className="advanced-filter-group">
                            <label>Medios de pago</label>
                            <div className="filter-pills">
                                {[
                                    { value: 'CASH', label: 'Efectivo' },
                                    { value: 'TRANSFER', label: 'Transferencia' },
                                    { value: 'CARD', label: 'Tarjeta' },
                                    { value: 'CREDIT', label: 'Fiado' }
                                ].map(pm => (
                                    <FilterPill
                                        key={pm.value}
                                        label={pm.label}
                                        isActive={filters.paymentMethods.includes(pm.value)}
                                        onClick={() => {
                                            const current = [...filters.paymentMethods];
                                            const index = current.indexOf(pm.value);
                                            if (index >= 0) {
                                                current.splice(index, 1);
                                            } else {
                                                current.push(pm.value);
                                            }
                                            onFiltersChange({ paymentMethods: current });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Credit Filter */}
                        <div className="advanced-filter-group">
                            <label>Fiado</label>
                            <div className="filter-pills">
                                <FilterPill
                                    label="Incluir"
                                    isActive={filters.includeCredit === true}
                                    onClick={() => onFiltersChange({ includeCredit: true })}
                                />
                                <FilterPill
                                    label="Excluir"
                                    isActive={filters.includeCredit === false}
                                    onClick={() => onFiltersChange({ includeCredit: false })}
                                />
                                <FilterPill
                                    label="Solo fiado"
                                    isActive={filters.includeCredit === 'only'}
                                    onClick={() => onFiltersChange({ includeCredit: 'only' })}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {hasActiveFilters && (
                        <div className="advanced-filter-footer">
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<RotateCcw size={14} />}
                                onClick={() => onFiltersChange({
                                    paymentMethods: [],
                                    includeCredit: true,
                                    userId: undefined,
                                    categoryId: undefined
                                })}
                            >
                                Limpiar filtros avanzados
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
