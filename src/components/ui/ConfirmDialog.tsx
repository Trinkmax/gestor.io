// ================================
// CONFIRM DIALOG COMPONENT
// Sistema de Gestión Comercial
// ================================

import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import './Modal.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const Icon = variant === 'danger' ? AlertCircle :
        variant === 'warning' ? AlertTriangle :
            HelpCircle;

    const confirmVariant = variant === 'danger' ? 'danger' :
        variant === 'warning' ? 'warning' :
            'primary';

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div
                className="modal modal-sm confirm-dialog"
                onClick={e => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
            >
                <div className="modal-body">
                    <div className={`confirm-dialog-icon ${variant}`}>
                        <Icon size={24} />
                    </div>
                    <h2 id="confirm-title" className="confirm-dialog-title">{title}</h2>
                    <p id="confirm-message" className="confirm-dialog-message">{message}</p>
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
