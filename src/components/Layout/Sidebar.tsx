// ================================
// SIDEBAR COMPONENT
// Sistema de Gestión Comercial
// ================================

import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    Package,
    Users,
    BarChart3,
    Download,
    Settings,
    UserCog,
    LogOut,
    Store,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { getRoleDisplayName } from '../../utils/permissions';
import { getLowStockProducts } from '../../mocks/data/products';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    permission?: string;
    badge?: number;
}

const mainNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, permission: 'VIEW_DASHBOARD' },
    { path: '/pos', label: 'Vender', icon: <ShoppingCart size={20} />, permission: 'ACCESS_POS' },
    { path: '/caja', label: 'Caja', icon: <Wallet size={20} />, permission: 'VIEW_CASH_REGISTER' },
    { path: '/productos', label: 'Productos', icon: <Package size={20} />, permission: 'VIEW_PRODUCTS' },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} />, permission: 'VIEW_CLIENTS' },
    { path: '/reportes', label: 'Reportes', icon: <BarChart3 size={20} />, permission: 'VIEW_REPORTS' },
    { path: '/exportaciones', label: 'Exportaciones', icon: <Download size={20} />, permission: 'EXPORT_DATA' },
];

const adminNavItems: NavItem[] = [
    { path: '/usuarios', label: 'Usuarios', icon: <UserCog size={20} />, permission: 'VIEW_USERS' },
    { path: '/configuracion', label: 'Configuración', icon: <Settings size={20} />, permission: 'VIEW_SETTINGS' },
];

export function Sidebar() {
    const { currentUser, hasPermission, logout } = useAuth();
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useUI();
    const navigate = useNavigate();

    const lowStockCount = getLowStockProducts().length;

    const filterByPermission = (items: NavItem[]) => {
        return items.filter(item => {
            if (!item.permission) return true;
            return hasPermission(item.permission as any);
        });
    };

    const visibleMainNav = filterByPermission(mainNavItems);
    const visibleAdminNav = filterByPermission(adminNavItems);

    // Add low stock badge to products
    const mainNavWithBadges = visibleMainNav.map(item => {
        if (item.path === '/productos' && lowStockCount > 0) {
            return { ...item, badge: lowStockCount };
        }
        return item;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
        closeSidebar();
    };

    const handleNavClick = () => {
        closeSidebar();
    };

    const userInitials = currentUser?.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const roleClass = currentUser?.role.toLowerCase() || 'employee';

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay (mobile) */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <Store size={24} />
                        </div>
                        <div>
                            <div className="sidebar-logo-text">Gestor.io</div>
                            <div className="sidebar-logo-subtitle">Sistema Comercial</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {/* Main nav */}
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Principal</div>
                        {mainNavWithBadges.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={handleNavClick}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                                {item.badge && item.badge > 0 && (
                                    <span className="sidebar-link-badge">{item.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Admin nav */}
                    {visibleAdminNav.length > 0 && (
                        <div className="sidebar-section">
                            <div className="sidebar-section-title">Administración</div>
                            {visibleAdminNav.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <span className="sidebar-link-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>

                {/* User info */}
                <div className="sidebar-user">
                    <NavLink
                        to="/cuenta"
                        className="sidebar-user-info"
                        onClick={handleNavClick}
                    >
                        <div className="sidebar-user-avatar">{userInitials}</div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">{currentUser?.name}</div>
                            <div className={`sidebar-user-role ${roleClass}`}>
                                {getRoleDisplayName(currentUser?.role || 'EMPLOYEE')}
                            </div>
                        </div>
                    </NavLink>

                    <button className="sidebar-link" onClick={handleLogout}>
                        <span className="sidebar-link-icon"><LogOut size={20} /></span>
                        Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
