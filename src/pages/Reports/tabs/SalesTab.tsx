// ================================
// TAB: VENTAS (SALES)
// Detailed sales analytics
// ================================

import { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Receipt } from 'lucide-react';
import { Card, CardHeader, CardBody, Table, Badge } from '../../../components/ui';
import { formatCurrency } from '../../../mocks/generators';
import { CompactKPI, KPIGrid } from '../components/CompactKPI';
import { TimeSeriesChart, HistogramChart, COLORS } from '../components/ReportCharts';
import { DetailDrawer } from '../components/DetailDrawer';
import type { useReportsData } from '../hooks/useReportsData';

type ReportsData = ReturnType<typeof useReportsData>;

interface SalesTabProps {
    data: ReportsData;
}

interface PaymentDataRow {
    id: string;
    name: string;
    value: number;
    pct: number;
    color: string;
}

export function SalesTab({ data }: SalesTabProps) {
    const { kpis, timeSeriesData, ticketDistribution, filters } = data;
    const [showSalesDrawer, setShowSalesDrawer] = useState(false);
    const [drawerDate, setDrawerDate] = useState<string | null>(null);
    
    if (!kpis) return null;
    
    // Calculate items per ticket
    const itemsPerTicket = kpis.current.totalTickets > 0 
        ? (kpis.current.totalItems / kpis.current.totalTickets).toFixed(1) 
        : '0';
    
    // Payment method breakdown
    const paymentBreakdown = timeSeriesData.reduce((acc, day) => {
        acc.cash += day.cash;
        acc.transfer += day.transfer;
        acc.card += day.card;
        acc.credit += day.credit;
        return acc;
    }, { cash: 0, transfer: 0, card: 0, credit: 0 });
    
    const total = paymentBreakdown.cash + paymentBreakdown.transfer + paymentBreakdown.card + paymentBreakdown.credit;
    
    const paymentData: PaymentDataRow[] = [
        { id: 'cash', name: 'Efectivo', value: paymentBreakdown.cash, pct: total > 0 ? Math.round((paymentBreakdown.cash / total) * 100) : 0, color: COLORS.cash },
        { id: 'transfer', name: 'Transferencia', value: paymentBreakdown.transfer, pct: total > 0 ? Math.round((paymentBreakdown.transfer / total) * 100) : 0, color: COLORS.transfer },
        { id: 'card', name: 'Tarjeta', value: paymentBreakdown.card, pct: total > 0 ? Math.round((paymentBreakdown.card / total) * 100) : 0, color: COLORS.card },
        { id: 'credit', name: 'Fiado', value: paymentBreakdown.credit, pct: total > 0 ? Math.round((paymentBreakdown.credit / total) * 100) : 0, color: COLORS.credit }
    ].filter(p => p.value > 0);
    
    return (
        <div className="report-tab-content">
            {/* KPIs */}
            <div className="kpi-grid-4">
                <CompactKPI
                    label="Facturación total"
                    value={formatCurrency(kpis.current.totalRevenue)}
                    delta={filters.compareEnabled ? kpis.deltas.totalRevenue : undefined}
                    icon={<DollarSign size={18} />}
                    variant="success"
                />
                <CompactKPI
                    label="Tickets"
                    value={kpis.current.totalTickets.toLocaleString('es-AR')}
                    delta={filters.compareEnabled ? kpis.deltas.totalTickets : undefined}
                    icon={<Receipt size={18} />}
                />
                <CompactKPI
                    label="Ticket promedio"
                    value={formatCurrency(kpis.current.avgTicket)}
                    delta={filters.compareEnabled ? kpis.deltas.avgTicket : undefined}
                    icon={<ShoppingCart size={18} />}
                />
                <CompactKPI
                    label="Items por ticket"
                    value={itemsPerTicket}
                    icon={<TrendingUp size={18} />}
                />
            </div>
            
            {/* Charts */}
            <div className="charts-grid charts-grid-2">
                {/* Revenue + Tickets */}
                <Card>
                    <CardHeader 
                        title="Facturación y tickets"
                        subtitle="Evolución en el período"
                    />
                    <CardBody>
                        <TimeSeriesChart
                            data={timeSeriesData}
                            lines={[
                                { key: 'total', name: 'Facturación', color: COLORS.primary, type: 'area' },
                                { key: 'tickets', name: 'Tickets', color: COLORS.warning }
                            ]}
                            height={280}
                        />
                    </CardBody>
                </Card>
                
                {/* Ticket Distribution */}
                <Card>
                    <CardHeader 
                        title="Distribución de tickets"
                        subtitle="Por rango de monto"
                    />
                    <CardBody>
                        <HistogramChart
                            data={ticketDistribution}
                            height={280}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* Payment Methods Table */}
            <Card>
                <CardHeader title="Medios de pago" />
                <CardBody noPadding>
                    <Table<PaymentDataRow>
                        columns={[
                            { 
                                key: 'name', 
                                header: 'Medio', 
                                render: (row) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span style={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%', 
                                            background: row.color 
                                        }} />
                                        {row.name}
                                    </div>
                                )
                            },
                            { 
                                key: 'value', 
                                header: 'Total', 
                                render: (row) => formatCurrency(row.value),
                                align: 'right'
                            },
                            { 
                                key: 'pct', 
                                header: '%', 
                                render: (row) => (
                                    <Badge variant="secondary" size="sm">{row.pct}%</Badge>
                                ),
                                align: 'right'
                            }
                        ]}
                        data={paymentData}
                        keyExtractor={(row) => row.id}
                        emptyMessage="No hay datos de ventas"
                    />
                </CardBody>
            </Card>
            
            {/* Drawer for drill-down */}
            <DetailDrawer
                isOpen={showSalesDrawer}
                onClose={() => setShowSalesDrawer(false)}
                title={`Ventas del ${drawerDate}`}
                subtitle="Detalle de transacciones"
            >
                <div className="drawer-content-placeholder">
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
                        Aquí se mostrarían las ventas filtradas por la fecha seleccionada.
                        <br /><br />
                        Esta funcionalidad requiere integración con el backend real.
                    </p>
                </div>
            </DetailDrawer>
        </div>
    );
}
