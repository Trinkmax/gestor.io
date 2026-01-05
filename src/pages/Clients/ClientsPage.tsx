// ================================
// CLIENTS PAGE
// Sistema de Gestión Comercial
// ================================

import { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    Search,
    Phone,
    DollarSign,
    ArrowRight,
    Edit2,
    CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardBody, Button, Badge, Input, Modal, FilterPill } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency, formatRelativeDate } from '../../mocks/generators';
import { mockClients, getTotalDebt } from '../../mocks/data/clients';
import { mockAccountMovements } from '../../mocks/data/sales';
import type { Client } from '../../types';
import './ClientsPage.css';

type Filter = 'all' | 'debtors' | 'credit';

export function ClientsPage() {
    const { hasPermission } = useAuth();
    const { showToast } = useUI();

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [showClientModal, setShowClientModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [paymentNote, setPaymentNote] = useState('');

    // Filter clients
    const filteredClients = useMemo(() => {
        let clients = [...mockClients];

        switch (filter) {
            case 'debtors':
                clients = clients.filter(c => c.balance > 0);
                break;
            case 'credit':
                clients = clients.filter(c => c.balance < 0);
                break;
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            clients = clients.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.phone?.includes(query)
            );
        }

        return clients.sort((a, b) => b.balance - a.balance);
    }, [filter, searchQuery]);

    const counts = useMemo(() => ({
        all: mockClients.length,
        debtors: mockClients.filter(c => c.balance > 0).length,
        credit: mockClients.filter(c => c.balance < 0).length,
    }), []);

    const totalDebt = getTotalDebt();
    const canCreate = hasPermission('CREATE_CLIENT');
    const canEdit = hasPermission('EDIT_CLIENT');

    // Open create modal
    const openCreateModal = () => {
        setEditingClient(null);
        setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
        setShowClientModal(true);
    };

    // Open edit modal
    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            notes: client.notes || '',
        });
        setShowClientModal(true);
    };

    // View account
    const viewAccount = (client: Client) => {
        setSelectedClient(client);
        setShowAccountModal(true);
    };

    // Open payment modal
    const openPaymentModal = (client: Client) => {
        setSelectedClient(client);
        setPaymentAmount('');
        setPaymentMethod('CASH');
        setPaymentNote('');
        setShowPaymentModal(true);
    };

    // Handle save
    const handleSave = () => {
        if (!formData.name.trim()) {
            showToast('warning', 'El nombre es obligatorio');
            return;
        }

        showToast('success', editingClient ? 'Cliente actualizado' : 'Cliente creado');
        setShowClientModal(false);
    };

    // Handle payment
    const handlePayment = () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('warning', 'Ingresá un monto válido');
            return;
        }

        showToast('success', `Pago de ${formatCurrency(amount)} registrado`);
        setShowPaymentModal(false);
    };

    // Get movements for selected client
    const clientMovements = useMemo(() => {
        if (!selectedClient) return [];
        return mockAccountMovements.filter(m => m.clientId === selectedClient.id);
    }, [selectedClient]);

    return (
        <div className="clients-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Clientes</h1>
                        <p className="page-subtitle">
                            Deuda total: <strong>{formatCurrency(totalDebt)}</strong>
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <PermissionGate permission="CREATE_CLIENT">
                            <Button
                                variant="primary"
                                leftIcon={<Plus size={18} />}
                                onClick={openCreateModal}
                            >
                                Nuevo cliente
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    <Card>
                        {/* Toolbar */}
                        <div className="table-toolbar">
                            <div className="table-toolbar-left">
                                <div className="search-input" style={{ width: '300px' }}>
                                    <span className="search-input-icon"><Search size={18} /></span>
                                    <input
                                        type="search"
                                        className="input"
                                        placeholder="Buscar por nombre o teléfono..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="filter-pills">
                                    <FilterPill
                                        label="Todos"
                                        count={counts.all}
                                        isActive={filter === 'all'}
                                        onClick={() => setFilter('all')}
                                    />
                                    <FilterPill
                                        label="Deudores"
                                        count={counts.debtors}
                                        isActive={filter === 'debtors'}
                                        onClick={() => setFilter('debtors')}
                                    />
                                    <FilterPill
                                        label="Saldo a favor"
                                        count={counts.credit}
                                        isActive={filter === 'credit'}
                                        onClick={() => setFilter('credit')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <CardBody noPadding>
                            {filteredClients.length === 0 ? (
                                <div className="table-empty">
                                    <Users size={48} className="table-empty-icon" />
                                    <h3 className="table-empty-title">No hay clientes</h3>
                                    <p className="table-empty-message">
                                        {searchQuery ? 'No se encontraron clientes.' : 'Agregá clientes para gestionar fiado.'}
                                    </p>
                                    {canCreate && !searchQuery && (
                                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                                            Agregar cliente
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Teléfono</th>
                                            <th className="text-right">Saldo</th>
                                            <th>Última actividad</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClients.map(client => (
                                            <tr key={client.id}>
                                                <td>
                                                    <span className="client-name">{client.name}</span>
                                                </td>
                                                <td>
                                                    {client.phone ? (
                                                        <span className="client-phone">
                                                            <Phone size={14} />
                                                            {client.phone}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="text-right">
                                                    {client.balance > 0 ? (
                                                        <Badge variant="danger">
                                                            Debe {formatCurrency(client.balance)}
                                                        </Badge>
                                                    ) : client.balance < 0 ? (
                                                        <Badge variant="success">
                                                            A favor {formatCurrency(Math.abs(client.balance))}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Sin saldo</Badge>
                                                    )}
                                                </td>
                                                <td className="text-tertiary text-sm">
                                                    {client.lastActivityAt
                                                        ? formatRelativeDate(client.lastActivityAt)
                                                        : 'Sin actividad'}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            leftIcon={<ArrowRight size={14} />}
                                                            onClick={() => viewAccount(client)}
                                                        >
                                                            Ver cuenta
                                                        </Button>
                                                        <PermissionGate permission="REGISTER_PAYMENT">
                                                            {client.balance > 0 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    leftIcon={<DollarSign size={14} />}
                                                                    onClick={() => openPaymentModal(client)}
                                                                >
                                                                    Cobrar
                                                                </Button>
                                                            )}
                                                        </PermissionGate>
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                isIcon
                                                                onClick={() => openEditModal(client)}
                                                            >
                                                                <Edit2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Client Modal */}
            <Modal
                isOpen={showClientModal}
                onClose={() => setShowClientModal(false)}
                title={editingClient ? 'Editar cliente' : 'Nuevo cliente'}
                size="md"
            >
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="client-form-grid">
                        <Input
                            label="Nombre"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre completo"
                            required
                            autoFocus
                        />
                        <Input
                            label="Teléfono"
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+54 11 1234-5678"
                            isOptional
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@ejemplo.com"
                            isOptional
                        />
                        <Input
                            label="Dirección"
                            value={formData.address}
                            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Dirección"
                            isOptional
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                        <label className="form-label">Notas</label>
                        <textarea
                            className="input textarea"
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Observaciones sobre el cliente..."
                            rows={3}
                        />
                    </div>
                    <div className="modal-form-actions">
                        <Button variant="secondary" onClick={() => setShowClientModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingClient ? 'Guardar cambios' : 'Crear cliente'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Account Modal */}
            <Modal
                isOpen={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                title={selectedClient ? `Cuenta corriente: ${selectedClient.name}` : ''}
                size="lg"
            >
                {selectedClient && (
                    <div className="account-modal">
                        {/* Summary */}
                        <div className="account-summary">
                            <div className={`account-balance ${selectedClient.balance > 0 ? 'debit' : selectedClient.balance < 0 ? 'credit' : ''}`}>
                                <span className="account-balance-label">Saldo actual</span>
                                <span className="account-balance-value">
                                    {selectedClient.balance > 0 ? 'Debe ' : selectedClient.balance < 0 ? 'A favor ' : ''}
                                    {formatCurrency(Math.abs(selectedClient.balance))}
                                </span>
                            </div>
                            <PermissionGate permission="REGISTER_PAYMENT">
                                {selectedClient.balance > 0 && (
                                    <Button
                                        variant="success"
                                        leftIcon={<CreditCard size={18} />}
                                        onClick={() => {
                                            setShowAccountModal(false);
                                            openPaymentModal(selectedClient);
                                        }}
                                    >
                                        Registrar pago
                                    </Button>
                                )}
                            </PermissionGate>
                        </div>

                        {/* Movements */}
                        <div className="account-movements">
                            <h4>Historial de movimientos</h4>
                            {clientMovements.length === 0 ? (
                                <p className="text-tertiary">Sin movimientos registrados</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Referencia</th>
                                            <th className="text-right">Importe</th>
                                            <th className="text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientMovements.map(mov => (
                                            <tr key={mov.id}>
                                                <td className="text-sm">
                                                    {formatRelativeDate(mov.createdAt)}
                                                </td>
                                                <td>
                                                    <Badge variant={mov.type === 'SALE' ? 'warning' : 'success'}>
                                                        {mov.type === 'SALE' ? 'Venta' : 'Pago'}
                                                    </Badge>
                                                </td>
                                                <td className="text-sm text-tertiary">
                                                    {mov.referenceNumber ? `#${mov.referenceNumber}` : '-'}
                                                </td>
                                                <td className={`text-right font-semibold ${mov.amount > 0 ? 'text-danger' : 'text-success'}`}>
                                                    {mov.amount > 0 ? '+' : ''}{formatCurrency(mov.amount)}
                                                </td>
                                                <td className="text-right">
                                                    {formatCurrency(mov.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title={selectedClient ? `Registrar pago: ${selectedClient.name}` : ''}
                size="sm"
            >
                {selectedClient && (
                    <form onSubmit={e => { e.preventDefault(); handlePayment(); }}>
                        <div className="payment-balance">
                            Deuda actual: <strong>{formatCurrency(selectedClient.balance)}</strong>
                        </div>

                        <Input
                            label="Monto del pago"
                            type="number"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                            placeholder="0"
                            required
                            autoFocus
                        />

                        <div className="form-group">
                            <label className="form-label">Medio de pago</label>
                            <div className="payment-methods-toggle">
                                <button
                                    type="button"
                                    className={paymentMethod === 'CASH' ? 'active' : ''}
                                    onClick={() => setPaymentMethod('CASH')}
                                >
                                    Efectivo
                                </button>
                                <button
                                    type="button"
                                    className={paymentMethod === 'TRANSFER' ? 'active' : ''}
                                    onClick={() => setPaymentMethod('TRANSFER')}
                                >
                                    Transferencia
                                </button>
                            </div>
                        </div>

                        <Input
                            label="Nota"
                            value={paymentNote}
                            onChange={e => setPaymentNote(e.target.value)}
                            placeholder="Observaciones..."
                            isOptional
                        />

                        <div className="modal-form-actions">
                            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit">
                                Registrar pago
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
