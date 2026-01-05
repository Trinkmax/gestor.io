// ================================
// MODAL COMPONENT
// Sistema de Gestión Comercial
// ================================

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    showClose = true,
    children,
    footer,
}: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className={`modal modal-${size}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {(title || showClose) && (
                    <div className="modal-header">
                        {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
                        {showClose && (
                            <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
