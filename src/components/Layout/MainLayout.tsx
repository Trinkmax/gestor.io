// ================================
// MAIN LAYOUT COMPONENT
// Sistema de Gestión Comercial
// ================================

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useUI } from '../../contexts/UIContext';
import './MainLayout.css';

export function MainLayout() {
    const { toasts, dismissToast, confirmDialog, hideConfirm } = useUI();

    return (
        <div className="main-layout">
            <Sidebar />

            <main className="main-content">
                <Outlet />
            </main>

            {/* Toast notifications */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        type={toast.type}
                        message={toast.message}
                        onDismiss={() => dismissToast(toast.id)}
                    />
                ))}
            </div>

            {/* Confirm dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    cancelText={confirmDialog.cancelText}
                    variant={confirmDialog.variant}
                    onConfirm={() => {
                        confirmDialog.onConfirm();
                        hideConfirm();
                    }}
                    onCancel={() => {
                        confirmDialog.onCancel();
                        hideConfirm();
                    }}
                />
            )}
        </div>
    );
}
