// ================================
// CHART WRAPPERS FOR RECHARTS
// Consistent chart styling
// ================================

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';
import { formatCurrency } from '../../../mocks/generators';
import './ReportCharts.css';

// Color palette
const COLORS = {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    secondary: '#8b5cf6',
    cash: '#22c55e',
    transfer: '#3b82f6',
    card: '#f59e0b',
    credit: '#ef4444'
};

// Custom tooltip
function CustomTooltip({ active, payload, label, valueFormatter }: any) {
    if (!active || !payload) return null;
    
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((entry: any, index: number) => (
                <p key={index} className="chart-tooltip-item" style={{ color: entry.color }}>
                    <span className="chart-tooltip-dot" style={{ background: entry.color }} />
                    {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
                </p>
            ))}
        </div>
    );
}

// ========== LINE/AREA CHART ==========

interface TimeSeriesChartProps {
    data: any[];
    lines: {
        key: string;
        name: string;
        color: string;
        type?: 'line' | 'area';
    }[];
    xKey?: string;
    height?: number;
    formatValue?: (value: number) => string;
    showGrid?: boolean;
}

export function TimeSeriesChart({
    data,
    lines,
    xKey = 'date',
    height = 300,
    formatValue = formatCurrency,
    showGrid = true
}: TimeSeriesChartProps) {
    const hasArea = lines.some(l => l.type === 'area');
    const ChartComponent = hasArea ? AreaChart : LineChart;
    
    return (
        <div className="chart-container" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />}
                    <XAxis 
                        dataKey={xKey} 
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        axisLine={{ stroke: 'var(--border-light)' }}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                            return value;
                        }}
                    />
                    <Tooltip content={<CustomTooltip valueFormatter={formatValue} />} />
                    <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {lines.map(line => (
                        line.type === 'area' ? (
                            <Area
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                name={line.name}
                                stroke={line.color}
                                fill={line.color}
                                fillOpacity={0.2}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        ) : (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                name={line.name}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        )
                    ))}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
}

// ========== STACKED AREA CHART ==========

interface StackedAreaChartProps {
    data: any[];
    areas: {
        key: string;
        name: string;
        color: string;
    }[];
    xKey?: string;
    height?: number;
    formatValue?: (value: number) => string;
}

export function StackedAreaChart({
    data,
    areas,
    xKey = 'date',
    height = 300,
    formatValue = formatCurrency
}: StackedAreaChartProps) {
    return (
        <div className="chart-container" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis 
                        dataKey={xKey} 
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        axisLine={{ stroke: 'var(--border-light)' }}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                            return value;
                        }}
                    />
                    <Tooltip content={<CustomTooltip valueFormatter={formatValue} />} />
                    <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {areas.map(area => (
                        <Area
                            key={area.key}
                            type="monotone"
                            dataKey={area.key}
                            name={area.name}
                            stackId="1"
                            stroke={area.color}
                            fill={area.color}
                            fillOpacity={0.8}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// ========== BAR CHART ==========

interface BarChartProps {
    data: any[];
    bars: {
        key: string;
        name: string;
        color: string;
    }[];
    xKey?: string;
    height?: number;
    formatValue?: (value: number) => string;
    layout?: 'horizontal' | 'vertical';
    stacked?: boolean;
}

export function SimpleBarChart({
    data,
    bars,
    xKey = 'name',
    height = 300,
    formatValue = formatCurrency,
    layout = 'vertical',
    stacked = false
}: BarChartProps) {
    return (
        <div className="chart-container" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={data} 
                    layout={layout}
                    margin={{ top: 5, right: 5, left: layout === 'horizontal' ? 80 : 5, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    {layout === 'vertical' ? (
                        <>
                            <XAxis 
                                dataKey={xKey} 
                                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                axisLine={{ stroke: 'var(--border-light)' }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <XAxis 
                                type="number"
                                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                axisLine={{ stroke: 'var(--border-light)' }}
                                tickLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                            <YAxis 
                                dataKey={xKey}
                                type="category"
                                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                axisLine={false}
                                tickLine={false}
                                width={75}
                            />
                        </>
                    )}
                    <Tooltip content={<CustomTooltip valueFormatter={formatValue} />} />
                    {bars.length > 1 && (
                        <Legend 
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                    )}
                    {bars.map(bar => (
                        <Bar
                            key={bar.key}
                            dataKey={bar.key}
                            name={bar.name}
                            fill={bar.color}
                            stackId={stacked ? 'stack' : undefined}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ========== HORIZONTAL RANKING CHART ==========

interface RankingChartProps {
    data: { name: string; value: number; [key: string]: any }[];
    height?: number;
    formatValue?: (value: number) => string;
    colorKey?: string;
}

export function RankingChart({
    data,
    height = 300,
    formatValue = formatCurrency,
    colorKey
}: RankingChartProps) {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    
    return (
        <div className="ranking-chart" style={{ height }}>
            {data.map((item, index) => (
                <div key={item.name} className="ranking-item">
                    <span className="ranking-position">{index + 1}</span>
                    <div className="ranking-content">
                        <div className="ranking-header">
                            <span className="ranking-name">{item.name}</span>
                            <span className="ranking-value">{formatValue(item.value)}</span>
                        </div>
                        <div className="ranking-bar-bg">
                            <div 
                                className="ranking-bar-fill"
                                style={{ 
                                    width: `${(item.value / maxValue) * 100}%`,
                                    background: colorKey && item[colorKey] 
                                        ? item[colorKey] 
                                        : `hsl(${210 - index * 15}, 70%, 50%)`
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ========== HEATMAP ==========

interface HeatmapChartProps {
    data: { dayLabel: string; hour: number; hourLabel: string; value: number; intensity: number }[];
    height?: number;
    formatValue?: (value: number) => string;
}

export function HeatmapChart({
    data,
    height = 300,
    formatValue = formatCurrency
}: HeatmapChartProps) {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8am to 10pm
    
    const getCellData = (day: number, hour: number) => {
        return data.find(d => d.dayLabel === days[day] && d.hour === hour);
    };
    
    return (
        <div className="heatmap-chart" style={{ height, overflowX: 'auto' }}>
            <div className="heatmap-grid">
                <div className="heatmap-row heatmap-header">
                    <div className="heatmap-cell heatmap-label" />
                    {hours.map(hour => (
                        <div key={hour} className="heatmap-cell heatmap-hour-label">
                            {hour}h
                        </div>
                    ))}
                </div>
                {days.map((day, dayIndex) => (
                    <div key={day} className="heatmap-row">
                        <div className="heatmap-cell heatmap-label">{day}</div>
                        {hours.map(hour => {
                            const cell = getCellData(dayIndex, hour);
                            return (
                                <div
                                    key={hour}
                                    className="heatmap-cell heatmap-data"
                                    style={{
                                        background: cell && cell.intensity > 0
                                            ? `rgba(59, 130, 246, ${0.1 + cell.intensity * 0.8})`
                                            : 'var(--bg-secondary)'
                                    }}
                                    title={cell ? `${day} ${hour}:00 - ${formatValue(cell.value)}` : ''}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="heatmap-legend">
                <span>Menor</span>
                <div className="heatmap-legend-gradient" />
                <span>Mayor</span>
            </div>
        </div>
    );
}

// ========== HISTOGRAM ==========

interface HistogramChartProps {
    data: { range: string; count: number }[];
    height?: number;
}

export function HistogramChart({ data, height = 200 }: HistogramChartProps) {
    const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);
    
    return (
        <div className="histogram-chart" style={{ height }}>
            <div className="histogram-bars">
                {data.map((item, index) => (
                    <div key={item.range} className="histogram-bar-container">
                        <div 
                            className="histogram-bar"
                            style={{ 
                                height: `${(item.count / maxCount) * 100}%`,
                                background: `hsl(${210 + index * 20}, 70%, 55%)`
                            }}
                        >
                            <span className="histogram-count">{item.count}</span>
                        </div>
                        <span className="histogram-label">{item.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { COLORS };
