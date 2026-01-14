// ================================
// QUICK EDIT POPOVER
// Popover para edición rápida de categoría
// ================================

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui';
import { CategoryBadge } from './CategoryBadge';
import type { Category } from '../../../types';

interface QuickEditPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    currentCategoryId?: string;
    onSelect: (categoryId: string | undefined) => void;
    anchorEl?: HTMLElement | null;
}

export function QuickEditPopover({
    isOpen,
    onClose,
    categories,
    currentCategoryId,
    onSelect,
    anchorEl,
}: QuickEditPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, anchorEl, onClose]);

    // Position popover near anchor
    useEffect(() => {
        if (isOpen && popoverRef.current && anchorEl) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();

            let top = anchorRect.bottom + 8;
            let left = anchorRect.left;

            // Adjust if goes off screen
            if (left + popoverRect.width > window.innerWidth) {
                left = window.innerWidth - popoverRect.width - 16;
            }

            if (top + popoverRect.height > window.innerHeight) {
                top = anchorRect.top - popoverRect.height - 8;
            }

            popoverRef.current.style.top = `${top}px`;
            popoverRef.current.style.left = `${left}px`;
        }
    }, [isOpen, anchorEl]);

    if (!isOpen) return null;

    const handleSelect = (categoryId: string | undefined) => {
        onSelect(categoryId);
        onClose();
    };

    return (
        <>
            <div className="quick-edit-popover-backdrop" />
            <div ref={popoverRef} className="quick-edit-popover">
                <div className="quick-edit-popover-header">
                    <span className="quick-edit-popover-title">Cambiar categoría</span>
                    <Button variant="ghost" size="sm" isIcon onClick={onClose}>
                        <X size={16} />
                    </Button>
                </div>
                <div className="quick-edit-popover-options">
                    <button
                        type="button"
                        className={`quick-edit-popover-option ${!currentCategoryId ? 'active' : ''}`}
                        onClick={() => handleSelect(undefined)}
                    >
                        <CategoryBadge />
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            className={`quick-edit-popover-option ${
                                currentCategoryId === category.id ? 'active' : ''
                            }`}
                            onClick={() => handleSelect(category.id)}
                        >
                            <CategoryBadge
                                categoryName={category.name}
                                categoryColor={category.color}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
