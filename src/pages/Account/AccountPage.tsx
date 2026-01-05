// ================================
// MY ACCOUNT PAGE (Role Selector for Testing)
// Sistema de Gestión Comercial
// ================================

import { User, Shield, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardHeader, CardBody, Button, AlertCard } from '../../components/ui';
import { getRoleDisplayName, getRoleColor } from '../../utils/permissions';
import type { Role } from '../../types';
import './AccountPage.css';

const roles: { role: Role; description: string }[] = [
    { role: 'OWNER', description: 'Acceso total al sistema. Puede gestionar usuarios, configuración y ver todos los datos.' },
    { role: 'EMPLOYEE', description: 'Puede vender, ver productos y registrar clientes. Acceso limitado según configuración.' },
    { role: 'ACCOUNTANT', description: 'Puede ver reportes, exportar datos y revisar movimientos. Solo lectura.' },
];

export function AccountPage() {
    const navigate = useNavigate();
    const { currentUser, switchRole, logout } = useAuth();
    const { showToast } = useUI();

    const handleRoleSwitch = (role: Role) => {
        switchRole(role);
        showToast('success', `Cambiaste al rol: ${getRoleDisplayName(role)}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!currentUser) return null;

    const userInitials = currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="account-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Mi cuenta</h1>
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner">
                    {/* Testing Alert */}
                    <AlertCard
                        type="info"
                        title="Modo demostración"
                        message="Este selector de rol es solo para testing. En producción, el rol se asigna automáticamente según el usuario autenticado."
                    />

                    {/* User Info */}
                    <Card>
                        <CardBody>
                            <div className="account-user-info">
                                <div className="account-avatar" style={{ background: getRoleColor(currentUser.role) }}>
                                    {userInitials}
                                </div>
                                <div className="account-details">
                                    <h2 className="account-name">{currentUser.name}</h2>
                                    <p className="account-email">{currentUser.email}</p>
                                    <span
                                        className="account-role-badge"
                                        style={{
                                            background: `${getRoleColor(currentUser.role)}20`,
                                            color: getRoleColor(currentUser.role),
                                        }}
                                    >
                                        <Shield size={14} />
                                        {getRoleDisplayName(currentUser.role)}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Role Selector */}
                    <Card>
                        <CardHeader
                            title="Cambiar rol (solo testing)"
                            subtitle="Seleccioná un rol para probar diferentes permisos"
                        />
                        <CardBody>
                            <div className="role-selector">
                                {roles.map(({ role, description }) => (
                                    <button
                                        key={role}
                                        className={`role-option ${currentUser.role === role ? 'active' : ''}`}
                                        onClick={() => handleRoleSwitch(role)}
                                    >
                                        <div className="role-option-header">
                                            <User size={20} />
                                            <span className="role-option-name">{getRoleDisplayName(role)}</span>
                                            {currentUser.role === role && (
                                                <span className="role-option-current">Actual</span>
                                            )}
                                        </div>
                                        <p className="role-option-description">{description}</p>
                                    </button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardBody>
                            <div className="account-actions">
                                <Button
                                    variant="secondary"
                                    leftIcon={<Settings size={18} />}
                                    onClick={() => navigate('/configuracion')}
                                >
                                    Ir a configuración
                                </Button>
                                <Button
                                    variant="danger"
                                    leftIcon={<LogOut size={18} />}
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
