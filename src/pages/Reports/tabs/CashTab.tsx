// ================================
// TAB: CAJA (CASH REGISTER)
// Cash register analysis
// ================================

import { useState } from 'react';
import { DollarSign, Wallet, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardBody, Table, Badge, Button } from '../../../components/ui';
import { formatCurrency, formatDate, expenseCategoryNames } from '../../../mocks/generators';
import { CompactKPI } from '../components/CompactKPI';
import { TimeSeriesChart, SimpleBarChart, COLORS } from '../components/ReportCharts';
import { DetailDrawer } from '../components/DetailDrawer';
import type { useReportsData } from '../hooks/useReportsData';
import type { CashRegisterSummary } from '../utils/reportAggregations';

type ReportsData = ReturnType<typeof useReportsData>;

interface CashTabProps {
    data: ReportsData;
}

export function CashTab({ data }: CashTabProps) {
    const { kpis, cashRegisterHistory, expensesByCategory, totalExpenses, filters } = data;
    const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
    
    if (!kpis) return null;
    
    // Calculate totals
    const totalSales = kpis.current.totalRevenue;
    const positiveClosings = cashRegisterHistory.filter(r => r.difference !== undefined && r.difference >= 0).length;
    const totalDifference = cashRegisterHistory.reduce((sum, r) => sum + (r.difference || 0), 0);
    
    // Prepare chart data
    const cashFlowData = cashRegisterHistory
        .slice(0, 30)
        .reverse()
        .map(r => ({
            date: formatDate(r.date),
            expected: r.expectedCash || 0,
            actual: r.actualCash || 0,
            difference: r.difference || 0
        }));
    
    const expenseChartData = expensesByCategory.map(e => ({
        name: expenseCategoryNames[e.category] || e.category,
        value: e.total
    }));
    
    return (
        <div className="report-tab-content">
            {/* KPIs */}
            <div className="kpi-grid-4">
                <CompactKPI
                    label="Total ventas"
                    value={formatCurrency(totalSales)}
                    delta={filters.compareEnabled ? kpis.deltas.totalRevenue : undefined}
                    icon={<DollarSign size={18} />}
                    variant="success"
                />
                <CompactKPI
                    label="Gastos del período"
                    value={formatCurrency(totalExpenses)}
                    icon={<TrendingDown size={18} />}
                    variant="warning"
                />
                <CompactKPI
                    label="Cierres cuadrados"
                    value={`${positiveClosings} / ${cashRegisterHistory.length}`}
                    icon={<Wallet size={18} />}
                />
                <CompactKPI
                    label="Diferencia acumulada"
                    value={formatCurrency(totalDifference)}
                    icon={<AlertTriangle size={18} />}
                    variant={totalDifference < 0 ? 'danger' : totalDifference > 0 ? 'warning' : 'success'}
                />
            </div>
            
            {/* Charts */}
            <div className="charts-grid charts-grid-2">
                {/* Expected vs Actual */}
                <Card>
                    <CardHeader 
                        title="Efectivo esperado vs real"
                        subtitle="Por cierre de caja"
                    />
                    <CardBody>
                        <TimeSeriesChart
                            data={cashFlowData}
                            lines={[
                                { key: 'expected', name: 'Esperado', color: COLORS.primary },
                                { key: 'actual', name: 'Contado', color: COLORS.success }
                            ]}
                            height={280}
                        />
                    </CardBody>
                </Card>
                
                {/* Expenses by Category */}
                <Card>
                    <CardHeader 
                        title="Gastos por categoría"
                        subtitle={`Total: ${formatCurrency(totalExpenses)}`}
                    />
                    <CardBody>
                        <SimpleBarChart
                            data={expenseChartData}
                            bars={[{ key: 'value', name: 'Monto', color: COLORS.warning }]}
                            layout="horizontal"
                            height={280}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* Cash Register History Table */}
            <Card>
                <CardHeader 
                    title="Historial de cierres"
                    subtitle={`${cashRegisterHistory.length} cierres en el período`}
                />
                <CardBody noPadding>
                    <Table<CashRegisterSummary>
                        columns={[
                            { 
                                key: 'date', 
                                header: 'Fecha',
                                render: (row) => formatDate(row.date)
                            },
                            { 
                                key: 'openedBy', 
                                header: 'Abrió',
                                render: (row) => row.openedBy
                            },
                            { 
                                key: 'closedBy', 
                                header: 'Cerró',
                                render: (row) => row.closedBy || '-'
                            },
                            { 
                                key: 'totalSales', 
                                header: 'Ventas',
                                render: (row) => formatCurrency(row.totalSales),
                                align: 'right'
                            },
                            { 
                                key: 'totalExpenses', 
                                header: 'Gastos',
                                render: (row) => formatCurrency(row.totalExpenses),
                                align: 'right'
                            },
                            { 
                                key: 'difference', 
                                header: 'Diferencia',
                                render: (row) => {
                                    const diff = row.difference || 0;
                                    return (
                                        <Badge 
                                            variant={diff === 0 ? 'success' : diff > 0 ? 'warning' : 'danger'}
                                            size="sm"
                                        >
                                            {diff === 0 ? 'Cuadrada' : diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                                        </Badge>
                                    );
                                },
                                align: 'center'
                            },
                            { 
                                key: 'actions', 
                                header: '',
                                render: (row) => (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedRegister(row.id)}
                                    >
                                        Ver
                                    </Button>
                                ),
                                align: 'center'
                            }
                        ]}
                        data={cashRegisterHistory.slice(0, 20)}
                        keyExtractor={(row) => row.id}
                        emptyMessage="No hay cierres de caja en el período"
                    />
                </CardBody>
            </Card>
            
            {/* Detail Drawer */}
            <DetailDrawer
                isOpen={!!selectedRegister}
                onClose={() => setSelectedRegister(null)}
                title="Detalle de cierre"
                subtitle={selectedRegister ? `ID: ${selectedRegister}` : ''}
            >
                <div className="drawer-content-placeholder">
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
                        Aquí se mostraría el detalle completo del cierre de caja:
                        <br /><br />
                        • Monto inicial<br />
                        • Ventas por medio de pago<br />
                        • Gastos detallados<br />
                        • Diferencia y notas<br />
                        <br />
                        Esta funcionalidad requiere integración con el backend real.
                    </p>
                </div>
            </DetailDrawer>
        </div>
    );
}
