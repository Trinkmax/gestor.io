// ================================
// PRODUCT DETAIL DRAWER
// Vista detallada de producto con historial y edición
// ================================

import { X, Edit2, Package, TrendingUp, AlertTriangle, Copy } from 'lucide-react';
import { Button, Badge } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useUI } from '../../../contexts/UIContext';
import { formatCurrency } from '../../../mocks/generators';
import type { Product, Category } from '../../../types';
import { CategoryBadge } from './CategoryBadge';
import { StockIndicator } from './StockIndicator';
import { MarginDisplay } from './MarginDisplay';

interface ProductDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    category?: Category;
    onEdit: (product: Product) => void;
    onAdjustStock?: (product: Product) => void;
    onToggleActive?: (product: Product) => void;
}

export function ProductDetailDrawer({
    isOpen,
    onClose,
    product,
    category,
    onEdit,
    onAdjustStock,
    onToggleActive,
}: ProductDetailDrawerProps) {
    const { hasPermission } = useAuth();
    const { showToast } = useUI();

    const canViewCost = hasPermission('VIEW_PRODUCT_COST');
    const canEdit = hasPermission('EDIT_PRODUCT');

    if (!isOpen || !product) return null;

    const handleCopyCode = () => {
        if (product.code) {
            navigator.clipboard.writeText(product.code);
            showToast('success', 'Código copiado');
        }
    };

    const isLowStock = product.minStock !== undefined && product.stock <= product.minStock;

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer drawer-right drawer-large" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div>
                        <h2 className="drawer-title">{product.name}</h2>
                        <div className="drawer-subtitle-flex">
                            <span className="product-code">{product.code || 'Sin código'}</span>
                            {product.code && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    isIcon
                                    onClick={handleCopyCode}
                                    title="Copiar código"
                                >
                                    <Copy size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="drawer-header-actions">
                        {product.isActive ? (
                            <Badge variant="success">Activo</Badge>
                        ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                        )}
                        <Button variant="ghost" size="sm" isIcon onClick={onClose}>
                            <X size={20} />
                        </Button>
                    </div>
                </div>

                <div className="drawer-body">
                    {/* Alertas */}
                    {isLowStock && (
                        <div className="product-detail-alert product-detail-alert-warning">
                            <AlertTriangle size={18} />
                            <div>
                                <strong>Stock bajo</strong>
                                <p>El stock actual ({product.stock}) está por debajo del mínimo ({product.minStock})</p>
                            </div>
                        </div>
                    )}

                    {/* Información general */}
                    <section className="product-detail-section">
                        <h3 className="product-detail-section-title">
                            <Package size={18} />
                            Información general
                        </h3>
                        <div className="product-detail-grid">
                            <div className="product-detail-field">
                                <label>Categoría</label>
                                <div>
                                    {category ? (
                                        <CategoryBadge
                                            categoryName={category.name}
                                            categoryColor={category.color}
                                            size="md"
                                        />
                                    ) : (
                                        <CategoryBadge />
                                    )}
                                </div>
                            </div>
                            <div className="product-detail-field">
                                <label>Código</label>
                                <div className="product-code">{product.code || '-'}</div>
                            </div>
                            <div className="product-detail-field">
                                <label>Creado</label>
                                <div>{new Date(product.createdAt).toLocaleDateString('es-AR')}</div>
                            </div>
                            <div className="product-detail-field">
                                <label>Actualizado</label>
                                <div>{new Date(product.updatedAt).toLocaleDateString('es-AR')}</div>
                            </div>
                        </div>
                    </section>

                    {/* Precios y margen */}
                    <section className="product-detail-section">
                        <h3 className="product-detail-section-title">
                            <TrendingUp size={18} />
                            Precios y margen
                        </h3>
                        <div className="product-detail-grid">
                            <div className="product-detail-field">
                                <label>Precio de venta</label>
                                <div className="product-detail-value-primary">
                                    {formatCurrency(product.price)}
                                </div>
                            </div>
                            {canViewCost && (
                                <>
                                    <div className="product-detail-field">
                                        <label>Costo</label>
                                        <div>
                                            {product.cost ? formatCurrency(product.cost) : '-'}
                                        </div>
                                    </div>
                                    <div className="product-detail-field product-detail-field-full">
                                        <label>Margen</label>
                                        <div>
                                            <MarginDisplay
                                                price={product.price}
                                                cost={product.cost}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Stock */}
                    <section className="product-detail-section">
                        <h3 className="product-detail-section-title">
                            <Package size={18} />
                            Stock
                        </h3>
                        <div className="product-detail-stock">
                            <StockIndicator
                                current={product.stock}
                                min={product.minStock}
                                showBar
                            />
                        </div>
                        <div className="product-detail-grid" style={{ marginTop: 'var(--space-4)' }}>
                            <div className="product-detail-field">
                                <label>Stock actual</label>
                                <div className="product-detail-value-primary">{product.stock}</div>
                            </div>
                            <div className="product-detail-field">
                                <label>Stock mínimo</label>
                                <div>{product.minStock !== undefined ? product.minStock : '-'}</div>
                            </div>
                        </div>

                        {/* Placeholder para historial de movimientos */}
                        <div className="product-detail-placeholder">
                            <p className="text-tertiary text-sm">
                                Historial de movimientos de stock (próximamente)
                            </p>
                        </div>
                    </section>

                    {/* Placeholder para estadísticas de ventas */}
                    <section className="product-detail-section">
                        <h3 className="product-detail-section-title">
                            <TrendingUp size={18} />
                            Estadísticas de ventas
                        </h3>
                        <div className="product-detail-placeholder">
                            <p className="text-tertiary text-sm">
                                Resumen de ventas del producto (próximamente)
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer con acciones */}
                {canEdit && (
                    <div className="drawer-footer">
                        {onAdjustStock && (
                            <Button variant="secondary" onClick={() => onAdjustStock(product)}>
                                Ajustar stock
                            </Button>
                        )}
                        {onToggleActive && (
                            <Button
                                variant="secondary"
                                onClick={() => onToggleActive(product)}
                            >
                                {product.isActive ? 'Desactivar' : 'Activar'}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            leftIcon={<Edit2 size={16} />}
                            onClick={() => onEdit(product)}
                        >
                            Editar producto
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
