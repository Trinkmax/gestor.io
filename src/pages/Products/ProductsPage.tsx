// ================================
// PRODUCTS PAGE - CONSOLA DE GESTIÓN MODERNA
// Sistema de Gestión Comercial
// ================================

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Package,
    Plus,
    Search,
    Download,
    Upload,
    Tag,
    MoreVertical,
    Eye,
    X,
    Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardBody, Button, Badge, Input, Modal, FilterPill } from '../../components/ui';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { formatCurrency } from '../../mocks/generators';
import { mockProducts, mockCategories, getLowStockProducts } from '../../mocks/data/products';
import type { Product, Category } from '../../types';
import {
    CategoryBadge,
    StockIndicator,
    MarginDisplay,
    CategoryManagerDrawer,
    CategorySelect,
    ProductDetailDrawer,
    BulkActionBar,
    AdvancedFilters,
    QuickEditPopover,
    ImportWizard,
} from './components';
import type { AdvancedFiltersState } from './components/AdvancedFilters';
import './ProductsPage.css';

type QuickFilter = 'all' | 'active' | 'inactive' | 'low-stock' | 'no-stock' | 'low-margin' | 'uncategorized';
type ViewDensity = 'normal' | 'compact';

export function ProductsPage() {
    const { hasPermission } = useAuth();
    const { showToast, showConfirm } = useUI();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
    const [viewDensity, setViewDensity] = useState<ViewDensity>('normal');
    const [showCosts, setShowCosts] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Modals & Drawers
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [detailProduct, setDetailProduct] = useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    // Quick edit popover
    const [quickEditAnchor, setQuickEditAnchor] = useState<HTMLElement | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);

    // Advanced filters
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
        categoryIds: [],
        includeUncategorized: false,
        priceMin: undefined,
        priceMax: undefined,
        stockMin: undefined,
        stockMax: undefined,
        sortBy: 'name',
        sortOrder: 'asc',
    });

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        categoryId: undefined as string | undefined,
    });

    // Mock state
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [products, setProducts] = useState<Product[]>(mockProducts);

    const canViewCost = hasPermission('VIEW_PRODUCT_COST');
    const canEdit = hasPermission('EDIT_PRODUCT');
    const canCreate = hasPermission('CREATE_PRODUCT');

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Quick filters
        switch (quickFilter) {
            case 'active':
                result = result.filter(p => p.isActive);
                break;
            case 'inactive':
                result = result.filter(p => !p.isActive);
                break;
            case 'low-stock':
                result = result.filter(p => p.isActive && p.minStock !== undefined && p.stock <= p.minStock);
                break;
            case 'no-stock':
                result = result.filter(p => p.stock === 0);
                break;
            case 'low-margin':
                result = result.filter(p => {
                    if (!p.cost || p.cost === 0) return false;
                    const marginPercentage = ((p.price - p.cost) / p.cost) * 100;
                    return marginPercentage < 20;
                });
                break;
            case 'uncategorized':
                result = result.filter(p => !p.categoryId);
                break;
        }

        // Search
        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase().replace(/[\s-]/g, '');
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.code?.toLowerCase().replace(/[\s-]/g, '').includes(query)
            );
        }

        // Advanced filters - categories
        if (advancedFilters.categoryIds.length > 0 || advancedFilters.includeUncategorized) {
            result = result.filter(p => {
                if (advancedFilters.includeUncategorized && !p.categoryId) return true;
                return p.categoryId && advancedFilters.categoryIds.includes(p.categoryId);
            });
        }

        // Price range
        if (advancedFilters.priceMin !== undefined) {
            result = result.filter(p => p.price >= advancedFilters.priceMin!);
        }
        if (advancedFilters.priceMax !== undefined) {
            result = result.filter(p => p.price <= advancedFilters.priceMax!);
        }

        // Stock range
        if (advancedFilters.stockMin !== undefined) {
            result = result.filter(p => p.stock >= advancedFilters.stockMin!);
        }
        if (advancedFilters.stockMax !== undefined) {
            result = result.filter(p => p.stock <= advancedFilters.stockMax!);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;

            switch (advancedFilters.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'stock':
                    comparison = a.stock - b.stock;
                    break;
                case 'margin':
                    const marginA = a.cost ? a.price - a.cost : 0;
                    const marginB = b.cost ? b.price - b.cost : 0;
                    comparison = marginA - marginB;
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
            }

            return advancedFilters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [products, quickFilter, debouncedSearch, advancedFilters]);

    // Counts for quick filters
    const counts = useMemo(() => ({
        all: products.length,
        active: products.filter(p => p.isActive).length,
        inactive: products.filter(p => !p.isActive).length,
        lowStock: products.filter(p => p.isActive && p.minStock !== undefined && p.stock <= p.minStock).length,
        noStock: products.filter(p => p.stock === 0).length,
        lowMargin: products.filter(p => {
            if (!p.cost || p.cost === 0) return false;
            const marginPercentage = ((p.price - p.cost) / p.cost) * 100;
            return marginPercentage < 20;
        }).length,
        uncategorized: products.filter(p => !p.categoryId).length,
    }), [products]);

    // Active filter chips (from advanced filters)
    const activeFilterChips = useMemo(() => {
        const chips: Array<{ label: string; onRemove: () => void }> = [];

        advancedFilters.categoryIds.forEach(catId => {
            const category = categories.find(c => c.id === catId);
            if (category) {
                chips.push({
                    label: `Categoría: ${category.name}`,
                    onRemove: () => setAdvancedFilters(prev => ({
                        ...prev,
                        categoryIds: prev.categoryIds.filter(id => id !== catId),
                    })),
                });
            }
        });

        if (advancedFilters.includeUncategorized) {
            chips.push({
                label: 'Sin categoría',
                onRemove: () => setAdvancedFilters(prev => ({ ...prev, includeUncategorized: false })),
            });
        }

        if (advancedFilters.priceMin !== undefined || advancedFilters.priceMax !== undefined) {
            chips.push({
                label: `Precio: ${advancedFilters.priceMin || '0'} - ${advancedFilters.priceMax || '∞'}`,
                onRemove: () => setAdvancedFilters(prev => ({ ...prev, priceMin: undefined, priceMax: undefined })),
            });
        }

        if (advancedFilters.stockMin !== undefined || advancedFilters.stockMax !== undefined) {
            chips.push({
                label: `Stock: ${advancedFilters.stockMin || '0'} - ${advancedFilters.stockMax || '∞'}`,
                onRemove: () => setAdvancedFilters(prev => ({ ...prev, stockMin: undefined, stockMax: undefined })),
            });
        }

        return chips;
    }, [advancedFilters, categories]);

    // Category management
    const handleCreateCategory = (name: string, color?: string) => {
        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name,
            color,
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const handleUpdateCategory = (id: string, name: string, color?: string) => {
        setCategories(prev => prev.map(c => (c.id === id ? { ...c, name, color } : c)));
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        setProducts(prev => prev.map(p => (p.categoryId === id ? { ...p, categoryId: undefined } : p)));
    };

    const productsCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            if (p.categoryId) {
                counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
            }
        });
        return counts;
    }, [products]);

    // Product CRUD
    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            code: '',
            price: '',
            cost: '',
            stock: '',
            minStock: '',
            categoryId: undefined,
        });
        setShowProductModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            code: product.code || '',
            price: product.price.toString(),
            cost: product.cost?.toString() || '',
            stock: product.stock.toString(),
            minStock: product.minStock?.toString() || '',
            categoryId: product.categoryId,
        });
        setShowProductModal(true);
        setDetailProduct(null); // Close detail drawer if open
    };

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
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
                ...p,
                name: formData.name,
                code: formData.code || undefined,
                price: parseFloat(formData.price),
                cost: formData.cost ? parseFloat(formData.cost) : undefined,
                stock: parseInt(formData.stock) || 0,
                minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
                categoryId: formData.categoryId,
                updatedAt: new Date(),
            } : p));
            showToast('success', 'Producto actualizado');
        } else {
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                name: formData.name,
                code: formData.code || undefined,
                price: parseFloat(formData.price),
                cost: formData.cost ? parseFloat(formData.cost) : undefined,
                stock: parseInt(formData.stock) || 0,
                minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
                categoryId: formData.categoryId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProducts(prev => [...prev, newProduct]);
            showToast('success', 'Producto creado');
        }

        setShowProductModal(false);
    };

    const toggleActive = (product: Product) => {
        showConfirm({
            title: `¿${product.isActive ? 'Desactivar' : 'Activar'} producto?`,
            message: `El producto "${product.name}" será ${product.isActive ? 'desactivado' : 'activado'}.`,
            confirmText: product.isActive ? 'Desactivar' : 'Activar',
            variant: product.isActive ? 'warning' : 'default',
            onConfirm: () => {
                setProducts(prev => prev.map(p =>
                    p.id === product.id ? { ...p, isActive: !p.isActive } : p
                ));
                showToast('success', `Producto ${product.isActive ? 'desactivado' : 'activado'}`);
            },
            onCancel: () => {},
        });
    };

    // Selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    // Bulk actions
    const handleBulkActivate = () => {
        const count = selectedIds.size;
        setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isActive: true } : p));
        setSelectedIds(new Set());
        showToast('success', `${count} producto(s) activado(s)`);
    };

    const handleBulkDeactivate = () => {
        const count = selectedIds.size;
        setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isActive: false } : p));
        setSelectedIds(new Set());
        showToast('success', `${count} producto(s) desactivado(s)`);
    };

    const handleBulkAssignCategory = () => {
        // TODO: Open category selector
        showToast('info', 'Asignar categoría masiva (próximamente)');
    };

    const handleBulkRemoveCategory = () => {
        const count = selectedIds.size;
        setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, categoryId: undefined } : p));
        setSelectedIds(new Set());
        showToast('success', `${count} producto(s) sin categoría`);
    };

    const handleBulkExport = () => {
        const selectedProducts = products.filter(p => selectedIds.has(p.id));
        const csv = generateCSV(selectedProducts);
        downloadCSV(csv, 'productos-seleccionados.csv');
        showToast('success', 'Exportación completada');
    };

    const handleBulkDelete = () => {
        showConfirm({
            title: 'Eliminar productos',
            message: `¿Eliminar ${selectedIds.size} producto(s) seleccionado(s)?`,
            confirmText: 'Eliminar',
            variant: 'danger',
            onConfirm: () => {
                setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
                setSelectedIds(new Set());
                showToast('success', 'Productos eliminados');
            },
            onCancel: () => {},
        });
    };

    // Export
    const handleExport = () => {
        const csv = generateCSV(filteredProducts);
        downloadCSV(csv, 'productos.csv');
        showToast('success', 'Exportación completada');
    };

    const generateCSV = (productsToExport: Product[]) => {
        const headers = ['Nombre', 'Código', 'Precio', 'Costo', 'Stock', 'Mínimo', 'Categoría', 'Activo'];
        const rows = productsToExport.map(p => [
            p.name,
            p.code || '',
            p.price,
            p.cost || '',
            p.stock,
            p.minStock || '',
            categories.find(c => c.id === p.categoryId)?.name || '',
            p.isActive ? 'Si' : 'No',
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import
    const handleImport = (data: any[], createMissingCategories: boolean) => {
        if (createMissingCategories) {
            const existingCategoryNames = categories.map(c => c.name.toLowerCase());
            const newCategories = data
                .map(row => row.category)
                .filter(cat => cat && !existingCategoryNames.includes(cat.toLowerCase()))
                .filter((v, i, a) => a.indexOf(v) === i)
                .map(name => ({
                    id: `cat-${Date.now()}-${Math.random()}`,
                    name,
                    color: undefined,
                }));

            if (newCategories.length > 0) {
                setCategories(prev => [...prev, ...newCategories]);
            }
        }

        const newProducts: Product[] = data.map(row => ({
            id: `prod-${Date.now()}-${Math.random()}`,
            name: row.name,
            code: row.code,
            price: row.price,
            cost: row.cost,
            stock: row.stock,
            minStock: row.minStock,
            categoryId: row.category
                ? categories.find(c => c.name.toLowerCase() === row.category.toLowerCase())?.id
                : undefined,
            isActive: row.isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        setProducts(prev => [...prev, ...newProducts]);
    };

    // Quick edit category
    const handleQuickEditCategory = (product: Product, anchor: HTMLElement) => {
        setQuickEditProduct(product);
        setQuickEditAnchor(anchor);
    };

    const handleQuickEditSelect = (categoryId: string | undefined) => {
        if (quickEditProduct) {
            setProducts(prev => prev.map(p =>
                p.id === quickEditProduct.id ? { ...p, categoryId, updatedAt: new Date() } : p
            ));
            showToast('success', 'Categoría actualizada');
        }
        setQuickEditProduct(null);
        setQuickEditAnchor(null);
    };

    // Keyboard shortcuts
    const [focusedProductId, setFocusedProductId] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                // Allow ⌘K even in inputs
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('.products-search-input')?.focus();
                }
                return;
            }

            // ⌘K / Ctrl+K - Quick search (focus search)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector<HTMLInputElement>('.products-search-input')?.focus();
                return;
            }

            // Escape - Close modals/drawers
            if (e.key === 'Escape') {
                if (detailProduct) setDetailProduct(null);
                if (quickEditProduct) {
                    setQuickEditProduct(null);
                    setQuickEditAnchor(null);
                }
                return;
            }

            // Shortcuts when a row is focused (via keyboard navigation)
            if (focusedProductId) {
                const product = products.find(p => p.id === focusedProductId);
                if (!product) return;

                switch (e.key.toLowerCase()) {
                    case 'enter':
                        e.preventDefault();
                        setDetailProduct(product);
                        break;
                    case 'e':
                        if (canEdit) {
                            e.preventDefault();
                            openEditModal(product);
                        }
                        break;
                    case 's':
                        if (canEdit) {
                            e.preventDefault();
                            showToast('info', 'Ajustar stock (próximamente)');
                        }
                        break;
                    case 'c':
                        if (canEdit) {
                            e.preventDefault();
                            // Get the row element to use as anchor
                            const rowElement = document.querySelector(`[data-product-id="${focusedProductId}"]`);
                            if (rowElement) {
                                handleQuickEditCategory(product, rowElement as HTMLElement);
                            }
                        }
                        break;
                }
            }

            // Arrow navigation in table
            if (filteredProducts.length > 0) {
                const currentIndex = focusedProductId
                    ? filteredProducts.findIndex(p => p.id === focusedProductId)
                    : -1;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = currentIndex < filteredProducts.length - 1 ? currentIndex + 1 : 0;
                    setFocusedProductId(filteredProducts[nextIndex].id);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredProducts.length - 1;
                    setFocusedProductId(filteredProducts[prevIndex].id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedProductId, products, filteredProducts, canEdit, detailProduct, quickEditProduct]);

    const isLowStock = (product: Product) =>
        product.isActive && product.minStock !== undefined && product.stock <= product.minStock;

    const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));
    const someSelected = filteredProducts.some(p => selectedIds.has(p.id));

    return (
        <div className="products-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Productos</h1>
                        <p className="page-subtitle">Gestioná precios, stock, estado y categorías</p>
                    </div>
                    <div className="page-header-actions">
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download size={16} />}
                            onClick={handleExport}
                        >
                            Exportar
                        </Button>
                        <PermissionGate permission="CREATE_PRODUCT">
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Upload size={16} />}
                                onClick={() => setShowImportWizard(true)}
                            >
                                Importar
                            </Button>
                        </PermissionGate>
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Tag size={16} />}
                            onClick={() => setShowCategoryManager(true)}
                        >
                            Categorías
                        </Button>
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
                        <div className="products-toolbar">
                            <div className="products-toolbar-top">
                                <div className="search-input products-search-wrapper">
                                    <span className="search-input-icon"><Search size={18} /></span>
                                    <input
                                        type="search"
                                        className="input products-search-input"
                                        placeholder="Buscar por nombre o código... (⌘K)"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="products-toolbar-actions">
                                    {canViewCost && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCosts(!showCosts)}
                                            title="Mostrar/Ocultar costos y márgenes"
                                        >
                                            {showCosts ? 'Ocultar costos' : 'Mostrar costos'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Layers size={16} />}
                                        onClick={() => setViewDensity(viewDensity === 'normal' ? 'compact' : 'normal')}
                                        title="Cambiar densidad de vista"
                                    >
                                        {viewDensity === 'normal' ? 'Vista compacta' : 'Vista normal'}
                                    </Button>
                                </div>
                            </div>

                            {/* Quick filters */}
                            <div className="filter-pills">
                                <FilterPill
                                    label="Todos"
                                    count={counts.all}
                                    isActive={quickFilter === 'all'}
                                    onClick={() => setQuickFilter('all')}
                                />
                                <FilterPill
                                    label="Activos"
                                    count={counts.active}
                                    isActive={quickFilter === 'active'}
                                    onClick={() => setQuickFilter('active')}
                                />
                                <FilterPill
                                    label="Inactivos"
                                    count={counts.inactive}
                                    isActive={quickFilter === 'inactive'}
                                    onClick={() => setQuickFilter('inactive')}
                                />
                                <FilterPill
                                    label="Stock bajo"
                                    count={counts.lowStock}
                                    isActive={quickFilter === 'low-stock'}
                                    onClick={() => setQuickFilter('low-stock')}
                                />
                                <FilterPill
                                    label="Sin stock"
                                    count={counts.noStock}
                                    isActive={quickFilter === 'no-stock'}
                                    onClick={() => setQuickFilter('no-stock')}
                                />
                                {canViewCost && (
                                    <FilterPill
                                        label="Margen bajo"
                                        count={counts.lowMargin}
                                        isActive={quickFilter === 'low-margin'}
                                        onClick={() => setQuickFilter('low-margin')}
                                    />
                                )}
                                <FilterPill
                                    label="Sin categoría"
                                    count={counts.uncategorized}
                                    isActive={quickFilter === 'uncategorized'}
                                    onClick={() => setQuickFilter('uncategorized')}
                                />
                            </div>

                            {/* Advanced filters */}
                            <AdvancedFilters
                                categories={categories}
                                filters={advancedFilters}
                                onFiltersChange={setAdvancedFilters}
                                onReset={() => setAdvancedFilters({
                                    categoryIds: [],
                                    includeUncategorized: false,
                                    priceMin: undefined,
                                    priceMax: undefined,
                                    stockMin: undefined,
                                    stockMax: undefined,
                                    sortBy: 'name',
                                    sortOrder: 'asc',
                                })}
                            />

                            {/* Active filter chips */}
                            {activeFilterChips.length > 0 && (
                                <div className="products-active-filters">
                                    {activeFilterChips.map((chip, index) => (
                                        <span key={index} className="products-active-filter-chip">
                                            {chip.label}
                                            <button onClick={chip.onRemove}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bulk action bar */}
                        <BulkActionBar
                            selectedCount={selectedIds.size}
                            onClearSelection={() => setSelectedIds(new Set())}
                            onActivate={handleBulkActivate}
                            onDeactivate={handleBulkDeactivate}
                            onAssignCategory={handleBulkAssignCategory}
                            onRemoveCategory={handleBulkRemoveCategory}
                            onExport={handleBulkExport}
                            onDelete={handleBulkDelete}
                            canEdit={canEdit}
                        />

                        {/* Table */}
                        <CardBody noPadding>
                            {filteredProducts.length === 0 ? (
                                <div className="table-empty">
                                    <Package size={48} className="table-empty-icon" />
                                    <h3 className="table-empty-title">No hay productos</h3>
                                    <p className="table-empty-message">
                                        {searchQuery || activeFilterChips.length > 0
                                            ? 'No se encontraron productos con ese criterio.'
                                            : 'Agregá productos para empezar.'}
                                    </p>
                                    {canCreate && !searchQuery && activeFilterChips.length === 0 && (
                                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                                            Agregar producto
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className={`table ${viewDensity === 'compact' ? 'table-compact' : ''}`}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={input => {
                                                            if (input) input.indeterminate = someSelected && !allSelected;
                                                        }}
                                                        onChange={e => handleSelectAll(e.target.checked)}
                                                    />
                                                </th>
                                                <th>Producto</th>
                                                <th>Categoría</th>
                                                <th>Código</th>
                                                <th className="text-right">Precio</th>
                                                {canViewCost && showCosts && <th className="text-right">Costo</th>}
                                                {canViewCost && showCosts && <th className="text-right">Margen</th>}
                                                <th>Stock</th>
                                                <th>Estado</th>
                                                <th style={{ width: '100px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(product => {
                                                const category = categories.find(c => c.id === product.categoryId);
                                                return (
                                            <tr
                                                key={product.id}
                                                data-product-id={product.id}
                                                className={`table-row-clickable ${focusedProductId === product.id ? 'table-row-focused' : ''}`}
                                                onClick={() => setDetailProduct(product)}
                                                onMouseEnter={() => setFocusedProductId(product.id)}
                                                tabIndex={0}
                                            >
                                                        <td onClick={e => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(product.id)}
                                                                onChange={e => handleSelectOne(product.id, e.target.checked)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="product-name-cell">
                                                                <span className="product-name">{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td onClick={e => e.stopPropagation()}>
                                                            <CategoryBadge
                                                                categoryName={category?.name}
                                                                categoryColor={category?.color}
                                                                onClick={(e) => {
                                                                    handleQuickEditCategory(product, e.target as HTMLElement);
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <span className="product-code">{product.code || '-'}</span>
                                                        </td>
                                                        <td className="text-right font-semibold">
                                                            {formatCurrency(product.price)}
                                                        </td>
                                                        {canViewCost && showCosts && (
                                                            <td className="text-right text-secondary">
                                                                {product.cost ? formatCurrency(product.cost) : '-'}
                                                            </td>
                                                        )}
                                                        {canViewCost && showCosts && (
                                                            <td className="text-right">
                                                                <MarginDisplay
                                                                    price={product.price}
                                                                    cost={product.cost}
                                                                    compact={viewDensity === 'compact'}
                                                                />
                                                            </td>
                                                        )}
                                                        <td>
                                                            <StockIndicator
                                                                current={product.stock}
                                                                min={product.minStock}
                                                                showBar={viewDensity === 'normal'}
                                                                compact={viewDensity === 'compact'}
                                                            />
                                                        </td>
                                                        <td>
                                                            {product.isActive ? (
                                                                <Badge variant="success">Activo</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Inactivo</Badge>
                                                            )}
                                                        </td>
                                                        <td onClick={e => e.stopPropagation()}>
                                                            {canEdit && (
                                                                <div className="table-actions">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        isIcon
                                                                        onClick={() => setDetailProduct(product)}
                                                                        title="Ver detalle"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Product Form Modal */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
                size="md"
            >
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="product-form-grid">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Input
                                label="Nombre"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Nombre del producto"
                                required
                                autoFocus
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="input-label">Categoría</label>
                            <CategorySelect
                                categories={categories}
                                value={formData.categoryId}
                                onChange={categoryId => setFormData(prev => ({ ...prev, categoryId }))}
                                onCreateCategory={name => handleCreateCategory(name)}
                            />
                        </div>

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

            {/* Category Manager Drawer */}
            <CategoryManagerDrawer
                isOpen={showCategoryManager}
                onClose={() => setShowCategoryManager(false)}
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                productsCount={productsCountByCategory}
            />

            {/* Product Detail Drawer */}
            <ProductDetailDrawer
                isOpen={!!detailProduct}
                onClose={() => setDetailProduct(null)}
                product={detailProduct}
                category={detailProduct ? categories.find(c => c.id === detailProduct.categoryId) : undefined}
                onEdit={openEditModal}
                onToggleActive={toggleActive}
            />

            {/* Quick Edit Popover */}
            <QuickEditPopover
                isOpen={!!quickEditProduct}
                onClose={() => {
                    setQuickEditProduct(null);
                    setQuickEditAnchor(null);
                }}
                categories={categories}
                currentCategoryId={quickEditProduct?.categoryId}
                onSelect={handleQuickEditSelect}
                anchorEl={quickEditAnchor}
            />

            {/* Import Wizard */}
            <ImportWizard
                isOpen={showImportWizard}
                onClose={() => setShowImportWizard(false)}
                categories={categories}
                onImport={handleImport}
            />
        </div>
    );
}
