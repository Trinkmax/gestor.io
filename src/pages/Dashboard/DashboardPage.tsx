// ================================
// DASHBOARD PAGE - 2026 UI/UX Edition
// Premium Modern Design System
// ================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Wallet,
    DollarSign,
    CreditCard,
    Banknote,
    ArrowRight,
    AlertTriangle,
    Package,
    Users,
    TrendingUp,
    Calendar,
    Sparkles,
    ArrowUpRight,
    Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody, StatCard, AlertCard, Button, Badge, FilterPill } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency } from '../../mocks/generators';
import { getOpenCashRegister, mockSales } from '../../mocks/data/sales';
import { getLowStockProducts } from '../../mocks/data/products';
import { getDebtors, getTotalDebt } from '../../mocks/data/clients';
import './Dashboard.css';

type DateRange = 'today' | '7d' | '30d';

// Greeting message based on time of day
function getGreeting(): { message: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return { message: '¡Buenos días', emoji: '☀️' };
    } else if (hour >= 12 && hour < 19) {
        return { message: '¡Buenas tardes', emoji: '🌤️' };
    } else {
        return { message: '¡Buenas noches', emoji: '🌙' };
    }
}

// Format date for display
function getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date().toLocaleDateString('es-AR', options);
}

export function DashboardPage() {
    const navigate = useNavigate();
    const { currentUser, hasPermission, businessConfig } = useAuth();

    // Date range state
    const [dateRange, setDateRange] = useState<DateRange>('today');

    // Get current data
    const openCashRegister = getOpenCashRegister();
    const lowStockProducts = getLowStockProducts();
    const debtors = getDebtors().slice(0, 4);
    const totalDebt = getTotalDebt();

    // Filter sales based on date range
    const filteredSales = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return mockSales.filter(s => {
            const saleDate = new Date(s.createdAt);
            switch (dateRange) {
                case 'today':
                    return saleDate >= today;
                case '7d': {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return saleDate >= weekAgo;
                }
                case '30d': {
                    const monthAgo = new Date(today);
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    return saleDate >= monthAgo;
                }
                default:
                    return true;
            }
        });
    }, [dateRange]);

    // Calculate totals
    const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const cashTotal = filteredSales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
    const transferTotal = filteredSales.filter(s => s.paymentMethod === 'TRANSFER').reduce((sum, s) => sum + s.total, 0);
    const cardTotal = filteredSales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0);
    const creditTotal = filteredSales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.total, 0);

    // Calculate percentages for payment methods
    const getPercentage = (amount: number) => totalSalesAmount > 0 ? Math.round((amount / totalSalesAmount) * 100) : 0;

    const isCashRegisterOpen = openCashRegister !== null;
    const canSell = !businessConfig.requireCashRegisterForSales || isCashRegisterOpen;

    const dateRangeLabel = dateRange === 'today' ? 'hoy' : dateRange === '7d' ? '7 días' : '30 días';
    const greeting = getGreeting();
    const userName = currentUser?.name?.split(' ')[0] || 'Usuario';

    // SVG Donut Chart calculations
    const radius = 75;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    const paymentData = [
        { key: 'cash', value: cashTotal, color: '#22c55e', label: 'Efectivo' },
        { key: 'transfer', value: transferTotal, color: '#3b82f6', label: 'Transferencia' },
        { key: 'card', value: cardTotal, color: '#f59e0b', label: 'Tarjeta' },
        { key: 'credit', value: creditTotal, color: '#ef4444', label: 'Fiado' },
    ].filter(d => d.value > 0);

    let accumulatedOffset = 0;
    const chartSegments = paymentData.map(segment => {
        const percentage = totalSalesAmount > 0 ? segment.value / totalSalesAmount : 0;
        const dashLength = percentage * circumference;
        const dashOffset = circumference - accumulatedOffset;
        accumulatedOffset += dashLength;
        return { ...segment, dashLength, dashOffset, percentage };
    });

    return (
        <div className="dashboard">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Dashboard</h1>
                    </div>
                    <div className="page-header-actions">
                        <PermissionGate permission="ACCESS_POS">
                            <Button
                                variant="primary"
                                leftIcon={<ShoppingCart size={18} />}
                                onClick={() => navigate('/pos')}
                                disabled={!canSell}
                            >
                                Nueva venta
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    {/* Welcome Hero Section */}
                    <section className="dashboard-welcome">
                        <div className="welcome-content">
                            <div className="welcome-text">
                                <h2>
                                    {greeting.message}, {userName}!
                                    <span className="greeting-emoji">{greeting.emoji}</span>
                                </h2>
                                <p>{getFormattedDate()}</p>
                            </div>
                            <div className="welcome-stats">
                                <div className="welcome-stat">
                                    <span className="welcome-stat-value">{filteredSales.length}</span>
                                    <span className="welcome-stat-label">Ventas {dateRangeLabel}</span>
                                </div>
                                <div className="welcome-stat">
                                    <span className="welcome-stat-value">{formatCurrency(totalSalesAmount)}</span>
                                    <span className="welcome-stat-label">Facturado</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cash Register Alert */}
                    {businessConfig.requireCashRegisterForSales && !isCashRegisterOpen && hasPermission('OPEN_CASH_REGISTER') && (
                        <AlertCard
                            type="warning"
                            title="Caja cerrada"
                            message="Abrí la caja para empezar a vender. La configuración actual requiere caja abierta para registrar ventas."
                            action={
                                <Button variant="warning" size="sm" onClick={() => navigate('/caja')}>
                                    Abrir caja
                                </Button>
                            }
                        />
                    )}

                    {/* Date Range Selector */}
                    <div className="dashboard-date-selector">
                        <Calendar size={16} />
                        <span>Período:</span>
                        <div className="filter-pills">
                            <FilterPill
                                label="Hoy"
                                isActive={dateRange === 'today'}
                                onClick={() => setDateRange('today')}
                            />
                            <FilterPill
                                label="7 días"
                                isActive={dateRange === '7d'}
                                onClick={() => setDateRange('7d')}
                            />
                            <FilterPill
                                label="30 días"
                                isActive={dateRange === '30d'}
                                onClick={() => setDateRange('30d')}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="dashboard-stats">
                        {/* Cash Register Status */}
                        <Card className="dashboard-cash-status" data-open={isCashRegisterOpen}>
                            <CardBody>
                                <div className="cash-status-header">
                                    <div className="cash-status-icon" data-open={isCashRegisterOpen}>
                                        <Wallet size={24} />
                                    </div>
                                    <div className="cash-status-info">
                                        <span className="cash-status-label">Estado de caja</span>
                                        <Badge
                                            variant={isCashRegisterOpen ? 'success' : 'secondary'}
                                            withDot
                                            pulse={isCashRegisterOpen}
                                        >
                                            {isCashRegisterOpen ? 'Abierta' : 'Cerrada'}
                                        </Badge>
                                    </div>
                                </div>
                                {isCashRegisterOpen && openCashRegister && (
                                    <div className="cash-status-details">
                                        <p>
                                            <Clock size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                            Apertura: {new Date(openCashRegister.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p>
                                            <Users size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                            Por: {openCashRegister.openedByName}
                                        </p>
                                    </div>
                                )}
                                <PermissionGate permission="VIEW_CASH_REGISTER">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        rightIcon={<ArrowRight size={14} />}
                                        onClick={() => navigate('/caja')}
                                        style={{ marginTop: 'var(--space-3)' }}
                                    >
                                        Ver caja
                                    </Button>
                                </PermissionGate>
                            </CardBody>
                        </Card>

                        {/* Sales */}
                        <StatCard
                            label={`Ventas ${dateRangeLabel}`}
                            value={formatCurrency(totalSalesAmount)}
                            icon={<TrendingUp size={20} />}
                            iconColor="success"
                            onClick={() => navigate('/ventas')}
                            hint="Ver historial de ventas"
                        />

                        {/* Ticket count */}
                        <StatCard
                            label={`Tickets ${dateRangeLabel}`}
                            value={filteredSales.length}
                            icon={<ShoppingCart size={20} />}
                            iconColor="primary"
                            onClick={() => navigate('/ventas')}
                            hint="Ver detalle de tickets"
                        />

                        {/* Total debt */}
                        <PermissionGate permission="VIEW_DASHBOARD_FULL">
                            <StatCard
                                label="Deuda total"
                                value={formatCurrency(totalDebt)}
                                icon={<Users size={20} />}
                                iconColor="warning"
                                onClick={() => navigate('/clientes?filter=debtors')}
                                hint="Ver lista de deudores"
                            />
                        </PermissionGate>
                    </div>

                    {/* Payment Methods Breakdown - Premium Version */}
                    <PermissionGate permission="VIEW_DASHBOARD_FULL">
                        <Card className="payment-methods-card">
                            <CardHeader
                                title={`Desglose por medio de pago`}
                                subtitle={`Período: ${dateRangeLabel}`}
                                actions={
                                    <Badge variant="primary" size="sm">
                                        <Sparkles size={12} style={{ marginRight: '4px' }} />
                                        {filteredSales.length} transacciones
                                    </Badge>
                                }
                            />
                            <CardBody>
                                {totalSalesAmount > 0 ? (
                                    <div className="payment-summary">
                                        {/* Donut Chart */}
                                        <div className="donut-chart-container">
                                            <svg 
                                                className="donut-chart" 
                                                viewBox="0 0 200 200"
                                            >
                                                {chartSegments.map((segment, index) => (
                                                    <circle
                                                        key={segment.key}
                                                        className="donut-chart-segment"
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke={segment.color}
                                                        strokeWidth={strokeWidth}
                                                        strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                                                        strokeDashoffset={segment.dashOffset}
                                                        style={{
                                                            animationDelay: `${index * 0.1}s`
                                                        }}
                                                    />
                                                ))}
                                            </svg>
                                            <div className="donut-chart-center">
                                                <span className="donut-chart-total-label">Total</span>
                                                <span className="donut-chart-total-value">{formatCurrency(totalSalesAmount)}</span>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="payment-legend">
                                            <div className="payment-legend-item" onClick={() => navigate('/ventas?payment=CASH')}>
                                                <span className="payment-legend-dot cash"></span>
                                                <div className="payment-legend-info">
                                                    <span className="payment-legend-label">Efectivo ({getPercentage(cashTotal)}%)</span>
                                                    <span className="payment-legend-value">{formatCurrency(cashTotal)}</span>
                                                </div>
                                            </div>
                                            <div className="payment-legend-item" onClick={() => navigate('/ventas?payment=TRANSFER')}>
                                                <span className="payment-legend-dot transfer"></span>
                                                <div className="payment-legend-info">
                                                    <span className="payment-legend-label">Transferencia ({getPercentage(transferTotal)}%)</span>
                                                    <span className="payment-legend-value">{formatCurrency(transferTotal)}</span>
                                                </div>
                                            </div>
                                            <div className="payment-legend-item" onClick={() => navigate('/ventas?payment=CARD')}>
                                                <span className="payment-legend-dot card"></span>
                                                <div className="payment-legend-info">
                                                    <span className="payment-legend-label">Tarjeta ({getPercentage(cardTotal)}%)</span>
                                                    <span className="payment-legend-value">{formatCurrency(cardTotal)}</span>
                                                </div>
                                            </div>
                                            <div className="payment-legend-item" onClick={() => navigate('/ventas?payment=CREDIT')}>
                                                <span className="payment-legend-dot credit"></span>
                                                <div className="payment-legend-info">
                                                    <span className="payment-legend-label">Fiado ({getPercentage(creditTotal)}%)</span>
                                                    <span className="payment-legend-value">{formatCurrency(creditTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        <Package size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-4)' }} />
                                        <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                                            No hay ventas en el período seleccionado
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </PermissionGate>

                    {/* Payment Methods Grid - Alternative visual */}
                    <PermissionGate permission="VIEW_DASHBOARD_FULL">
                        <div className="payment-methods-grid">
                            <div className="payment-method-item cash" onClick={() => navigate('/ventas?payment=CASH')}>
                                <div className="payment-method-icon cash">
                                    <Banknote size={22} />
                                </div>
                                <div className="payment-method-info">
                                    <span className="payment-method-label">Efectivo</span>
                                    <span className="payment-method-value">{formatCurrency(cashTotal)}</span>
                                    <div className="payment-method-percentage">
                                        <ArrowUpRight size={12} />
                                        {getPercentage(cashTotal)}% del total
                                    </div>
                                    <div className="payment-method-bar">
                                        <div 
                                            className="payment-method-bar-fill cash" 
                                            style={{ width: `${getPercentage(cashTotal)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="payment-method-item transfer" onClick={() => navigate('/ventas?payment=TRANSFER')}>
                                <div className="payment-method-icon transfer">
                                    <DollarSign size={22} />
                                </div>
                                <div className="payment-method-info">
                                    <span className="payment-method-label">Transferencia</span>
                                    <span className="payment-method-value">{formatCurrency(transferTotal)}</span>
                                    <div className="payment-method-percentage">
                                        <ArrowUpRight size={12} />
                                        {getPercentage(transferTotal)}% del total
                                    </div>
                                    <div className="payment-method-bar">
                                        <div 
                                            className="payment-method-bar-fill transfer" 
                                            style={{ width: `${getPercentage(transferTotal)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="payment-method-item card" onClick={() => navigate('/ventas?payment=CARD')}>
                                <div className="payment-method-icon card">
                                    <CreditCard size={22} />
                                </div>
                                <div className="payment-method-info">
                                    <span className="payment-method-label">Tarjeta</span>
                                    <span className="payment-method-value">{formatCurrency(cardTotal)}</span>
                                    <div className="payment-method-percentage">
                                        <ArrowUpRight size={12} />
                                        {getPercentage(cardTotal)}% del total
                                    </div>
                                    <div className="payment-method-bar">
                                        <div 
                                            className="payment-method-bar-fill card" 
                                            style={{ width: `${getPercentage(cardTotal)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="payment-method-item credit" onClick={() => navigate('/ventas?payment=CREDIT')}>
                                <div className="payment-method-icon credit">
                                    <Users size={22} />
                                </div>
                                <div className="payment-method-info">
                                    <span className="payment-method-label">Fiado</span>
                                    <span className="payment-method-value">{formatCurrency(creditTotal)}</span>
                                    <div className="payment-method-percentage">
                                        <ArrowUpRight size={12} />
                                        {getPercentage(creditTotal)}% del total
                                    </div>
                                    <div className="payment-method-bar">
                                        <div 
                                            className="payment-method-bar-fill credit" 
                                            style={{ width: `${getPercentage(creditTotal)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PermissionGate>

                    {/* Alerts Grid */}
                    <div className="dashboard-alerts">
                        {/* Low Stock Alert */}
                        {lowStockProducts.length > 0 && (
                            <Card className="alert-card-premium danger">
                                <CardHeader
                                    title="Stock bajo"
                                    actions={
                                        <Badge variant="danger">{lowStockProducts.length} productos</Badge>
                                    }
                                />
                                <CardBody compact>
                                    <div className="alert-list">
                                        {lowStockProducts.slice(0, 5).map(product => (
                                            <div 
                                                key={product.id} 
                                                className="alert-list-item"
                                                onClick={() => navigate(`/productos/${product.id}`)}
                                            >
                                                <div className="alert-list-item-icon danger">
                                                    <Package size={16} />
                                                </div>
                                                <span className="alert-list-name">{product.name}</span>
                                                <Badge variant="danger" size="sm">
                                                    {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        fullWidth
                                        rightIcon={<ArrowRight size={14} />}
                                        onClick={() => navigate('/productos?filter=low-stock')}
                                        style={{ marginTop: 'var(--space-3)' }}
                                    >
                                        Ver todos los productos
                                    </Button>
                                </CardBody>
                            </Card>
                        )}

                        {/* Top Debtors Alert */}
                        <PermissionGate permission="VIEW_DASHBOARD_FULL">
                            {debtors.length > 0 && (
                                <Card className="alert-card-premium warning">
                                    <CardHeader
                                        title="Mayores deudores"
                                        actions={
                                            <Badge variant="warning">{formatCurrency(totalDebt)} total</Badge>
                                        }
                                    />
                                    <CardBody compact>
                                        <div className="alert-list">
                                            {debtors.map(client => (
                                                <div 
                                                    key={client.id} 
                                                    className="alert-list-item"
                                                    onClick={() => navigate(`/clientes/${client.id}`)}
                                                >
                                                    <div className="alert-list-item-icon warning">
                                                        <AlertTriangle size={16} />
                                                    </div>
                                                    <span className="alert-list-name">{client.name}</span>
                                                    <Badge variant="warning" size="sm">
                                                        {formatCurrency(client.balance)}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            fullWidth
                                            rightIcon={<ArrowRight size={14} />}
                                            onClick={() => navigate('/clientes?filter=debtors')}
                                            style={{ marginTop: 'var(--space-3)' }}
                                        >
                                            Ver todos los deudores
                                        </Button>
                                    </CardBody>
                                </Card>
                            )}
                        </PermissionGate>
                    </div>

                    {/* Quick Actions - Premium */}
                    <Card className="quick-actions-card">
                        <CardHeader 
                            title="Accesos rápidos" 
                            subtitle="Accede rápidamente a las funciones más usadas"
                        />
                        <CardBody>
                            <div className="quick-actions">
                                <PermissionGate permission="ACCESS_POS">
                                    <button 
                                        className="quick-action" 
                                        onClick={() => navigate('/pos')} 
                                        disabled={!canSell}
                                    >
                                        <div className="quick-action-icon primary">
                                            <ShoppingCart size={24} />
                                        </div>
                                        <span>Nueva Venta</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="VIEW_PRODUCTS">
                                    <button className="quick-action" onClick={() => navigate('/productos')}>
                                        <div className="quick-action-icon success">
                                            <Package size={24} />
                                        </div>
                                        <span>Productos</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="VIEW_CLIENTS">
                                    <button className="quick-action" onClick={() => navigate('/clientes')}>
                                        <div className="quick-action-icon warning">
                                            <Users size={24} />
                                        </div>
                                        <span>Clientes</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="EXPORT_DATA">
                                    <button className="quick-action" onClick={() => navigate('/exportaciones')}>
                                        <div className="quick-action-icon primary">
                                            <TrendingUp size={24} />
                                        </div>
                                        <span>Reportes</span>
                                    </button>
                                </PermissionGate>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
