// ================================
// EXPORTS PAGE
// Sistema de Gestión Comercial
// ================================

import { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, Users, ShoppingCart, Wallet, CheckCircle2 } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatDate } from '../../mocks/generators';
import './ExportsPage.css';

interface ExportOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    fields: ('dateRange' | 'client')[];
}

const exportOptions: ExportOption[] = [
    {
        id: 'sales',
        title: 'Ventas',
        description: 'Exporta el listado de ventas con detalle de productos, montos y formas de pago.',
        icon: <ShoppingCart size={24} />,
        fields: ['dateRange'],
    },
    {
        id: 'cash-closings',
        title: 'Cierres de Caja',
        description: 'Exporta el historial de aperturas y cierres de caja con diferencias.',
        icon: <Wallet size={24} />,
        fields: ['dateRange'],
    },
    {
        id: 'debtors',
        title: 'Deudores',
        description: 'Exporta la lista de clientes con deuda pendiente y sus montos.',
        icon: <Users size={24} />,
        fields: [],
    },
    {
        id: 'client-statement',
        title: 'Estado de cuenta cliente',
        description: 'Exporta los movimientos de un cliente específico.',
        icon: <FileSpreadsheet size={24} />,
        fields: ['client', 'dateRange'],
    },
];

export function ExportsPage() {
    const { showToast } = useUI();

    const [selectedExport, setSelectedExport] = useState<string | null>(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [lastExport, setLastExport] = useState<{ type: string; date: Date } | null>(null);

    const currentOption = exportOptions.find(o => o.id === selectedExport);

    const handleExport = async () => {
        if (!selectedExport) return;

        // Validate required fields
        if (currentOption?.fields.includes('dateRange') && (!dateFrom || !dateTo)) {
            showToast('warning', 'Seleccioná el rango de fechas');
            return;
        }

        if (currentOption?.fields.includes('client') && !selectedClient) {
            showToast('warning', 'Seleccioná un cliente');
            return;
        }

        setIsExporting(true);

        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock CSV download
        const csvContent = generateMockCSV(selectedExport);
        downloadCSV(csvContent, `${selectedExport}-${formatDate(new Date())}.csv`);

        setIsExporting(false);
        setLastExport({ type: selectedExport, date: new Date() });
        showToast('success', 'Archivo exportado correctamente');
    };

    const generateMockCSV = (type: string): string => {
        switch (type) {
            case 'sales':
                return `Fecha,Número,Cliente,Productos,Total,Forma de Pago
2026-01-04,1001,Consumidor Final,"Coca Cola x2, Pan Lactal",2450,Efectivo
2026-01-04,1002,María García,"Leche, Queso, Jamón",5800,Transferencia
2026-01-03,1000,Juan Pérez,"Arroz, Fideos, Aceite",3200,Fiado`;

            case 'cash-closings':
                return `Fecha Apertura,Fecha Cierre,Monto Inicial,Ventas Efectivo,Gastos,Esperado,Contado,Diferencia
2026-01-04 08:00,2026-01-04 20:00,5000,15000,2000,18000,18000,0
2026-01-03 08:30,2026-01-03 20:30,5000,12300,1500,15800,15750,-50`;

            case 'debtors':
                return `Cliente,Teléfono,Deuda,Última Actividad
Juan Pérez,11-1234-5678,15000,2026-01-04
María García,11-2345-6789,8500,2026-01-03
Carlos López,11-3456-7890,22000,2026-01-02`;

            case 'client-statement':
                return `Fecha,Tipo,Referencia,Importe,Saldo
2026-01-04,Venta,#1002,+3500,18500
2026-01-03,Pago,-,-5000,15000
2026-01-02,Venta,#998,+8000,20000`;

            default:
                return '';
        }
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="exports-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Exportaciones</h1>
                        <p className="page-subtitle">Descargá tus datos en formato CSV</p>
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    <PermissionGate permission="EXPORT_DATA" showLocked>
                        <div className="exports-grid">
                            {/* Export Options */}
                            <Card>
                                <CardHeader title="Tipo de exportación" />
                                <CardBody>
                                    <div className="export-options">
                                        {exportOptions.map(option => (
                                            <button
                                                key={option.id}
                                                className={`export-option ${selectedExport === option.id ? 'active' : ''}`}
                                                onClick={() => setSelectedExport(option.id)}
                                            >
                                                <div className="export-option-icon">{option.icon}</div>
                                                <div className="export-option-content">
                                                    <span className="export-option-title">{option.title}</span>
                                                    <span className="export-option-desc">{option.description}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Export Config */}
                            <Card>
                                <CardHeader title="Configurar exportación" />
                                <CardBody>
                                    {!selectedExport ? (
                                        <div className="export-placeholder">
                                            <FileSpreadsheet size={48} />
                                            <p>Seleccioná un tipo de exportación para continuar</p>
                                        </div>
                                    ) : (
                                        <div className="export-config">
                                            <h3>{currentOption?.title}</h3>

                                            {currentOption?.fields.includes('client') && (
                                                <Select
                                                    label="Cliente"
                                                    value={selectedClient}
                                                    onChange={e => setSelectedClient(e.target.value)}
                                                    options={[
                                                        { value: 'client-1', label: 'Juan Pérez' },
                                                        { value: 'client-2', label: 'María García' },
                                                        { value: 'client-3', label: 'Carlos López' },
                                                    ]}
                                                    placeholder="Seleccionar cliente..."
                                                />
                                            )}

                                            {currentOption?.fields.includes('dateRange') && (
                                                <div className="export-date-range">
                                                    <Input
                                                        label="Desde"
                                                        type="date"
                                                        value={dateFrom}
                                                        onChange={e => setDateFrom(e.target.value)}
                                                        leftIcon={<Calendar size={16} />}
                                                    />
                                                    <Input
                                                        label="Hasta"
                                                        type="date"
                                                        value={dateTo}
                                                        onChange={e => setDateTo(e.target.value)}
                                                        leftIcon={<Calendar size={16} />}
                                                    />
                                                </div>
                                            )}

                                            {currentOption?.fields.length === 0 && (
                                                <p className="text-secondary text-sm">
                                                    Esta exportación no requiere configuración adicional.
                                                </p>
                                            )}

                                            <Button
                                                variant="primary"
                                                leftIcon={<Download size={18} />}
                                                onClick={handleExport}
                                                isLoading={isExporting}
                                                fullWidth
                                                style={{ marginTop: 'var(--space-4)' }}
                                            >
                                                Exportar CSV
                                            </Button>

                                            {lastExport && lastExport.type === selectedExport && (
                                                <div className="export-success">
                                                    <CheckCircle2 size={16} />
                                                    <span>
                                                        Última exportación: {formatDate(lastExport.date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </PermissionGate>
                </div>
            </div>
        </div>
    );
}
