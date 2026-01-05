// ================================
// CASH REGISTER PAGE
// Sistema de Gestión Comercial
// ================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Plus,
    History,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardHeader, CardBody, Button, Badge, Input, Select } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency, formatDateTime, formatTime } from '../../mocks/generators';
import { getOpenCashRegister, mockCashRegisters, mockExpenses } from '../../mocks/data/sales';
import type { ExpenseCategory } from '../../types';
import './CashRegisterPage.css';

type Tab = 'status' | 'expenses' | 'history';

export function CashRegisterPage() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { showToast, showConfirm } = useUI();

    const [activeTab, setActiveTab] = useState<Tab>('status');
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

    // Form states
    const [openAmount, setOpenAmount] = useState('');
    const [openNote, setOpenNote] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | ''>('');
    const [expenseNote, setExpenseNote] = useState('');
    const [expenseMethod, setExpenseMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [closeAmount, setCloseAmount] = useState('');
    const [closeNote, setCloseNote] = useState('');

    const openCashRegister = getOpenCashRegister();
    const isOpen = openCashRegister !== null;

    // Calculate expected cash
    const expectedCash = openCashRegister
        ? openCashRegister.openingAmount + openCashRegister.totalCash - openCashRegister.totalExpensesCash
        : 0;

    // Today's expenses
    const todayExpenses = mockExpenses.filter(e =>
        e.cashRegisterId === openCashRegister?.id
    );

    // Handle open cash register
    const handleOpen = () => {
        const amount = parseFloat(openAmount);
        if (isNaN(amount) || amount < 0) {
            showToast('warning', 'Ingresá un monto válido');
            return;
        }

        showToast('success', 'Caja abierta correctamente');
        setShowOpenModal(false);
        setOpenAmount('');
        setOpenNote('');
        // In real app, would call service to open
        navigate('/pos');
    };

    // Handle add expense
    const handleAddExpense = () => {
        const amount = parseFloat(expenseAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('warning', 'Ingresá un monto válido');
            return;
        }

        showToast('success', 'Gasto registrado');
        setShowExpenseModal(false);
        setExpenseAmount('');
        setExpenseCategory('');
        setExpenseNote('');
        setExpenseMethod('CASH');
    };

    // Handle close cash register
    const handleClose = () => {
        const counted = parseFloat(closeAmount);
        if (isNaN(counted) || counted < 0) {
            showToast('warning', 'Ingresá el efectivo contado');
            return;
        }

        const difference = counted - expectedCash;

        showConfirm({
            title: '¿Cerrar caja?',
            message: difference !== 0
                ? `Diferencia detectada: ${formatCurrency(difference)}. ¿Confirmar cierre?`
                : 'La caja cuadra correctamente.',
            confirmText: 'Cerrar caja',
            cancelText: 'Cancelar',
            variant: difference !== 0 ? 'warning' : 'default',
            onConfirm: () => {
                showToast('success', 'Caja cerrada correctamente');
                setShowCloseModal(false);
                setCloseAmount('');
                setCloseNote('');
            },
            onCancel: () => { },
        });
    };

    return (
        <div className="cash-register-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Caja</h1>
                    </div>
                    <div className="page-header-actions">
                        {isOpen ? (
                            <>
                                <PermissionGate permission="REGISTER_EXPENSE">
                                    <Button
                                        variant="secondary"
                                        leftIcon={<ArrowDownRight size={18} />}
                                        onClick={() => setShowExpenseModal(true)}
                                    >
                                        Registrar Gasto
                                    </Button>
                                </PermissionGate>
                                <PermissionGate permission="CLOSE_CASH_REGISTER">
                                    <Button
                                        variant="danger"
                                        leftIcon={<XCircle size={18} />}
                                        onClick={() => setShowCloseModal(true)}
                                    >
                                        Cerrar Caja
                                    </Button>
                                </PermissionGate>
                            </>
                        ) : (
                            <PermissionGate permission="OPEN_CASH_REGISTER">
                                <Button
                                    variant="success"
                                    leftIcon={<Wallet size={18} />}
                                    onClick={() => setShowOpenModal(true)}
                                >
                                    Abrir Caja
                                </Button>
                            </PermissionGate>
                        )}
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    {/* Tabs */}
                    <div className="cash-tabs">
                        <button
                            className={`cash-tab ${activeTab === 'status' ? 'active' : ''}`}
                            onClick={() => setActiveTab('status')}
                        >
                            <Wallet size={18} />
                            Estado Actual
                        </button>
                        <button
                            className={`cash-tab ${activeTab === 'expenses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('expenses')}
                        >
                            <ArrowDownRight size={18} />
                            Gastos del día
                            {todayExpenses.length > 0 && (
                                <Badge variant="secondary" size="sm">{todayExpenses.length}</Badge>
                            )}
                        </button>
                        <button
                            className={`cash-tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <History size={18} />
                            Historial
                        </button>
                    </div>

                    {/* Status Tab */}
                    {activeTab === 'status' && (
                        <div className="cash-status-content">
                            {isOpen && openCashRegister ? (
                                <>
                                    {/* Status Card */}
                                    <Card className="cash-status-card">
                                        <CardBody>
                                            <div className="cash-status-header">
                                                <div className="cash-status-badge open">
                                                    <CheckCircle2 size={20} />
                                                    <span>Caja abierta</span>
                                                </div>
                                                <div className="cash-status-time">
                                                    <Clock size={14} />
                                                    Desde {formatTime(openCashRegister.openedAt)}
                                                </div>
                                            </div>
                                            <p className="cash-status-user">
                                                Abierta por: {openCashRegister.openedByName}
                                            </p>
                                            {openCashRegister.openingNotes && (
                                                <p className="cash-status-note">{openCashRegister.openingNotes}</p>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {/* Amounts Grid */}
                                    <div className="cash-amounts-grid">
                                        <Card>
                                            <CardBody>
                                                <div className="cash-amount-item">
                                                    <span className="cash-amount-label">Monto inicial</span>
                                                    <span className="cash-amount-value">
                                                        {formatCurrency(openCashRegister.openingAmount)}
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody>
                                                <div className="cash-amount-item success">
                                                    <span className="cash-amount-label">
                                                        <ArrowUpRight size={16} /> Ventas efectivo
                                                    </span>
                                                    <span className="cash-amount-value">
                                                        +{formatCurrency(openCashRegister.totalCash)}
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody>
                                                <div className="cash-amount-item danger">
                                                    <span className="cash-amount-label">
                                                        <ArrowDownRight size={16} /> Gastos efectivo
                                                    </span>
                                                    <span className="cash-amount-value">
                                                        -{formatCurrency(openCashRegister.totalExpensesCash)}
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card className="cash-expected-card">
                                            <CardBody>
                                                <div className="cash-amount-item primary">
                                                    <span className="cash-amount-label">Efectivo esperado</span>
                                                    <span className="cash-amount-value large">
                                                        {formatCurrency(expectedCash)}
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    {/* Other payment methods */}
                                    <Card>
                                        <CardHeader title="Otros medios de pago (hoy)" />
                                        <CardBody>
                                            <div className="cash-other-methods">
                                                <div className="cash-other-method">
                                                    <span>Transferencias</span>
                                                    <span>{formatCurrency(openCashRegister.totalTransfer)}</span>
                                                </div>
                                                <div className="cash-other-method">
                                                    <span>Tarjetas</span>
                                                    <span>{formatCurrency(openCashRegister.totalCard)}</span>
                                                </div>
                                                <div className="cash-other-method">
                                                    <span>Fiado</span>
                                                    <span>{formatCurrency(openCashRegister.totalCredit)}</span>
                                                </div>
                                                <div className="cash-other-method total">
                                                    <span>Total ventas</span>
                                                    <span>
                                                        {formatCurrency(
                                                            openCashRegister.totalCash +
                                                            openCashRegister.totalTransfer +
                                                            openCashRegister.totalCard +
                                                            openCashRegister.totalCredit
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </>
                            ) : (
                                <Card>
                                    <CardBody>
                                        <div className="cash-closed-state">
                                            <XCircle size={48} />
                                            <h3>Caja cerrada</h3>
                                            <p>Abrí la caja para empezar a registrar ventas y movimientos.</p>
                                            <PermissionGate permission="OPEN_CASH_REGISTER">
                                                <Button
                                                    variant="success"
                                                    leftIcon={<Wallet size={18} />}
                                                    onClick={() => setShowOpenModal(true)}
                                                >
                                                    Abrir Caja
                                                </Button>
                                            </PermissionGate>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Expenses Tab */}
                    {activeTab === 'expenses' && (
                        <Card>
                            <CardHeader
                                title="Gastos del día"
                                actions={
                                    isOpen && hasPermission('REGISTER_EXPENSE') && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            leftIcon={<Plus size={16} />}
                                            onClick={() => setShowExpenseModal(true)}
                                        >
                                            Agregar
                                        </Button>
                                    )
                                }
                            />
                            <CardBody noPadding>
                                {todayExpenses.length === 0 ? (
                                    <div className="cash-empty-expenses">
                                        <DollarSign size={40} />
                                        <p>No hay gastos registrados hoy</p>
                                    </div>
                                ) : (
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Hora</th>
                                                <th>Categoría</th>
                                                <th>Nota</th>
                                                <th>Medio</th>
                                                <th className="text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {todayExpenses.map(expense => (
                                                <tr key={expense.id}>
                                                    <td>{formatTime(expense.createdAt)}</td>
                                                    <td>
                                                        <Badge variant="secondary">
                                                            {expense.category || 'Otros'}
                                                        </Badge>
                                                    </td>
                                                    <td>{expense.notes || '-'}</td>
                                                    <td>{expense.paymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'}</td>
                                                    <td className="text-right text-danger font-semibold">
                                                        -{formatCurrency(expense.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <Card>
                            <CardHeader title="Historial de cajas" />
                            <CardBody noPadding>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Apertura</th>
                                            <th>Cierre</th>
                                            <th>Ventas</th>
                                            <th className="text-right">Diferencia</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockCashRegisters.map(cr => (
                                            <tr key={cr.id}>
                                                <td>{formatDateTime(cr.openedAt)}</td>
                                                <td>{formatCurrency(cr.openingAmount)}</td>
                                                <td>{cr.closingAmount !== undefined ? formatCurrency(cr.closingAmount) : '-'}</td>
                                                <td>{cr.salesCount} ventas</td>
                                                <td className="text-right">
                                                    {cr.difference !== undefined ? (
                                                        <span className={cr.difference < 0 ? 'text-danger' : cr.difference > 0 ? 'text-success' : ''}>
                                                            {cr.difference >= 0 ? '+' : ''}{formatCurrency(cr.difference)}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {cr.isClosed ? (
                                                        <Badge variant={cr.difference === 0 ? 'success' : 'warning'}>
                                                            Cerrada
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="primary" withDot pulse>
                                                            Abierta
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Open Cash Register Modal */}
            {showOpenModal && (
                <div className="modal-backdrop" onClick={() => setShowOpenModal(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Abrir Caja</h2>
                        </div>
                        <div className="modal-body">
                            <Input
                                label="Monto inicial"
                                type="number"
                                value={openAmount}
                                onChange={e => setOpenAmount(e.target.value)}
                                placeholder="0"
                                required
                                autoFocus
                            />
                            <Input
                                label="Nota (opcional)"
                                value={openNote}
                                onChange={e => setOpenNote(e.target.value)}
                                placeholder="Ej: Inicio de jornada"
                                isOptional
                            />
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowOpenModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="success" onClick={handleOpen}>
                                Abrir Caja
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Registrar Gasto</h2>
                        </div>
                        <div className="modal-body">
                            <Input
                                label="Monto"
                                type="number"
                                value={expenseAmount}
                                onChange={e => setExpenseAmount(e.target.value)}
                                placeholder="0"
                                required
                                autoFocus
                            />
                            <Select
                                label="Categoría"
                                value={expenseCategory}
                                onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                                options={[
                                    { value: 'FREIGHT', label: 'Flete' },
                                    { value: 'SUPPLIES', label: 'Insumos' },
                                    { value: 'SERVICES', label: 'Servicios' },
                                    { value: 'OTHER', label: 'Otros' },
                                ]}
                                placeholder="Seleccionar..."
                            />
                            <Input
                                label="Nota"
                                value={expenseNote}
                                onChange={e => setExpenseNote(e.target.value)}
                                placeholder="Describí el gasto..."
                            />
                            <div className="form-group">
                                <label className="form-label">Medio de pago</label>
                                <div className="cash-expense-methods">
                                    <button
                                        type="button"
                                        className={`cash-expense-method ${expenseMethod === 'CASH' ? 'active' : ''}`}
                                        onClick={() => setExpenseMethod('CASH')}
                                    >
                                        Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        className={`cash-expense-method ${expenseMethod === 'TRANSFER' ? 'active' : ''}`}
                                        onClick={() => setExpenseMethod('TRANSFER')}
                                    >
                                        Transferencia
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleAddExpense}>
                                Registrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Cash Register Modal */}
            {showCloseModal && openCashRegister && (
                <div className="modal-backdrop" onClick={() => setShowCloseModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Cerrar Caja</h2>
                        </div>
                        <div className="modal-body">
                            {/* Summary */}
                            <div className="cash-close-summary">
                                <h4>Resumen del día</h4>
                                <div className="cash-close-summary-grid">
                                    <div className="cash-close-summary-item">
                                        <span>Monto inicial</span>
                                        <span>{formatCurrency(openCashRegister.openingAmount)}</span>
                                    </div>
                                    <div className="cash-close-summary-item success">
                                        <span>Ventas efectivo</span>
                                        <span>+{formatCurrency(openCashRegister.totalCash)}</span>
                                    </div>
                                    <div className="cash-close-summary-item danger">
                                        <span>Gastos efectivo</span>
                                        <span>-{formatCurrency(openCashRegister.totalExpensesCash)}</span>
                                    </div>
                                    <div className="cash-close-summary-item total">
                                        <span>Efectivo esperado</span>
                                        <span>{formatCurrency(expectedCash)}</span>
                                    </div>
                                </div>
                            </div>

                            <Input
                                label="Efectivo contado"
                                type="number"
                                value={closeAmount}
                                onChange={e => setCloseAmount(e.target.value)}
                                placeholder="Ingresá el efectivo en caja"
                                required
                                autoFocus
                            />

                            {closeAmount && (
                                <div className={`cash-difference ${parseFloat(closeAmount) - expectedCash === 0 ? 'balanced' :
                                        parseFloat(closeAmount) - expectedCash > 0 ? 'surplus' : 'deficit'
                                    }`}>
                                    <AlertTriangle size={18} />
                                    <span>
                                        Diferencia: {formatCurrency(parseFloat(closeAmount) - expectedCash)}
                                    </span>
                                </div>
                            )}

                            <Input
                                label="Nota (opcional)"
                                value={closeNote}
                                onChange={e => setCloseNote(e.target.value)}
                                placeholder="Observaciones del cierre..."
                                isOptional
                            />
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleClose}>
                                Cerrar Caja
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
