// ================================
// CATEGORY BADGE
// Badge visual para categorías con color
// ================================

import { Tag } from 'lucide-react';

interface CategoryBadgeProps {
    categoryName?: string;
    categoryColor?: string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
    onClick?: () => void;
}

export function CategoryBadge({
    categoryName,
    categoryColor,
    size = 'sm',
    showIcon = false,
    onClick,
}: CategoryBadgeProps) {
    if (!categoryName) {
        return (
            <span className="category-badge category-badge-empty">
                Sin categoría
            </span>
        );
    }

    const style = categoryColor
        ? {
              backgroundColor: `${categoryColor}15`,
              color: categoryColor,
              borderColor: `${categoryColor}30`,
          }
        : undefined;

    return (
        <span
            className={`category-badge ${size === 'sm' ? 'category-badge-sm' : ''} ${onClick ? 'category-badge-clickable' : ''}`}
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {showIcon && <Tag size={12} />}
            {categoryName}
        </span>
    );
}
