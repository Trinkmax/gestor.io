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
    Clock,
    TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Button, Badge, Modal, Tooltip } from '../../components/ui';
import { formatCurrency } from '../../mocks/generators';
import { mockProducts } from '../../mocks/data/products';
import { mockClients } from '../../mocks/data/clients';
import { getOpenCashRegister } from '../../mocks/data/sales';
import type { Product, Client, CartItem, PaymentMethod } from '../../types';
import './POSPage.css';

// Payment method shortcuts
const PAYMENT_SHORTCUTS: Record<string, PaymentMethod> = {
    '1': 'CASH',
    '2': 'TRANSFER',
    '3': 'CARD',
    '4': 'CREDIT',
};

// Local storage keys
const LAST_PAYMENT_METHOD_KEY = 'gestor_last_payment_method';
const RECENT_PRODUCTS_KEY = 'gestor_recent_products';

export function POSPage() {
    const navigate = useNavigate();
    const { hasPermission, businessConfig } = useAuth();
    const { showToast, showConfirm } = useUI();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(() => {
        // Restore last used payment method
        const saved = localStorage.getItem(LAST_PAYMENT_METHOD_KEY);
        return saved as PaymentMethod | null;
    });
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastSaleNumber, setLastSaleNumber] = useState<number | null>(null);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    
    // NEW: Keyboard navigation state
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
    const [recentProductIds, setRecentProductIds] = useState<string[]>(() => {
        const saved = localStorage.getItem(RECENT_PRODUCTS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

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

    // Recent products (for empty state)
    const recentProducts = useMemo(() => {
        return recentProductIds
            .map(id => mockProducts.find(p => p.id === id))
            .filter((p): p is Product => p !== undefined && p.isActive)
            .slice(0, 4);
    }, [recentProductIds]);

    // Most sold products (mock - would come from API)
    const popularProducts = useMemo(() => {
        return mockProducts
            .filter(p => p.isActive)
            .slice(0, 4);
    }, []);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedResultIndex(-1);
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

        // Save to recent products
        setRecentProductIds(prev => {
            const updated = [product.id, ...prev.filter(id => id !== product.id)].slice(0, 10);
            localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
            return updated;
        });

        setSearchQuery('');
        setSelectedResultIndex(-1);
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
        // Save to localStorage
        localStorage.setItem(LAST_PAYMENT_METHOD_KEY, method);
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

    // Handle search input key navigation
    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const results = filteredProducts;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedResultIndex(prev => 
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
                    addToCart(results[selectedResultIndex]);
                } else if (results.length === 1) {
                    // Auto-add if only one result
                    addToCart(results[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (searchQuery) {
                    setSearchQuery('');
                    setSelectedResultIndex(-1);
                }
                break;
        }
    }, [filteredProducts, selectedResultIndex, addToCart, searchQuery]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input (except for shortcuts with modifiers)
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
                (e.target as HTMLElement).tagName
            );
            
            // Focus search: Ctrl/Cmd + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            // Confirm sale: Ctrl/Cmd + Enter
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                confirmSale();
                return;
            }

            // Escape: Close modals or clear search
            if (e.key === 'Escape') {
                if (showClientSearch) {
                    setShowClientSearch(false);
                } else if (showQuickClientModal) {
                    setShowQuickClientModal(false);
                }
                return;
            }

            // Payment shortcuts (only when not typing in input)
            if (!isTyping && PAYMENT_SHORTCUTS[e.key]) {
                e.preventDefault();
                selectPaymentMethod(PAYMENT_SHORTCUTS[e.key]);
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, showClientSearch, showQuickClientModal, confirmSale, selectPaymentMethod]);

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
    const showSuggestions = !searchQuery.trim() && (recentProducts.length > 0 || popularProducts.length > 0);

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
                        onKeyDown={handleSearchKeyDown}
                        autoComplete="off"
                        aria-label="Buscar producto"
                        aria-describedby="search-hint"
                    />
                    {searchQuery && (
                        <button
                            className="pos-search-clear"
                            onClick={() => {
                                setSearchQuery('');
                                searchInputRef.current?.focus();
                            }}
                            aria-label="Limpiar búsqueda"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {filteredProducts.length > 0 && (
                    <div className="pos-results" role="listbox" aria-label="Resultados de búsqueda">
                        {filteredProducts.map((product, index) => (
                            <button
                                key={product.id}
                                className={`pos-product-item ${index === selectedResultIndex ? 'selected' : ''}`}
                                onClick={() => addToCart(product)}
                                role="option"
                                aria-selected={index === selectedResultIndex}
                                tabIndex={-1}
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

                {/* No results */}
                {searchQuery && filteredProducts.length === 0 && (
                    <div className="pos-no-results">
                        <p>No se encontraron productos</p>
                    </div>
                )}

                {/* Suggestions when no search */}
                {showSuggestions && (
                    <div className="pos-suggestions">
                        {/* Recent Products */}
                        {recentProducts.length > 0 && (
                            <div className="pos-suggestion-section">
                                <h3 className="pos-suggestion-title">
                                    <Clock size={16} />
                                    Recientes
                                </h3>
                                <div className="pos-suggestion-grid">
                                    {recentProducts.map(product => (
                                        <button
                                            key={product.id}
                                            className="pos-suggestion-item"
                                            onClick={() => addToCart(product)}
                                        >
                                            <span className="pos-suggestion-name">{product.name}</span>
                                            <span className="pos-suggestion-price">{formatCurrency(product.price)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Products */}
                        <div className="pos-suggestion-section">
                            <h3 className="pos-suggestion-title">
                                <TrendingUp size={16} />
                                Más vendidos
                            </h3>
                            <div className="pos-suggestion-grid">
                                {popularProducts.map(product => (
                                    <button
                                        key={product.id}
                                        className="pos-suggestion-item"
                                        onClick={() => addToCart(product)}
                                    >
                                        <span className="pos-suggestion-name">{product.name}</span>
                                        <span className="pos-suggestion-price">{formatCurrency(product.price)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state with instructions */}
                {!searchQuery && !showSuggestions && (
                    <div className="pos-empty-state">
                        <ShoppingCart size={48} />
                        <p>Escaneá un código o buscá por nombre</p>
                    </div>
                )}

                {/* Keyboard hints */}
                <div className="pos-hints" id="search-hint">
                    <span><kbd>⌘K</kbd> Buscar</span>
                    <span><kbd>↑↓</kbd> Navegar</span>
                    <span><kbd>Enter</kbd> Agregar</span>
                    <span><kbd>1-4</kbd> Medio pago</span>
                    <span><kbd>⌘↵</kbd> Confirmar</span>
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
                        <Tooltip content="Vaciar carrito">
                            <Button variant="ghost" size="sm" onClick={clearCart} aria-label="Vaciar carrito">
                                <Trash2 size={16} />
                            </Button>
                        </Tooltip>
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
                                        <button 
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            aria-label="Reducir cantidad"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            aria-label="Aumentar cantidad"
                                        >
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
                                                aria-label="Precio unitario"
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
                                        aria-label="Eliminar producto"
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
                            <button onClick={() => setSelectedClient(null)} aria-label="Quitar cliente">
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
                    <span className="pos-payment-label">
                        Medio de pago:
                        <span className="pos-payment-hint">(teclas 1-4)</span>
                    </span>
                    <div className="pos-payment-options" role="radiogroup" aria-label="Seleccionar medio de pago">
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CASH')}
                            role="radio"
                            aria-checked={paymentMethod === 'CASH'}
                        >
                            <Banknote size={18} />
                            <span>Efectivo</span>
                            <kbd>1</kbd>
                        </button>
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'TRANSFER' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('TRANSFER')}
                            role="radio"
                            aria-checked={paymentMethod === 'TRANSFER'}
                        >
                            <ArrowRight size={18} />
                            <span>Transfer</span>
                            <kbd>2</kbd>
                        </button>
                        <button
                            className={`pos-payment-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CARD')}
                            role="radio"
                            aria-checked={paymentMethod === 'CARD'}
                        >
                            <CreditCard size={18} />
                            <span>Tarjeta</span>
                            <kbd>3</kbd>
                        </button>
                        <button
                            className={`pos-payment-btn fiado ${paymentMethod === 'CREDIT' ? 'active' : ''}`}
                            onClick={() => selectPaymentMethod('CREDIT')}
                            role="radio"
                            aria-checked={paymentMethod === 'CREDIT'}
                        >
                            <User size={18} />
                            <span>Fiado</span>
                            <kbd>4</kbd>
                        </button>
                    </div>
                    {paymentMethod === 'CREDIT' && !selectedClient && (
                        <div className="pos-payment-warning">
                            <AlertTriangle size={14} />
                            Seleccioná un cliente para fiado
                        </div>
                    )}
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
                        disabled={cart.length === 0 || !paymentMethod || (paymentMethod === 'CREDIT' && !selectedClient)}
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
                            <button onClick={() => setShowClientSearch(false)} aria-label="Cerrar">
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
