// ================================
// CATEGORY SELECT
// Select con búsqueda y opción de crear categoría inline
// ================================

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { CategoryBadge } from './CategoryBadge';
import type { Category } from '../../../types';
import { useUI } from '../../../contexts/UIContext';

interface CategorySelectProps {
    categories: Category[];
    value?: string;
    onChange: (categoryId: string | undefined) => void;
    onCreateCategory?: (name: string) => void;
    placeholder?: string;
    allowEmpty?: boolean;
    disabled?: boolean;
}

export function CategorySelect({
    categories,
    value,
    onChange,
    onCreateCategory,
    placeholder = 'Seleccionar categoría',
    allowEmpty = true,
    disabled = false,
}: CategorySelectProps) {
    const { showToast } = useUI();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCategory = categories.find(c => c.id === value);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(cat => cat.name.toLowerCase().includes(query));
    }, [categories, searchQuery]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCreateForm(false);
                setSearchQuery('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleSelect = (categoryId: string | undefined) => {
        onChange(categoryId);
        setIsOpen(false);
        setSearchQuery('');
        setShowCreateForm(false);
    };

    const handleCreateInline = () => {
        const name = newCategoryName.trim();
        if (!name) {
            showToast('warning', 'El nombre es obligatorio');
            return;
        }

        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast('warning', 'Ya existe una categoría con ese nombre');
            return;
        }

        if (onCreateCategory) {
            onCreateCategory(name);
            setNewCategoryName('');
            setShowCreateForm(false);
            setIsOpen(false);
            showToast('success', 'Categoría creada');
        }
    };

    return (
        <div className="category-select" ref={dropdownRef}>
            <button
                type="button"
                className={`category-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {selectedCategory ? (
                    <CategoryBadge
                        categoryName={selectedCategory.name}
                        categoryColor={selectedCategory.color}
                    />
                ) : (
                    <span className="category-select-placeholder">{placeholder}</span>
                )}
                <ChevronDown size={16} className="category-select-icon" />
            </button>

            {isOpen && (
                <div className="category-select-dropdown">
                    {/* Search */}
                    <div className="category-select-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Options */}
                    <div className="category-select-options">
                        {allowEmpty && (
                            <button
                                type="button"
                                className={`category-select-option ${!value ? 'selected' : ''}`}
                                onClick={() => handleSelect(undefined)}
                            >
                                <CategoryBadge />
                            </button>
                        )}

                        {filteredCategories.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                className={`category-select-option ${value === category.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(category.id)}
                            >
                                <CategoryBadge
                                    categoryName={category.name}
                                    categoryColor={category.color}
                                />
                            </button>
                        ))}

                        {filteredCategories.length === 0 && searchQuery && (
                            <div className="category-select-empty">
                                No se encontraron categorías
                            </div>
                        )}
                    </div>

                    {/* Create new */}
                    {onCreateCategory && (
                        <>
                            {showCreateForm ? (
                                <div className="category-select-create-form">
                                    <Input
                                        placeholder="Nombre de nueva categoría"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleCreateInline();
                                            if (e.key === 'Escape') {
                                                setShowCreateForm(false);
                                                setNewCategoryName('');
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <div className="category-select-create-actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setNewCategoryName('');
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button size="sm" variant="primary" onClick={handleCreateInline}>
                                            Crear
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="category-select-create-trigger"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    <Plus size={16} />
                                    Crear nueva categoría
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
