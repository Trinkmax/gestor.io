// ================================
// PRODUCTS PAGE
// Sistema de Gestión Comercial
// ================================

import { useState, useMemo } from 'react';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    Edit2,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardBody, Button, Badge, Input, Modal, FilterPill } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency } from '../../mocks/generators';
import { mockProducts, getLowStockProducts } from '../../mocks/data/products';
import type { Product } from '../../types';
import './ProductsPage.css';

type Filter = 'all' | 'active' | 'inactive' | 'low-stock';

export function ProductsPage() {
    const { hasPermission } = useAuth();
    const { showToast, showConfirm } = useUI();

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
    });

    // Filter products
    const filteredProducts = useMemo(() => {
        let products = [...mockProducts];

        // Apply filter
        switch (filter) {
            case 'active':
                products = products.filter(p => p.isActive);
                break;
            case 'inactive':
                products = products.filter(p => !p.isActive);
                break;
            case 'low-stock':
                products = getLowStockProducts();
                break;
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.code?.toLowerCase().includes(query)
            );
        }

        return products;
    }, [filter, searchQuery]);

    // Counts for filters
    const counts = useMemo(() => ({
        all: mockProducts.length,
        active: mockProducts.filter(p => p.isActive).length,
        inactive: mockProducts.filter(p => !p.isActive).length,
        lowStock: getLowStockProducts().length,
    }), []);

    const canViewCost = hasPermission('VIEW_PRODUCT_COST');
    const canEdit = hasPermission('EDIT_PRODUCT');
    const canCreate = hasPermission('CREATE_PRODUCT');

    // Open create modal
    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            code: '',
            price: '',
            cost: '',
            stock: '',
            minStock: '',
        });
        setShowProductModal(true);
    };

    // Open edit modal
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            code: product.code || '',
            price: product.price.toString(),
            cost: product.cost?.toString() || '',
            stock: product.stock.toString(),
            minStock: product.minStock?.toString() || '',
        });
        setShowProductModal(true);
    };

    // Handle save
    const handleSave = () => {
        if (!formData.name.trim()) {
            showToast('warning', 'El nombre es obligatorio');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            showToast('warning', 'El precio debe ser mayor a 0');
            return;
        }

        if (editingProduct) {
            showToast('success', 'Producto actualizado');
        } else {
            showToast('success', 'Producto creado');
        }

        setShowProductModal(false);
    };

    // Toggle active status
    const toggleActive = (product: Product) => {
        showConfirm({
            title: `¿${product.isActive ? 'Desactivar' : 'Activar'} producto?`,
            message: `El producto "${product.name}" será ${product.isActive ? 'desactivado' : 'activado'}.`,
            confirmText: product.isActive ? 'Desactivar' : 'Activar',
            variant: product.isActive ? 'warning' : 'default',
            onConfirm: () => {
                showToast('success', `Producto ${product.isActive ? 'desactivado' : 'activado'}`);
            },
            onCancel: () => { },
        });
    };

    const isLowStock = (product: Product) =>
        product.isActive && product.minStock !== undefined && product.stock <= product.minStock;

    return (
        <div className="products-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Productos</h1>
                    </div>
                    <div className="page-header-actions">
                        <PermissionGate permission="CREATE_PRODUCT">
                            <Button
                                variant="primary"
                                leftIcon={<Plus size={18} />}
                                onClick={openCreateModal}
                            >
                                Nuevo producto
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
                                        placeholder="Buscar por nombre o código..."
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
                                        label="Activos"
                                        count={counts.active}
                                        isActive={filter === 'active'}
                                        onClick={() => setFilter('active')}
                                    />
                                    <FilterPill
                                        label="Inactivos"
                                        count={counts.inactive}
                                        isActive={filter === 'inactive'}
                                        onClick={() => setFilter('inactive')}
                                    />
                                    <FilterPill
                                        label="Stock bajo"
                                        count={counts.lowStock}
                                        isActive={filter === 'low-stock'}
                                        onClick={() => setFilter('low-stock')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <CardBody noPadding>
                            {filteredProducts.length === 0 ? (
                                <div className="table-empty">
                                    <Package size={48} className="table-empty-icon" />
                                    <h3 className="table-empty-title">No hay productos</h3>
                                    <p className="table-empty-message">
                                        {searchQuery ? 'No se encontraron productos con ese criterio.' : 'Agregá productos para empezar.'}
                                    </p>
                                    {canCreate && !searchQuery && (
                                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                                            Agregar producto
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Código</th>
                                            <th className="text-right">Precio</th>
                                            {canViewCost && <th className="text-right">Costo</th>}
                                            <th className="text-center">Stock</th>
                                            <th>Estado</th>
                                            {canEdit && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="product-name-cell">
                                                        <span className="product-name">{product.name}</span>
                                                        {isLowStock(product) && (
                                                            <AlertTriangle size={14} className="text-warning" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="product-code">{product.code || '-'}</span>
                                                </td>
                                                <td className="text-right font-semibold">
                                                    {formatCurrency(product.price)}
                                                </td>
                                                {canViewCost && (
                                                    <td className="text-right text-secondary">
                                                        {product.cost ? formatCurrency(product.cost) : '-'}
                                                    </td>
                                                )}
                                                <td className="text-center">
                                                    <span className={isLowStock(product) ? 'text-danger font-semibold' : ''}>
                                                        {product.stock}
                                                    </span>
                                                    {product.minStock !== undefined && (
                                                        <span className="text-tertiary text-xs"> / mín {product.minStock}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {product.isActive ? (
                                                        <Badge variant="success">Activo</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactivo</Badge>
                                                    )}
                                                </td>
                                                {canEdit && (
                                                    <td>
                                                        <div className="table-actions">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                isIcon
                                                                onClick={() => openEditModal(product)}
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                isIcon
                                                                onClick={() => toggleActive(product)}
                                                                title={product.isActive ? 'Desactivar' : 'Activar'}
                                                            >
                                                                {product.isActive ? (
                                                                    <ToggleRight size={16} className="text-success" />
                                                                ) : (
                                                                    <ToggleLeft size={16} />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Product Modal */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
                size="md"
            >
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="product-form-grid">
                        <Input
                            label="Nombre"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre del producto"
                            required
                            autoFocus
                        />

                        <Input
                            label="Código"
                            value={formData.code}
                            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="Código de barras"
                            isOptional
                        />

                        <Input
                            label="Precio de venta"
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0"
                            required
                        />

                        {canViewCost && (
                            <Input
                                label="Costo"
                                type="number"
                                value={formData.cost}
                                onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                                placeholder="0"
                                isOptional
                                helpText="Solo visible para roles autorizados"
                            />
                        )}

                        <Input
                            label="Stock actual"
                            type="number"
                            value={formData.stock}
                            onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                            placeholder="0"
                        />

                        <Input
                            label="Stock mínimo"
                            type="number"
                            value={formData.minStock}
                            onChange={e => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                            placeholder="0"
                            isOptional
                            helpText="Alerta cuando el stock baje de este valor"
                        />
                    </div>

                    <div className="modal-form-actions">
                        <Button variant="secondary" onClick={() => setShowProductModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
