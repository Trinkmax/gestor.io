// ================================
// ADVANCED FILTERS
// Panel colapsable con filtros avanzados
// ================================

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { CategoryBadge } from './CategoryBadge';
import type { Category } from '../../../types';

export interface AdvancedFiltersState {
    categoryIds: string[];
    includeUncategorized: boolean;
    priceMin?: number;
    priceMax?: number;
    stockMin?: number;
    stockMax?: number;
    sortBy: 'name' | 'price' | 'stock' | 'margin' | 'updated';
    sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
    categories: Category[];
    filters: AdvancedFiltersState;
    onFiltersChange: (filters: AdvancedFiltersState) => void;
    onReset: () => void;
}

export function AdvancedFilters({
    categories,
    filters,
    onFiltersChange,
    onReset,
}: AdvancedFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasActiveFilters =
        filters.categoryIds.length > 0 ||
        filters.includeUncategorized ||
        filters.priceMin !== undefined ||
        filters.priceMax !== undefined ||
        filters.stockMin !== undefined ||
        filters.stockMax !== undefined ||
        filters.sortBy !== 'name' ||
        filters.sortOrder !== 'asc';

    const handleCategoryToggle = (categoryId: string) => {
        const newIds = filters.categoryIds.includes(categoryId)
            ? filters.categoryIds.filter(id => id !== categoryId)
            : [...filters.categoryIds, categoryId];

        onFiltersChange({ ...filters, categoryIds: newIds });
    };

    const handleSortChange = (sortBy: AdvancedFiltersState['sortBy']) => {
        const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
        onFiltersChange({ ...filters, sortBy, sortOrder: newOrder });
    };

    return (
        <div className="advanced-filters">
            <div className="advanced-filters-header">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    rightIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                >
                    Filtros avanzados
                    {hasActiveFilters && (
                        <span className="advanced-filters-badge">●</span>
                    )}
                </Button>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {isExpanded && (
                <div className="advanced-filters-body">
                    {/* Categorías */}
                    <div className="advanced-filters-section">
                        <label className="advanced-filters-label">Categorías</label>
                        <div className="advanced-filters-categories">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`advanced-filters-category-item ${
                                        filters.categoryIds.includes(category.id) ? 'active' : ''
                                    }`}
                                    onClick={() => handleCategoryToggle(category.id)}
                                >
                                    <CategoryBadge
                                        categoryName={category.name}
                                        categoryColor={category.color}
                                    />
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`advanced-filters-category-item ${
                                    filters.includeUncategorized ? 'active' : ''
                                }`}
                                onClick={() =>
                                    onFiltersChange({
                                        ...filters,
                                        includeUncategorized: !filters.includeUncategorized,
                                    })
                                }
                            >
                                <CategoryBadge />
                            </button>
                        </div>
                    </div>

                    {/* Rango de precio */}
                    <div className="advanced-filters-section">
                        <label className="advanced-filters-label">Rango de precio</label>
                        <div className="advanced-filters-range">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.priceMin || ''}
                                onChange={e =>
                                    onFiltersChange({
                                        ...filters,
                                        priceMin: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.priceMax || ''}
                                onChange={e =>
                                    onFiltersChange({
                                        ...filters,
                                        priceMax: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Rango de stock */}
                    <div className="advanced-filters-section">
                        <label className="advanced-filters-label">Rango de stock</label>
                        <div className="advanced-filters-range">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.stockMin || ''}
                                onChange={e =>
                                    onFiltersChange({
                                        ...filters,
                                        stockMin: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.stockMax || ''}
                                onChange={e =>
                                    onFiltersChange({
                                        ...filters,
                                        stockMax: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Ordenar por */}
                    <div className="advanced-filters-section">
                        <label className="advanced-filters-label">Ordenar por</label>
                        <div className="advanced-filters-sort">
                            <Button
                                variant={filters.sortBy === 'name' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleSortChange('name')}
                            >
                                Nombre
                                {filters.sortBy === 'name' && (
                                    <span className="advanced-filters-sort-arrow">
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant={filters.sortBy === 'price' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleSortChange('price')}
                            >
                                Precio
                                {filters.sortBy === 'price' && (
                                    <span className="advanced-filters-sort-arrow">
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant={filters.sortBy === 'stock' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleSortChange('stock')}
                            >
                                Stock
                                {filters.sortBy === 'stock' && (
                                    <span className="advanced-filters-sort-arrow">
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant={filters.sortBy === 'margin' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleSortChange('margin')}
                            >
                                Margen
                                {filters.sortBy === 'margin' && (
                                    <span className="advanced-filters-sort-arrow">
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant={filters.sortBy === 'updated' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleSortChange('updated')}
                            >
                                Actualizado
                                {filters.sortBy === 'updated' && (
                                    <span className="advanced-filters-sort-arrow">
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
