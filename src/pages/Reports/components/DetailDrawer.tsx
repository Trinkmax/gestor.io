// ================================
// DETAIL DRAWER COMPONENT
// Slide-in drawer for drill-down
// ================================

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './DetailDrawer.css';

interface DetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg';
}

export function DetailDrawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = 'md'
}: DetailDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    
    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    
    // Trap focus
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }
    }, [isOpen]);
    
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div 
                ref={drawerRef}
                className={`drawer-panel ${width}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
            >
                <div className="drawer-header">
                    <div className="drawer-header-content">
                        <h2 id="drawer-title" className="drawer-title">{title}</h2>
                        {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
                    </div>
                    <button 
                        className="drawer-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="drawer-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
