// ================================
// TAB: RESUMEN (SUMMARY)
// Overview analytics tab
// ================================

import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../../components/ui';
import { formatCurrency } from '../../../mocks/generators';
import { CompactKPI, KPIGrid } from '../components/CompactKPI';
import { TimeSeriesChart, StackedAreaChart, HeatmapChart, RankingChart, COLORS } from '../components/ReportCharts';
import { InsightsPanel } from '../components/InsightsPanel';
import type { useReportsData } from '../hooks/useReportsData';

type ReportsData = ReturnType<typeof useReportsData>;

interface SummaryTabProps {
    data: ReportsData;
}

export function SummaryTab({ data }: SummaryTabProps) {
    const { kpis, timeSeriesData, paymentMixData, heatmapData, topProducts, debtors, insights, filters } = data;
    
    if (!kpis) return null;
    
    return (
        <div className="report-tab-content">
            {/* KPIs Row */}
            <div className="kpi-grid-5">
                <CompactKPI
                    label="Facturación"
                    value={formatCurrency(kpis.current.totalRevenue)}
                    delta={filters.compareEnabled ? kpis.deltas.totalRevenue : undefined}
                    icon={<DollarSign size={18} />}
                    variant="success"
                />
                <CompactKPI
                    label="Margen estimado"
                    value={`${kpis.current.estimatedMargin}%`}
                    delta={filters.compareEnabled ? kpis.deltas.estimatedMargin : undefined}
                    icon={<TrendingUp size={18} />}
                    variant={kpis.current.estimatedMargin > 25 ? 'success' : 'warning'}
                />
                <CompactKPI
                    label="Ticket promedio"
                    value={formatCurrency(kpis.current.avgTicket)}
                    delta={filters.compareEnabled ? kpis.deltas.avgTicket : undefined}
                    icon={<ShoppingCart size={18} />}
                />
                <CompactKPI
                    label="Unidades vendidas"
                    value={kpis.current.totalItems.toLocaleString('es-AR')}
                    delta={filters.compareEnabled ? kpis.deltas.totalItems : undefined}
                    icon={<ShoppingCart size={18} />}
                />
                <CompactKPI
                    label="% Fiado"
                    value={`${kpis.current.creditPercentage}%`}
                    delta={filters.compareEnabled ? kpis.deltas.creditPercentage : undefined}
                    icon={<Users size={18} />}
                    variant={kpis.current.creditPercentage > 30 ? 'warning' : 'default'}
                />
            </div>
            
            {/* Charts Row */}
            <div className="charts-grid charts-grid-2">
                {/* Revenue Over Time */}
                <Card>
                    <CardHeader 
                        title="Facturación en el tiempo"
                        subtitle={`Agrupado por ${data.filters.groupBy === 'day' ? 'día' : data.filters.groupBy === 'week' ? 'semana' : 'mes'}`}
                    />
                    <CardBody>
                        <TimeSeriesChart
                            data={timeSeriesData}
                            lines={[
                                { key: 'total', name: 'Facturación', color: COLORS.primary, type: 'area' }
                            ]}
                            height={280}
                        />
                    </CardBody>
                </Card>
                
                {/* Payment Mix Over Time */}
                <Card>
                    <CardHeader 
                        title="Mix de pagos en el tiempo"
                        subtitle="Distribución por medio de pago"
                    />
                    <CardBody>
                        <StackedAreaChart
                            data={paymentMixData}
                            areas={[
                                { key: 'cash', name: 'Efectivo', color: COLORS.cash },
                                { key: 'transfer', name: 'Transferencia', color: COLORS.transfer },
                                { key: 'card', name: 'Tarjeta', color: COLORS.card },
                                { key: 'credit', name: 'Fiado', color: COLORS.credit }
                            ]}
                            height={280}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* Grid Optimizado: Dos filas balanceadas */}
            <div className="charts-grid charts-grid-2">
                {/* Heatmap */}
                <Card>
                    <CardHeader 
                        title="Ventas por día y hora"
                        subtitle="Identificá tus picos de actividad"
                    />
                    <CardBody>
                        <HeatmapChart 
                            data={heatmapData}
                            height={260}
                        />
                    </CardBody>
                </Card>
                
                {/* Top Products */}
                <Card>
                    <CardHeader 
                        title="Top 10 productos"
                        subtitle="Por facturación"
                    />
                    <CardBody>
                        <RankingChart
                            data={topProducts.slice(0, 8).map(p => ({
                                name: p.name,
                                value: p.revenue
                            }))}
                            height={260}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* Segunda fila */}
            <div className="charts-grid charts-grid-2">
                {/* Top Debtors */}
                <Card>
                    <CardHeader 
                        title="Top 10 deudores"
                        subtitle="Por monto de deuda"
                    />
                    <CardBody>
                        <RankingChart
                            data={debtors.slice(0, 8).map(d => ({
                                name: d.name,
                                value: d.balance,
                                color: d.agingBucket === '30+' ? COLORS.danger : 
                                       d.agingBucket === '16-30' ? COLORS.warning : COLORS.primary
                            }))}
                            height={260}
                            colorKey="color"
                        />
                    </CardBody>
                </Card>
                
                {/* Insights */}
                <InsightsPanel insights={insights} />
            </div>
        </div>
    );
}
