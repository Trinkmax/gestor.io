// ================================
// PLACEHOLDER PAGES
// Sistema de Gestión Comercial
// ================================

import { Construction } from 'lucide-react';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    return (
        <div className="placeholder-page">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">{title}</h1>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    <div className="placeholder-content">
                        <Construction size={64} />
                        <h2>En construcción</h2>
                        <p>{description || 'Esta sección está siendo desarrollada.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pre-configured placeholder pages
export function POSPage() {
    return <PlaceholderPage title="Vender (POS)" description="El punto de venta estará disponible próximamente." />;
}

export function CashRegisterPage() {
    return <PlaceholderPage title="Caja" description="La gestión de caja estará disponible próximamente." />;
}

export function ProductsPage() {
    return <PlaceholderPage title="Productos" description="La gestión de productos estará disponible próximamente." />;
}

export function ClientsPage() {
    return <PlaceholderPage title="Clientes" description="La gestión de clientes estará disponible próximamente." />;
}

export function ReportsPage() {
    return <PlaceholderPage title="Reportes" description="Los reportes estarán disponibles próximamente." />;
}

export function ExportsPage() {
    return <PlaceholderPage title="Exportaciones" description="Las exportaciones estarán disponibles próximamente." />;
}

export function UsersPage() {
    return <PlaceholderPage title="Usuarios" description="La gestión de usuarios estará disponible próximamente." />;
}

export function SettingsPage() {
    return <PlaceholderPage title="Configuración" description="La configuración estará disponible próximamente." />;
}

export function LoginPage() {
    return <PlaceholderPage title="Iniciar sesión" description="El inicio de sesión estará disponible próximamente." />;
}
