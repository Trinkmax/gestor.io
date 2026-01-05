// ================================
// TOAST COMPONENT
// Sistema de Gestión Comercial
// ================================

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onDismiss: () => void;
}

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export function Toast({ type, message, onDismiss }: ToastProps) {
    const Icon = icons[type];

    return (
        <div className={`toast toast-${type}`}>
            <Icon className="toast-icon" size={20} />
            <div className="toast-content">
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-dismiss" onClick={onDismiss} aria-label="Cerrar">
                <X size={16} />
            </button>
        </div>
    );
}
