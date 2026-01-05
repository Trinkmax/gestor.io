// ================================
// POS (POINT OF SALE) PAGE
// Sistema de Gestión Comercial
// ================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    User,
    CreditCard,
    Banknote,
    ArrowRight,
    AlertTriangle,
    X,
    UserPlus,
    Receipt,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Button, Badge, Modal } from '../../components/ui';
import { formatCurrency } from '../../mocks/generators';
import { mockProducts } from '../../mocks/data/products';
import { mockClients } from '../../mocks/data/clients';
import { getOpenCashRegister } from '../../mocks/data/sales';
import type { Product, Client, CartItem, PaymentMethod } from '../../types';
import './POSPage.css';

export function POSPage() {
    const navigate = useNavigate();
    const { hasPermission, businessConfig } = useAuth();
    const { showToast, showConfirm } = useUI();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastSaleNumber, setLastSaleNumber] = useState<number | null>(null);
    const [clientSearchQuery, setClientSearchQuery] = useState('');

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Check cash register
    const openCashRegister = getOpenCashRegister();
    const isCashRegisterOpen = openCashRegister !== null;
    const canSell = !businessConfig.requireCashRegisterForSales || isCashRegisterOpen;

    // Focus search on mount
    useEffect(() => {
        if (canSell && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [canSell]);

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return mockProducts
            .filter(p => p.isActive)
            .filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.code?.toLowerCase().includes(query)
            )
            .slice(0, 8);
    }, [searchQuery]);

    // Filter clients
    const filteredClients = useMemo(() => {
        if (!clientSearchQuery.trim()) return mockClients.slice(0, 5);

        const query = clientSearchQuery.toLowerCase();
        return mockClients.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.phone?.includes(query)
        ).slice(0, 5);
    }, [clientSearchQuery]);

    // Cart calculations
    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + item.subtotal, 0)
        , [cart]);

    const cartItemsCount = useMemo(() =>
        cart.reduce((sum, item) => sum + item.quantity, 0)
        , [cart]);

    // Add product to cart
    const addToCart = useCallback((product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);

            if (existing) {
                // Check stock
                const newQty = existing.quantity + 1;
                if (!businessConfig.allowNegativeStock && newQty > product.stock) {
                    showToast('warning', `Stock insuficiente. Disponible: ${product.stock}`);
                    return prev;
                }

                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice }
                        : item
                );
            }

            // New item
            if (!businessConfig.allowNegativeStock && product.stock < 1) {
                showToast('warning', 'Producto sin stock');
                return prev;
            }

            const newItem: CartItem = {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                quantity: 1,
                unitPrice: product.price,
                originalPrice: product.price,
                subtotal: product.price,
                availableStock: product.stock,
            };

            return [...prev, newItem];
        });

        setSearchQuery('');
        searchInputRef.current?.focus();
    }, [businessConfig.allowNegativeStock, showToast]);

    // Update quantity
    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart(prev => {
            const item = prev.find(i => i.productId === productId);
            if (!item) return prev;

            const newQty = item.quantity + delta;

            if (newQty < 1) {
                return prev.filter(i => i.productId !== productId);
            }

            // Check stock
            if (!businessConfig.allowNegativeStock && newQty > item.availableStock) {
                showToast('warning', `Stock máximo: ${item.availableStock}`);
                return prev;
            }

            return prev.map(i =>
                i.productId === productId
                    ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
                    : i
            );
        });
    }, [businessConfig.allowNegativeStock, showToast]);

    // Update price (if allowed)
    const updatePrice = useCallback((productId: string, newPrice: number) => {
        if (newPrice < 0) return;

        setCart(prev => prev.map(i =>
            i.productId === productId
                ? { ...i, unitPrice: newPrice, subtotal: i.quantity * newPrice }
                : i
        ));
    }, []);

    // Remove from cart
    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(i => i.productId !== productId));
    }, []);

    // Clear cart
    const clearCart = useCallback(() => {
        showConfirm({
            title: '¿Vaciar carrito?',
            message: 'Se eliminarán todos los productos del carrito.',
            confirmText: 'Vaciar',
            cancelText: 'Cancelar',
            variant: 'warning',
            onConfirm: () => {
                setCart([]);
                setSelectedClient(null);
                setPaymentMethod(null);
                searchInputRef.current?.focus();
            },
            onCancel: () => { },
        });
    }, [showConfirm]);

    // Select client
    const selectClient = useCallback((client: Client) => {
        setSelectedClient(client);
        setShowClientSearch(false);
        setClientSearchQuery('');

        // If FIADO selected but no client yet set, confirm FIADO
        if (paymentMethod === 'CREDIT' && !selectedClient) {
            showToast('success', `Cliente ${client.name} seleccionado para fiado`);
        }
    }, [paymentMethod, selectedClient, showToast]);

    // Select payment method
    const selectPaymentMethod = useCallback((method: PaymentMethod) => {
        if (method === 'CREDIT' && !selectedClient) {
            setShowClientSearch(true);
            showToast('info', 'Seleccioná un cliente para fiado');
        }
        setPaymentMethod(method);
    }, [selectedClient, showToast]);

    // Confirm sale
    const confirmSale = useCallback(() => {
        if (cart.length === 0) {
            showToast('warning', 'El carrito está vacío');
            return;
        }

        if (!paymentMethod) {
            showToast('warning', 'Seleccioná un medio de pago');
            return;
        }

        if (paymentMethod === 'CREDIT' && !selectedClient) {
            showToast('warning', 'El fiado requiere un cliente');
            setShowClientSearch(true);
            return;
        }

        // Simulate sale creation
        const saleNumber = Math.floor(Math.random() * 9000) + 1000;
        setLastSaleNumber(saleNumber);

        // Show success
        setShowSuccessModal(true);
        showToast('success', 'Venta registrada correctamente');

        // Reset cart
        setCart([]);
        setSelectedClient(null);
        setPaymentMethod(null);
    }, [cart, paymentMethod, selectedClient, showToast]);

    // New sale after success
    const startNewSale = useCallback(() => {
        setShowSuccessModal(false);
        setLastSaleNumber(null);
        searchInputRef.current?.focus();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus search: Ctrl/Cmd + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Confirm sale: Ctrl/Cmd + Enter
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                confirmSale();
            }

            // Escape: Close modals or clear search
            if (e.key === 'Escape') {
                if (showClientSearch) {
                    setShowClientSearch(false);
                } else if (searchQuery) {
                    setSearchQuery('');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, showClientSearch, confirmSale]);

    // Can't sell without cash register
    if (!canSell) {
        return (
            <div className="pos-blocked">
                <AlertTriangle size={64} />
                <h2>Caja cerrada</h2>
                <p>Debés abrir la caja para poder vender.</p>
                <Button variant="primary" onClick={() => navigate('/caja')}>
                    Ir a Caja
                </Button>
            </div>
        );
    }

    const canEditPrices = hasPermission('EDIT_SALE_PRICES');

    return (
        <div className="pos">
            {/* Product Search Side */}
            <div className="pos-products">
                <div className="pos-search">
                    <Search size={20} className="pos-search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="pos-search-input"
                        placeholder="Buscar producto (nombre o código)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button
                            className="pos-search-clear"
                            onClick={() => setSearchQuery('')}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {filteredProducts.length > 0 && (
                    <div className="pos-results">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                className="pos-product-item"
                                onClick={() => addToCart(product)}
                            >
                                <div className="pos-product-info">
                                    <span className="pos-product-name">{product.name}</span>
                                    {product.code && (
                                        <span className="pos-product-code">{product.code}</span>
                                    )}
                                </div>
                                <div className="pos-product-meta">
                                    <span className="pos-product-price">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className={`pos-product-stock ${product.stock <= (product.minStock || 0) ? 'low' : ''}`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                                <Plus size={20} className="pos-product-add" />
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery && filteredProducts.length === 0 && (
                    <div className="pos-no-results">
                        <p>No se encontraron productos</p>
                    </div>
                )}

                {/* Keyboard hints */}
                <div className="pos-hints">
                    <span><kbd>⌘K</kbd> Buscar</span>
                    <span><kbd>⌘↵</kbd> Confirmar venta</span>
                    <span><kbd>Esc</kbd> Limpiar</span>
                </div>
            </div>

            {/* Cart Side */}
            <div className="pos-cart">
                <div className="pos-cart-header">
                    <div className="pos-cart-title">
                        <ShoppingCart size={20} />
                        <span>Carrito</span>
                        {cartItemsCount > 0 && (
                            <Badge variant="primary">{cartItemsCount}</Badge>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart}>
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="pos-cart-items">
                    {cart.length === 0 ? (
                        <div className="pos-cart-empty">
                            <ShoppingCart size={48} />
                            <p>Agregá productos para empezar</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="pos-cart-item">
                                <div className="pos-cart-item-info">
                                    <span className="pos-cart-item-name">{item.productName}</span>
                                    {item.unitPrice !== item.originalPrice && (
                                        <span className="pos-cart-item-modified">
                                            Precio modificado
                                        </span>
                                    )}
                                </div>

                                <div className="pos-cart-item-controls">
                                    {/* Quantity */}
                                    <div className="pos-cart-qty">
                                        <button onClick={() => updateQuantity(item.productId, -1)}>
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="pos-cart-price">
                                        {canEditPrices ? (
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={e => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                                                className="pos-cart-price-input"
                                            />
                                        ) : (
                                            <span>{formatCurrency(item.unitPrice)}</span>
                                        )}
                                    </div>

                                    {/* Subtotal */}
                                    <span className="pos-cart-subtotal">
                                        {formatCurrency(item.subtotal)}
                                    </span>

                                    {/* Remove */}
                                    <button
                                        className="pos-cart-remove"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Client Selection */}
                <div className="pos-client-section">
                    {selectedClient ? (
                        <div className="pos-client-selected">
                            <User size={16} />
                            <span>{selectedClient.name}</span>
                            {selectedClient.balance > 0 && (
                                <Badge variant="warning" size="sm">
                                    Debe {formatCurrency(selectedClient.balance)}
                                </Badge>
                            )}
                            <button onClick={() => setSelectedClient(null)}>
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<User size={16} />}
                            onClick={() => setShowClientSearch(true)}
                        >
                            Agregar cliente (opcional)
                        </Button>
                    )}
                </div>

                {/* Payment Methods */}
                <div className="pos-payment-methods">
                    <span className="pos-payment-label">Medio de pago:</span>
                    <div className="pos-payment-options">
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CASH')}
                        >
                            <Banknote size={18} />
                            <span>Efectivo</span>
                        </button>
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'TRANSFER' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('TRANSFER')}
                        >
                            <ArrowRight size={18} />
                            <span>Transferencia</span>
                        </button>
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CARD')}
                        >
                            <CreditCard size={18} />
                            <span>Tarjeta</span>
                        </button>
                        <button
                            className={`pos-payment-btn fiado ${paymentMethod === 'CREDIT' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CREDIT')}
                        >
                            <User size={18} />
                            <span>Fiado</span>
                        </button>
                    </div>
                </div>

                {/* Total & Confirm */}
                <div className="pos-cart-footer">
                    <div className="pos-cart-total">
                        <span>Total</span>
                        <span className="pos-cart-total-value">{formatCurrency(cartTotal)}</span>
                    </div>

                    <Button
                        variant="success"
                        size="xl"
                        fullWidth
                        disabled={cart.length === 0 || !paymentMethod}
                        onClick={confirmSale}
                        leftIcon={<Receipt size={20} />}
                    >
                        Confirmar Venta
                    </Button>
                </div>
            </div>

            {/* Client Search Drawer */}
            {showClientSearch && (
                <div className="pos-drawer-backdrop" onClick={() => setShowClientSearch(false)}>
                    <div className="pos-drawer" onClick={e => e.stopPropagation()}>
                        <div className="pos-drawer-header">
                            <h3>Seleccionar cliente</h3>
                            <button onClick={() => setShowClientSearch(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pos-drawer-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                value={clientSearchQuery}
                                onChange={e => setClientSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="pos-drawer-list">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    className="pos-client-item"
                                    onClick={() => selectClient(client)}
                                >
                                    <div className="pos-client-info">
                                        <span className="pos-client-name">{client.name}</span>
                                        {client.phone && (
                                            <span className="pos-client-phone">{client.phone}</span>
                                        )}
                                    </div>
                                    {client.balance > 0 && (
                                        <Badge variant="warning">
                                            Debe {formatCurrency(client.balance)}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pos-drawer-footer">
                            <Button
                                variant="secondary"
                                leftIcon={<UserPlus size={18} />}
                                onClick={() => {
                                    setShowClientSearch(false);
                                    setShowQuickClientModal(true);
                                }}
                                fullWidth
                            >
                                Crear cliente nuevo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Client Modal */}
            <Modal
                isOpen={showQuickClientModal}
                onClose={() => setShowQuickClientModal(false)}
                title="Nuevo cliente"
                size="sm"
            >
                <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

                    if (!name.trim()) {
                        showToast('warning', 'Ingresá el nombre del cliente');
                        return;
                    }

                    // Mock create client
                    const newClient: Client = {
                        id: `client-new-${Date.now()}`,
                        name: name.trim(),
                        phone: phone || undefined,
                        balance: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    mockClients.push(newClient);
                    setSelectedClient(newClient);
                    setShowQuickClientModal(false);
                    showToast('success', `Cliente ${name} creado`);
                }}>
                    <div className="form-group">
                        <label className="form-label">Nombre *</label>
                        <input
                            type="text"
                            name="name"
                            className="input"
                            placeholder="Nombre completo"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            className="input"
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                        <Button variant="secondary" onClick={() => setShowQuickClientModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Crear cliente
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={startNewSale}
                title="¡Venta registrada!"
                size="sm"
            >
                <div className="pos-success-content">
                    <div className="pos-success-icon">
                        <Receipt size={48} />
                    </div>
                    <p className="pos-success-message">
                        Venta #{lastSaleNumber} por <strong>{formatCurrency(cartTotal)}</strong>
                    </p>
                    <Button variant="primary" onClick={startNewSale} fullWidth>
                        Nueva Venta
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
