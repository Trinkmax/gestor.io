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
type CloseStep = 1 | 2 | 3; // 1: Count, 2: Review, 3: Confirm

export function CashRegisterPage() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { showToast } = useUI();

    const [activeTab, setActiveTab] = useState<Tab>('status');
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    
    // NEW: Stepper state for guided close
    const [closeStep, setCloseStep] = useState<CloseStep>(1);

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

    // Calculate difference
    const closeDifference = closeAmount ? parseFloat(closeAmount) - expectedCash : 0;
    const differenceCss = closeDifference === 0 ? 'balanced' : closeDifference > 0 ? 'surplus' : 'deficit';

    // Handle close cash register stepper navigation
    const handleCloseNext = () => {
        if (closeStep === 1) {
            const counted = parseFloat(closeAmount);
            if (isNaN(counted) || counted < 0) {
                showToast('warning', 'Ingresá el efectivo contado');
                return;
            }
            setCloseStep(2);
        } else if (closeStep === 2) {
            setCloseStep(3);
        }
    };

    const handleCloseBack = () => {
        if (closeStep > 1) {
            setCloseStep((closeStep - 1) as CloseStep);
        }
    };

    const handleCloseFinal = () => {
        showToast('success', 'Caja cerrada correctamente');
        setShowCloseModal(false);
        setCloseAmount('');
        setCloseNote('');
        setCloseStep(1);
    };

    const handleCloseCancel = () => {
        setShowCloseModal(false);
        setCloseStep(1);
        setCloseAmount('');
        setCloseNote('');
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

            {/* Close Cash Register Modal - Stepper */}
            {showCloseModal && openCashRegister && (
                <div className="modal-backdrop" onClick={handleCloseCancel}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Cerrar Caja</h2>
                            {/* Stepper indicator */}
                            <div className="close-stepper">
                                <div className={`stepper-item ${closeStep >= 1 ? 'active' : ''} ${closeStep > 1 ? 'completed' : ''}`}>
                                    <span className="stepper-number">1</span>
                                    <span className="stepper-label">Contar</span>
                                </div>
                                <div className="stepper-connector" />
                                <div className={`stepper-item ${closeStep >= 2 ? 'active' : ''} ${closeStep > 2 ? 'completed' : ''}`}>
                                    <span className="stepper-number">2</span>
                                    <span className="stepper-label">Revisar</span>
                                </div>
                                <div className="stepper-connector" />
                                <div className={`stepper-item ${closeStep >= 3 ? 'active' : ''}`}>
                                    <span className="stepper-number">3</span>
                                    <span className="stepper-label">Confirmar</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-body">
                            {/* Step 1: Count */}
                            {closeStep === 1 && (
                                <div className="close-step">
                                    <div className="close-step-header">
                                        <h3>Paso 1: Contá el efectivo</h3>
                                        <p>Contá todo el efectivo en caja y anotá el total</p>
                                    </div>
                                    
                                    <div className="close-expected">
                                        <span>Efectivo esperado:</span>
                                        <strong>{formatCurrency(expectedCash)}</strong>
                                    </div>
                                    
                                    <Input
                                        label="Efectivo contado"
                                        type="number"
                                        value={closeAmount}
                                        onChange={e => setCloseAmount(e.target.value)}
                                        placeholder="Ingresá el monto total"
                                        required
                                        autoFocus
                                    />
                                    
                                    {closeAmount && (
                                        <div className={`cash-difference ${differenceCss}`}>
                                            {closeDifference === 0 ? (
                                                <CheckCircle2 size={18} />
                                            ) : (
                                                <AlertTriangle size={18} />
                                            )}
                                            <span>
                                                {closeDifference === 0 
                                                    ? '¡La caja cuadra perfectamente!'
                                                    : `Diferencia: ${formatCurrency(closeDifference)}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Step 2: Review */}
                            {closeStep === 2 && (
                                <div className="close-step">
                                    <div className="close-step-header">
                                        <h3>Paso 2: Revisá el resumen</h3>
                                        <p>Verificá que los totales sean correctos</p>
                                    </div>
                                    
                                    <div className="cash-close-summary">
                                        <div className="cash-close-summary-grid">
                                            <div className="cash-close-summary-item">
                                                <span>Monto apertura</span>
                                                <span>{formatCurrency(openCashRegister.openingAmount)}</span>
                                            </div>
                                            <div className="cash-close-summary-item success">
                                                <span>+ Ventas efectivo</span>
                                                <span>+{formatCurrency(openCashRegister.totalCash)}</span>
                                            </div>
                                            <div className="cash-close-summary-item danger">
                                                <span>- Gastos efectivo</span>
                                                <span>-{formatCurrency(openCashRegister.totalExpensesCash)}</span>
                                            </div>
                                            <div className="cash-close-summary-divider" />
                                            <div className="cash-close-summary-item total">
                                                <span>= Efectivo esperado</span>
                                                <span>{formatCurrency(expectedCash)}</span>
                                            </div>
                                            <div className="cash-close-summary-item highlight">
                                                <span>Tu conteo</span>
                                                <span>{formatCurrency(parseFloat(closeAmount) || 0)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={`cash-difference-large ${differenceCss}`}>
                                            {closeDifference === 0 ? (
                                                <>
                                                    <CheckCircle2 size={24} />
                                                    <div>
                                                        <strong>¡Perfecto!</strong>
                                                        <p>La caja cuadra exactamente</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle size={24} />
                                                    <div>
                                                        <strong>Diferencia: {formatCurrency(closeDifference)}</strong>
                                                        <p>{closeDifference > 0 ? 'Hay más efectivo del esperado' : 'Falta efectivo'}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <Input
                                        label="Nota sobre el cierre (opcional)"
                                        value={closeNote}
                                        onChange={e => setCloseNote(e.target.value)}
                                        placeholder="Ej: Cliente me pagó después del horario"
                                        isOptional
                                    />
                                </div>
                            )}
                            
                            {/* Step 3: Confirm */}
                            {closeStep === 3 && (
                                <div className="close-step close-step-confirm">
                                    <div className="close-confirm-icon">
                                        {closeDifference === 0 ? (
                                            <CheckCircle2 size={64} />
                                        ) : (
                                            <AlertTriangle size={64} />
                                        )}
                                    </div>
                                    
                                    <h3>¿Confirmar cierre de caja?</h3>
                                    
                                    <div className="close-confirm-summary">
                                        <div className="close-confirm-row">
                                            <span>Total ventas del día:</span>
                                            <span>{formatCurrency(openCashRegister.totalCash + openCashRegister.totalTransfer + openCashRegister.totalCard + openCashRegister.totalCredit)}</span>
                                        </div>
                                        <div className="close-confirm-row">
                                            <span>Diferencia:</span>
                                            <span className={differenceCss}>{formatCurrency(closeDifference)}</span>
                                        </div>
                                        {closeNote && (
                                            <div className="close-confirm-note">
                                                <strong>Nota:</strong> {closeNote}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="close-confirm-warning">
                                        Esta acción no se puede deshacer. Asegurate que el conteo sea correcto.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {closeStep === 1 ? (
                                <>
                                    <Button variant="secondary" onClick={handleCloseCancel}>
                                        Cancelar
                                    </Button>
                                    <Button variant="primary" onClick={handleCloseNext} disabled={!closeAmount}>
                                        Siguiente
                                    </Button>
                                </>
                            ) : closeStep === 2 ? (
                                <>
                                    <Button variant="ghost" onClick={handleCloseBack}>
                                        Volver
                                    </Button>
                                    <Button variant="primary" onClick={handleCloseNext}>
                                        Revisar y Confirmar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={handleCloseBack}>
                                        Volver
                                    </Button>
                                    <Button variant="danger" onClick={handleCloseFinal}>
                                        Cerrar Caja Definitivamente
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
