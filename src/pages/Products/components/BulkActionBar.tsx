// ================================
// BULK ACTION BAR
// Barra contextual para acciones masivas
// ================================

import { X, ToggleRight, ToggleLeft, Tag, Download, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onAssignCategory?: () => void;
    onRemoveCategory?: () => void;
    onExport?: () => void;
    onDelete?: () => void;
    canEdit?: boolean;
}

export function BulkActionBar({
    selectedCount,
    onClearSelection,
    onActivate,
    onDeactivate,
    onAssignCategory,
    onRemoveCategory,
    onExport,
    onDelete,
    canEdit = true,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="bulk-action-bar">
            <div className="bulk-action-bar-info">
                <span className="bulk-action-bar-count">
                    {selectedCount} producto(s) seleccionado(s)
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<X size={16} />}
                    onClick={onClearSelection}
                >
                    Limpiar selección
                </Button>
            </div>
            <div className="bulk-action-bar-actions">
                {canEdit && (
                    <>
                        {onActivate && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<ToggleRight size={16} />}
                                onClick={onActivate}
                            >
                                Activar
                            </Button>
                        )}
                        {onDeactivate && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<ToggleLeft size={16} />}
                                onClick={onDeactivate}
                            >
                                Desactivar
                            </Button>
                        )}
                        {onAssignCategory && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Tag size={16} />}
                                onClick={onAssignCategory}
                            >
                                Asignar categoría
                            </Button>
                        )}
                        {onRemoveCategory && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Tag size={16} />}
                                onClick={onRemoveCategory}
                            >
                                Quitar categoría
                            </Button>
                        )}
                    </>
                )}
                {onExport && (
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Download size={16} />}
                        onClick={onExport}
                    >
                        Exportar
                    </Button>
                )}
                {canEdit && onDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={onDelete}
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </div>
    );
}
