// ================================
// TAB: CLIENTES / FIADO (CLIENTS)
// Credit and debt analytics
// ================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody, Table, Badge, Button, SearchInput } from '../../../components/ui';
import { formatCurrency, formatRelativeDate } from '../../../mocks/generators';
import { CompactKPI, KPIGrid } from '../components/CompactKPI';
import { SimpleBarChart, COLORS } from '../components/ReportCharts';
import type { useReportsData } from '../hooks/useReportsData';
import type { DebtorData, AgingBucketData } from '../utils/reportAggregations';

type ReportsData = ReturnType<typeof useReportsData>;

interface ClientsTabProps {
    data: ReportsData;
}

export function ClientsTab({ data }: ClientsTabProps) {
    const navigate = useNavigate();
    const { kpis, debtors, agingDistribution, totalDebt, filters } = data;
    const [searchTerm, setSearchTerm] = useState('');
    
    if (!kpis) return null;
    
    // Credit statistics
    const debtorsCount = debtors.length;
    const oldDebtors = debtors.filter(d => d.agingBucket === '30+');
    const oldDebtTotal = oldDebtors.reduce((sum, d) => sum + d.balance, 0);
    
    // Prepare chart data
    const agingChartData = agingDistribution.map(b => ({
        name: b.label,
        value: b.total,
        color: b.color
    }));
    
    const topDebtorsData = debtors.slice(0, 10).map(d => ({
        name: d.name,
        value: d.balance
    }));
    
    // Filter debtors by search
    const filteredDebtors = debtors.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.phone && d.phone.includes(searchTerm))
    );
    
    return (
        <div className="report-tab-content">
            {/* KPIs */}
            <KPIGrid>
                <CompactKPI
                    label="Deuda total"
                    value={formatCurrency(totalDebt)}
                    icon={<DollarSign size={18} />}
                    variant="warning"
                />
                <CompactKPI
                    label="Clientes con deuda"
                    value={debtorsCount}
                    icon={<Users size={18} />}
                />
                <CompactKPI
                    label="% Fiado sobre ventas"
                    value={`${kpis.current.creditPercentage}%`}
                    delta={filters.compareEnabled ? kpis.deltas.creditPercentage : undefined}
                    icon={<TrendingUp size={18} />}
                    variant={kpis.current.creditPercentage > 30 ? 'warning' : 'default'}
                />
                <CompactKPI
                    label="Deuda +30 días"
                    value={formatCurrency(oldDebtTotal)}
                    icon={<AlertTriangle size={18} />}
                    variant={oldDebtors.length > 0 ? 'danger' : 'success'}
                />
            </KPIGrid>
            
            {/* Old Debt Alert */}
            {oldDebtors.length > 0 && (
                <Card>
                    <CardBody>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-2)', borderLeft: '4px solid var(--color-danger-500)', paddingLeft: 'var(--space-4)' }}>
                            <div style={{ 
                                background: 'var(--color-danger-100)', 
                                color: 'var(--color-danger-600)',
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-lg)'
                            }}>
                                <Clock size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, marginBottom: 'var(--space-1)' }}>
                                    🚨 {oldDebtors.length} clientes con deuda mayor a 30 días
                                </h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                    Total en riesgo: {formatCurrency(oldDebtTotal)} - Considerá acciones de recupero
                                </p>
                            </div>
                            <Button variant="warning" size="sm" onClick={() => navigate('/clientes?filter=debtors')}>
                                Gestionar deudores
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
            
            {/* Charts */}
            <div className="charts-grid charts-grid-2">
                {/* Aging Distribution */}
                <Card>
                    <CardHeader 
                        title="Antigüedad de deuda"
                        subtitle="Por rango de días"
                    />
                    <CardBody>
                        <SimpleBarChart
                            data={agingChartData}
                            bars={[{ key: 'value', name: 'Monto', color: COLORS.warning }]}
                            height={280}
                        />
                    </CardBody>
                </Card>
                
                {/* Top Debtors */}
                <Card>
                    <CardHeader 
                        title="Top 10 deudores"
                        subtitle="Por monto"
                    />
                    <CardBody>
                        <SimpleBarChart
                            data={topDebtorsData}
                            bars={[{ key: 'value', name: 'Deuda', color: COLORS.danger }]}
                            layout="horizontal"
                            height={280}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* Aging Breakdown Table */}
            <Card>
                <CardHeader 
                    title="Resumen por antigüedad"
                />
                <CardBody noPadding>
                    <Table<AgingBucketData>
                        columns={[
                            { 
                                key: 'label', 
                                header: 'Antigüedad',
                                render: (row) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span style={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%', 
                                            background: row.color 
                                        }} />
                                        {row.label}
                                    </div>
                                )
                            },
                            { 
                                key: 'count', 
                                header: 'Clientes',
                                render: (row) => row.count.toString(),
                                align: 'right'
                            },
                            { 
                                key: 'total', 
                                header: 'Total deuda',
                                render: (row) => formatCurrency(row.total),
                                align: 'right'
                            },
                            { 
                                key: 'percentage', 
                                header: '% del total',
                                render: (row) => `${totalDebt > 0 ? Math.round((row.total / totalDebt) * 100) : 0}%`,
                                align: 'right'
                            }
                        ]}
                        data={agingDistribution}
                        keyExtractor={(row) => row.bucket}
                        emptyMessage="No hay deudas pendientes"
                    />
                </CardBody>
            </Card>
            
            {/* Debtors Table */}
            <Card>
                <CardHeader 
                    title="Lista de deudores"
                    subtitle={`${debtorsCount} clientes con saldo pendiente`}
                    actions={
                        <SearchInput
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                        />
                    }
                />
                <CardBody noPadding>
                    <Table<DebtorData>
                        columns={[
                            { 
                                key: 'name', 
                                header: 'Cliente',
                                render: (row) => row.name
                            },
                            { 
                                key: 'phone', 
                                header: 'Teléfono',
                                render: (row) => row.phone || '-'
                            },
                            { 
                                key: 'balance', 
                                header: 'Deuda',
                                render: (row) => (
                                    <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-danger-600)' }}>
                                        {formatCurrency(row.balance)}
                                    </span>
                                ),
                                align: 'right'
                            },
                            { 
                                key: 'agingBucket', 
                                header: 'Antigüedad',
                                render: (row) => (
                                    <Badge 
                                        variant={
                                            row.agingBucket === '0-7' ? 'success' : 
                                            row.agingBucket === '8-15' ? 'warning' : 
                                            row.agingBucket === '16-30' ? 'warning' : 'danger'
                                        }
                                        size="sm"
                                    >
                                        {row.agingBucket === '30+' ? '+30 días' : `${row.agingBucket} días`}
                                    </Badge>
                                ),
                                align: 'center'
                            },
                            { 
                                key: 'lastActivityAt', 
                                header: 'Última actividad',
                                render: (row) => row.lastActivityAt ? formatRelativeDate(row.lastActivityAt) : 'Sin registro'
                            },
                            { 
                                key: 'actions', 
                                header: '',
                                render: (row) => (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/clientes/${row.id}`)}
                                    >
                                        Ver cuenta
                                    </Button>
                                ),
                                align: 'center'
                            }
                        ]}
                        data={filteredDebtors.slice(0, 20)}
                        keyExtractor={(row) => row.id}
                        emptyMessage="No hay clientes con deuda pendiente"
                    />
                </CardBody>
            </Card>
        </div>
    );
}
