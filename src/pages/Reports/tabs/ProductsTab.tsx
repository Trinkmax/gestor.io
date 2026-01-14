// ================================
// TAB: PRODUCTOS (PRODUCTS)
// Product performance analytics
// ================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody, Table, Badge, Button, SearchInput } from '../../../components/ui';
import { formatCurrency } from '../../../mocks/generators';
import { CompactKPI, KPIGrid } from '../components/CompactKPI';
import { SimpleBarChart, COLORS } from '../components/ReportCharts';
import type { useReportsData } from '../hooks/useReportsData';

type ReportsData = ReturnType<typeof useReportsData>;

interface ProductsTabProps {
    data: ReportsData;
}

interface ClassifiedProduct {
    id: string;
    name: string;
    revenue: number;
    units: number;
    margin?: number;
    marginPercentage?: number;
    classification: 'A' | 'B' | 'C';
    cumulativePct: number;
}

export function ProductsTab({ data }: ProductsTabProps) {
    const navigate = useNavigate();
    const { kpis, topProducts, topProductsByMargin, products, filters } = data;
    const [searchTerm, setSearchTerm] = useState('');
    
    if (!kpis) return null;
    
    // Products sold count
    const productsSold = topProducts.length;
    
    // Average margin
    const avgMargin = topProducts.length > 0
        ? Math.round(topProducts.reduce((sum, p) => sum + (p.marginPercentage || 0), 0) / topProducts.length)
        : 0;
    
    // Low stock + top sellers warning
    const lowStockTopSellers = products.filter(p => 
        p.isActive && 
        p.minStock && 
        p.stock <= p.minStock && 
        topProducts.some(tp => tp.id === p.id)
    );
    
    // Prepare chart data
    const revenueChartData = topProducts.slice(0, 8).map(p => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
        value: p.revenue
    }));
    
    const marginChartData = topProductsByMargin.slice(0, 8).map(p => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
        value: p.margin || 0
    }));
    
    // ABC Classification
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
    let cumulativeRevenue = 0;
    const classifiedProducts: ClassifiedProduct[] = topProducts.map(p => {
        cumulativeRevenue += p.revenue;
        const cumulativePct = (cumulativeRevenue / totalRevenue) * 100;
        let classification: 'A' | 'B' | 'C';
        if (cumulativePct <= 70) classification = 'A';
        else if (cumulativePct <= 90) classification = 'B';
        else classification = 'C';
        return { ...p, classification, cumulativePct };
    });
    
    const filteredProducts = classifiedProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="report-tab-content">
            {/* KPIs */}
            <KPIGrid>
                <CompactKPI
                    label="Productos vendidos"
                    value={productsSold}
                    icon={<Package size={18} />}
                />
                <CompactKPI
                    label="Unidades vendidas"
                    value={kpis.current.totalItems.toLocaleString('es-AR')}
                    delta={filters.compareEnabled ? kpis.deltas.totalItems : undefined}
                    icon={<BarChart3 size={18} />}
                />
                <CompactKPI
                    label="Margen promedio"
                    value={`${avgMargin}%`}
                    icon={<TrendingUp size={18} />}
                    variant={avgMargin > 25 ? 'success' : 'warning'}
                />
                <CompactKPI
                    label="Stock bajo (top sellers)"
                    value={lowStockTopSellers.length}
                    icon={<AlertTriangle size={18} />}
                    variant={lowStockTopSellers.length > 0 ? 'danger' : 'success'}
                    onClick={lowStockTopSellers.length > 0 ? () => navigate('/productos?filter=low-stock') : undefined}
                />
            </KPIGrid>
            
            {/* Low Stock Alert */}
            {lowStockTopSellers.length > 0 && (
                <Card>
                    <CardBody>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-2)', borderLeft: '4px solid var(--color-danger-500)', paddingLeft: 'var(--space-4)' }}>
                            <div style={{ 
                                background: 'var(--color-danger-100)', 
                                color: 'var(--color-danger-600)',
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-lg)'
                            }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, marginBottom: 'var(--space-1)' }}>
                                    ⚠️ {lowStockTopSellers.length} productos top con stock bajo
                                </h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                    {lowStockTopSellers.map(p => p.name).join(', ')}
                                </p>
                            </div>
                            <Button variant="danger" size="sm" onClick={() => navigate('/productos?filter=low-stock')}>
                                Ver productos
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
            
            {/* Charts */}
            <div className="charts-grid charts-grid-2">
                {/* Top by Revenue */}
                <Card>
                    <CardHeader 
                        title="Top productos por facturación"
                    />
                    <CardBody>
                        <SimpleBarChart
                            data={revenueChartData}
                            bars={[{ key: 'value', name: 'Facturación', color: COLORS.primary }]}
                            layout="horizontal"
                            height={300}
                        />
                    </CardBody>
                </Card>
                
                {/* Top by Margin */}
                <Card>
                    <CardHeader 
                        title="Top productos por margen"
                    />
                    <CardBody>
                        <SimpleBarChart
                            data={marginChartData}
                            bars={[{ key: 'value', name: 'Margen', color: COLORS.success }]}
                            layout="horizontal"
                            height={300}
                        />
                    </CardBody>
                </Card>
            </div>
            
            {/* ABC Table */}
            <Card>
                <CardHeader 
                    title="Clasificación ABC"
                    subtitle="A: 70% ventas | B: 20% ventas | C: 10% ventas"
                    actions={
                        <SearchInput
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                        />
                    }
                />
                <CardBody noPadding>
                    <Table<ClassifiedProduct>
                        columns={[
                            { 
                                key: 'classification', 
                                header: 'ABC',
                                render: (row) => (
                                    <Badge 
                                        variant={row.classification === 'A' ? 'success' : row.classification === 'B' ? 'warning' : 'secondary'}
                                    >
                                        {row.classification}
                                    </Badge>
                                ),
                                align: 'center'
                            },
                            { 
                                key: 'name', 
                                header: 'Producto',
                                render: (row) => row.name
                            },
                            { 
                                key: 'units', 
                                header: 'Unidades',
                                render: (row) => row.units.toLocaleString('es-AR'),
                                align: 'right'
                            },
                            { 
                                key: 'revenue', 
                                header: 'Facturación',
                                render: (row) => formatCurrency(row.revenue),
                                align: 'right'
                            },
                            { 
                                key: 'marginPercentage', 
                                header: 'Margen %',
                                render: (row) => (
                                    <span style={{ color: row.marginPercentage && row.marginPercentage > 25 ? 'var(--color-success-600)' : 'var(--text-secondary)' }}>
                                        {row.marginPercentage || 0}%
                                    </span>
                                ),
                                align: 'right'
                            },
                            { 
                                key: 'actions', 
                                header: '',
                                render: (row) => (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/productos/${row.id}`)}
                                    >
                                        Ver
                                    </Button>
                                ),
                                align: 'center'
                            }
                        ]}
                        data={filteredProducts}
                        keyExtractor={(row) => row.id}
                        emptyMessage="No hay datos de productos"
                    />
                </CardBody>
            </Card>
        </div>
    );
}
