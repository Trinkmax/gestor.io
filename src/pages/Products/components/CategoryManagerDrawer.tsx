// ================================
// CATEGORY MANAGER DRAWER
// Gestión completa de categorías
// ================================

import { useState, useMemo } from 'react';
import { X, Plus, Search, Edit2, Trash2, Check, XIcon } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { useUI } from '../../../contexts/UIContext';
import type { Category } from '../../../types';
import { CategoryBadge } from './CategoryBadge';

interface CategoryManagerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onCreateCategory: (name: string, color?: string) => void;
    onUpdateCategory: (id: string, name: string, color?: string) => void;
    onDeleteCategory: (id: string) => void;
    productsCount?: Record<string, number>; // Contador de productos por categoría
}

const PRESET_COLORS = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#64748b', // slate
];

export function CategoryManagerDrawer({
    isOpen,
    onClose,
    categories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    productsCount = {},
}: CategoryManagerDrawerProps) {
    const { showToast, showConfirm } = useUI();
    const [searchQuery, setSearchQuery] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(cat => cat.name.toLowerCase().includes(query));
    }, [categories, searchQuery]);

    const handleCreate = () => {
        const name = newCategoryName.trim();
        if (!name) {
            showToast('warning', 'El nombre es obligatorio');
            return;
        }

        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast('warning', 'Ya existe una categoría con ese nombre');
            return;
        }

        onCreateCategory(name, newCategoryColor);
        setNewCategoryName('');
        setNewCategoryColor(PRESET_COLORS[0]);
        showToast('success', 'Categoría creada');
    };

    const handleStartEdit = (category: Category) => {
        setEditingId(category.id);
        setEditName(category.name);
        setEditColor(category.color || PRESET_COLORS[0]);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;

        const name = editName.trim();
        if (!name) {
            showToast('warning', 'El nombre es obligatorio');
            return;
        }

        if (categories.some(c => c.id !== editingId && c.name.toLowerCase() === name.toLowerCase())) {
            showToast('warning', 'Ya existe una categoría con ese nombre');
            return;
        }

        onUpdateCategory(editingId, name, editColor);
        setEditingId(null);
        showToast('success', 'Categoría actualizada');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditColor('');
    };

    const handleDelete = (category: Category) => {
        const count = productsCount[category.id] || 0;
        const message = count > 0
            ? `Hay ${count} producto(s) asignado(s) a "${category.name}". Quedarán sin categoría.`
            : `¿Eliminar la categoría "${category.name}"?`;

        showConfirm({
            title: 'Eliminar categoría',
            message,
            confirmText: 'Eliminar',
            variant: 'danger',
            onConfirm: () => {
                onDeleteCategory(category.id);
                showToast('success', 'Categoría eliminada');
            },
            onCancel: () => {},
        });
    };

    if (!isOpen) return null;

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer drawer-right" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div>
                        <h2 className="drawer-title">Gestionar categorías</h2>
                        <p className="drawer-subtitle">{categories.length} categoría(s)</p>
                    </div>
                    <Button variant="ghost" size="sm" isIcon onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                <div className="drawer-body">
                    {/* Crear nueva categoría */}
                    <div className="category-create-section">
                        <h3 className="section-title">Nueva categoría</h3>
                        <div className="category-create-form">
                            <Input
                                placeholder="Nombre de categoría"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            />
                            <div className="category-color-picker">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className={`category-color-option ${newCategoryColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewCategoryColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="primary"
                                leftIcon={<Plus size={16} />}
                                onClick={handleCreate}
                                fullWidth
                            >
                                Crear categoría
                            </Button>
                        </div>
                    </div>

                    {/* Buscar categorías */}
                    {categories.length > 5 && (
                        <div className="search-input">
                            <span className="search-input-icon">
                                <Search size={18} />
                            </span>
                            <input
                                type="search"
                                className="input"
                                placeholder="Buscar categoría..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Lista de categorías */}
                    <div className="category-list">
                        {filteredCategories.length === 0 ? (
                            <div className="category-list-empty">
                                {searchQuery ? 'No se encontraron categorías' : 'No hay categorías'}
                            </div>
                        ) : (
                            filteredCategories.map(category => (
                                <div key={category.id} className="category-list-item">
                                    {editingId === category.id ? (
                                        <>
                                            <div className="category-edit-form">
                                                <Input
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleSaveEdit();
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="category-color-picker category-color-picker-inline">
                                                    {PRESET_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            className={`category-color-option ${editColor === color ? 'active' : ''}`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setEditColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="category-list-item-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isIcon
                                                    onClick={handleSaveEdit}
                                                    title="Guardar"
                                                >
                                                    <Check size={16} className="text-success" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isIcon
                                                    onClick={handleCancelEdit}
                                                    title="Cancelar"
                                                >
                                                    <XIcon size={16} />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="category-list-item-info">
                                                <CategoryBadge
                                                    categoryName={category.name}
                                                    categoryColor={category.color}
                                                    size="md"
                                                />
                                                {productsCount[category.id] !== undefined && (
                                                    <span className="category-list-item-count">
                                                        {productsCount[category.id]} producto(s)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="category-list-item-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isIcon
                                                    onClick={() => handleStartEdit(category)}
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isIcon
                                                    onClick={() => handleDelete(category)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} className="text-danger" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
