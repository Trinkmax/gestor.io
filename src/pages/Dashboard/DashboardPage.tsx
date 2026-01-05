// ================================
// DASHBOARD PAGE
// Sistema de Gestión Comercial
// ================================

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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody, StatCard, AlertCard, Button, Badge } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency } from '../../mocks/generators';
import { getOpenCashRegister, mockSales } from '../../mocks/data/sales';
import { getLowStockProducts } from '../../mocks/data/products';
import { getDebtors, getTotalDebt } from '../../mocks/data/clients';
import './Dashboard.css';

export function DashboardPage() {
    const navigate = useNavigate();
    const { hasPermission, businessConfig } = useAuth();

    // Get current data
    const openCashRegister = getOpenCashRegister();
    const todaySales = mockSales.filter(s => {
        const today = new Date();
        const saleDate = new Date(s.createdAt);
        return saleDate.toDateString() === today.toDateString();
    });
    const lowStockProducts = getLowStockProducts();
    const debtors = getDebtors().slice(0, 3);
    const totalDebt = getTotalDebt();

    // Calculate totals
    const totalSalesAmount = todaySales.reduce((sum, s) => sum + s.total, 0);
    const cashTotal = todaySales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
    const transferTotal = todaySales.filter(s => s.paymentMethod === 'TRANSFER').reduce((sum, s) => sum + s.total, 0);
    const cardTotal = todaySales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.total, 0);
    const creditTotal = todaySales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.total, 0);

    const isCashRegisterOpen = openCashRegister !== null;
    const canSell = !businessConfig.requireCashRegisterForSales || isCashRegisterOpen;

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

                    {/* Stats Grid */}
                    <div className="dashboard-stats">
                        {/* Cash Register Status */}
                        <Card className="dashboard-cash-status">
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
                                        <p>Apertura: {new Date(openCashRegister.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p>Por: {openCashRegister.openedByName}</p>
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

                        {/* Today's Sales */}
                        <StatCard
                            label="Ventas hoy"
                            value={formatCurrency(totalSalesAmount)}
                            icon={<TrendingUp size={20} />}
                            iconColor="success"
                        />

                        {/* Ticket count */}
                        <StatCard
                            label="Tickets hoy"
                            value={todaySales.length}
                            icon={<ShoppingCart size={20} />}
                            iconColor="primary"
                        />

                        {/* Total debt */}
                        <PermissionGate permission="VIEW_DASHBOARD_FULL">
                            <StatCard
                                label="Deuda total"
                                value={formatCurrency(totalDebt)}
                                icon={<Users size={20} />}
                                iconColor="warning"
                            />
                        </PermissionGate>
                    </div>

                    {/* Payment Methods Breakdown */}
                    <PermissionGate permission="VIEW_DASHBOARD_FULL">
                        <Card>
                            <CardHeader title="Ventas por medio de pago (hoy)" />
                            <CardBody>
                                <div className="payment-methods-grid">
                                    <div className="payment-method-item">
                                        <div className="payment-method-icon cash">
                                            <Banknote size={20} />
                                        </div>
                                        <div className="payment-method-info">
                                            <span className="payment-method-label">Efectivo</span>
                                            <span className="payment-method-value">{formatCurrency(cashTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="payment-method-item">
                                        <div className="payment-method-icon transfer">
                                            <DollarSign size={20} />
                                        </div>
                                        <div className="payment-method-info">
                                            <span className="payment-method-label">Transferencia</span>
                                            <span className="payment-method-value">{formatCurrency(transferTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="payment-method-item">
                                        <div className="payment-method-icon card">
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="payment-method-info">
                                            <span className="payment-method-label">Tarjeta</span>
                                            <span className="payment-method-value">{formatCurrency(cardTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="payment-method-item">
                                        <div className="payment-method-icon credit">
                                            <Users size={20} />
                                        </div>
                                        <div className="payment-method-info">
                                            <span className="payment-method-label">Fiado</span>
                                            <span className="payment-method-value">{formatCurrency(creditTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </PermissionGate>

                    {/* Alerts Grid */}
                    <div className="dashboard-alerts">
                        {/* Low Stock Alert */}
                        {lowStockProducts.length > 0 && (
                            <Card>
                                <CardHeader
                                    title="Stock bajo"
                                    actions={
                                        <Badge variant="danger">{lowStockProducts.length}</Badge>
                                    }
                                />
                                <CardBody compact>
                                    <div className="alert-list">
                                        {lowStockProducts.slice(0, 5).map(product => (
                                            <div key={product.id} className="alert-list-item">
                                                <Package size={16} className="text-danger" />
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
                                        onClick={() => navigate('/productos?filter=low-stock')}
                                        style={{ marginTop: 'var(--space-3)' }}
                                    >
                                        Ver todos
                                    </Button>
                                </CardBody>
                            </Card>
                        )}

                        {/* Top Debtors Alert */}
                        <PermissionGate permission="VIEW_DASHBOARD_FULL">
                            {debtors.length > 0 && (
                                <Card>
                                    <CardHeader
                                        title="Mayores deudores"
                                        actions={
                                            <Badge variant="warning">{debtors.length}</Badge>
                                        }
                                    />
                                    <CardBody compact>
                                        <div className="alert-list">
                                            {debtors.map(client => (
                                                <div key={client.id} className="alert-list-item">
                                                    <AlertTriangle size={16} className="text-warning" />
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
                                            onClick={() => navigate('/clientes?filter=debtors')}
                                            style={{ marginTop: 'var(--space-3)' }}
                                        >
                                            Ver todos
                                        </Button>
                                    </CardBody>
                                </Card>
                            )}
                        </PermissionGate>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader title="Accesos rápidos" />
                        <CardBody>
                            <div className="quick-actions">
                                <PermissionGate permission="ACCESS_POS">
                                    <button className="quick-action" onClick={() => navigate('/pos')} disabled={!canSell}>
                                        <ShoppingCart size={24} />
                                        <span>Vender</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="VIEW_PRODUCTS">
                                    <button className="quick-action" onClick={() => navigate('/productos')}>
                                        <Package size={24} />
                                        <span>Productos</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="VIEW_CLIENTS">
                                    <button className="quick-action" onClick={() => navigate('/clientes')}>
                                        <Users size={24} />
                                        <span>Clientes</span>
                                    </button>
                                </PermissionGate>

                                <PermissionGate permission="EXPORT_DATA">
                                    <button className="quick-action" onClick={() => navigate('/exportaciones')}>
                                        <TrendingUp size={24} />
                                        <span>Exportar</span>
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
