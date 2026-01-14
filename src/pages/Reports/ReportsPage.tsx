// ================================
// REPORTS PAGE
// Main analytics page with tabs
// ================================

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    BarChart3,
    Download,
    Link2,
    Check,
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    Package,
    Users
} from 'lucide-react';
import { Button } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { Skeleton } from '../../components/ui/Skeleton';
import { useReportsData } from './hooks/useReportsData';
import { ReportFilterBar } from './components/ReportFilterBar';
import { SummaryTab, SalesTab, CashTab, ProductsTab, ClientsTab } from './tabs';
import './ReportsPage.css';

type TabId = 'summary' | 'sales' | 'cash' | 'products' | 'clients';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: 'summary', label: 'Resumen', icon: <LayoutDashboard size={18} /> },
    { id: 'sales', label: 'Ventas', icon: <ShoppingCart size={18} /> },
    { id: 'cash', label: 'Caja', icon: <Wallet size={18} /> },
    { id: 'products', label: 'Productos', icon: <Package size={18} /> },
    { id: 'clients', label: 'Clientes (Fiado)', icon: <Users size={18} /> }
];

function LoadingState() {
    return (
        <div className="reports-loading">
            <div className="loading-kpis">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} height={90} className="loading-kpi" />
                ))}
            </div>
            <div className="loading-charts">
                <Skeleton height={350} />
                <Skeleton height={350} />
            </div>
            <Skeleton height={400} />
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="reports-error">
            <BarChart3 size={64} />
            <h3>Error cargando reportes</h3>
            <p>{message}</p>
            <Button variant="primary" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    );
}

function EmptyState() {
    const navigate = useNavigate();
    return (
        <div className="reports-empty">
            <BarChart3 size={64} />
            <h3>No hay datos para el período seleccionado</h3>
            <p>Probá seleccionando un rango de fechas diferente o creá tu primera venta.</p>
            <Button variant="primary" onClick={() => navigate('/pos')}>
                Crear primera venta
            </Button>
        </div>
    );
}

export function ReportsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [copied, setCopied] = useState(false);
    
    // Get active tab from URL or default to summary
    const activeTab = (searchParams.get('tab') as TabId) || 'summary';
    
    // Get reports data
    const data = useReportsData();
    const { isLoading, error, filters, dateRange, updateFilters, resetFilters, kpis } = data;
    
    const setActiveTab = (tab: TabId) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', tab);
        setSearchParams(newParams, { replace: true });
    };
    
    const handleExport = () => {
        // Build export URL with current filters
        const exportParams = new URLSearchParams();
        exportParams.set('type', activeTab === 'clients' ? 'debtors' : 'sales');
        if (dateRange) {
            exportParams.set('from', dateRange.start.toISOString().split('T')[0]);
            exportParams.set('to', dateRange.end.toISOString().split('T')[0]);
        }
        navigate(`/exportaciones?${exportParams.toString()}`);
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
    
    const renderTabContent = () => {
        if (isLoading) return <LoadingState />;
        if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
        if (!kpis || kpis.current.totalRevenue === 0) return <EmptyState />;
        
        switch (activeTab) {
            case 'summary':
                return <SummaryTab data={data} />;
            case 'sales':
                return <SalesTab data={data} />;
            case 'cash':
                return <CashTab data={data} />;
            case 'products':
                return <ProductsTab data={data} />;
            case 'clients':
                return <ClientsTab data={data} />;
            default:
                return <SummaryTab data={data} />;
        }
    };
    
    return (
        <div className="reports-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <BarChart3 size={28} style={{ marginRight: 'var(--space-3)' }} />
                            Reportes
                        </h1>
                        <p className="page-subtitle">
                            Analizá ventas, caja, stock y fiado
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <Button
                            variant="ghost"
                            leftIcon={copied ? <Check size={18} /> : <Link2 size={18} />}
                            onClick={handleCopyLink}
                        >
                            {copied ? 'Copiado' : 'Copiar enlace'}
                        </Button>
                        <PermissionGate permission="EXPORT_DATA">
                            <Button
                                variant="secondary"
                                leftIcon={<Download size={18} />}
                                onClick={handleExport}
                            >
                                Exportar
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            </header>
            
            <div className="page-content">
                <div className="page-content-inner">
                    {/* Filter Bar */}
                    <ReportFilterBar
                        filters={filters}
                        onFiltersChange={updateFilters}
                        onReset={resetFilters}
                        dateRange={dateRange}
                    />
                    
                    {/* Tabs */}
                    <div className="reports-tabs">
                        <div className="reports-tabs-list" role="tablist">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    className={`reports-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="reports-tab-panel" role="tabpanel">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
