// ================================
// SETTINGS PAGE
// Sistema de Gestión Comercial
// ================================

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Card, CardHeader, CardBody, Button, Input, Toggle as ToggleInput } from '../../components/ui';
import './SettingsPage.css';

export function SettingsPage() {
    const { businessConfig, updateBusinessConfig } = useAuth();
    const { showToast } = useUI();

    // Local state for form
    const [formData, setFormData] = useState({
        businessName: businessConfig.businessName,
        businessPhone: businessConfig.businessPhone || '',
        businessEmail: businessConfig.businessEmail || '',
        businessAddress: businessConfig.businessAddress || '',
    });

    const handleSaveBusinessInfo = () => {
        updateBusinessConfig({
            businessName: formData.businessName,
            businessPhone: formData.businessPhone || undefined,
            businessEmail: formData.businessEmail || undefined,
            businessAddress: formData.businessAddress || undefined,
        });
        showToast('success', 'Información del negocio actualizada');
    };

    const handleToggle = (key: keyof typeof businessConfig, value: boolean) => {
        updateBusinessConfig({ [key]: value });
        showToast('success', 'Configuración actualizada');
    };

    return (
        <div className="settings-page">
            <header className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">Configuración</h1>
                    </div>
                </div>
            </header>

            <div className="page-content">
                <div className="page-content-inner settings-grid">
                    {/* Business Info */}
                    <Card>
                        <CardHeader
                            title="Información del negocio"
                            subtitle="Datos que aparecerán en reportes y comprobantes"
                        />
                        <CardBody>
                            <div className="settings-form">
                                <Input
                                    label="Nombre comercial"
                                    value={formData.businessName}
                                    onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                                    placeholder="Mi Comercio"
                                />
                                <Input
                                    label="Teléfono"
                                    value={formData.businessPhone}
                                    onChange={e => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                                    placeholder="+54 11 1234-5678"
                                    isOptional
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={e => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                                    placeholder="contacto@negocio.com"
                                    isOptional
                                />
                                <Input
                                    label="Dirección"
                                    value={formData.businessAddress}
                                    onChange={e => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                                    placeholder="Av. Corrientes 1234, CABA"
                                    isOptional
                                />
                                <Button
                                    variant="primary"
                                    leftIcon={<Save size={18} />}
                                    onClick={handleSaveBusinessInfo}
                                >
                                    Guardar cambios
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Operational Settings */}
                    <Card>
                        <CardHeader
                            title="Configuración operativa"
                            subtitle="Opciones que afectan el comportamiento del sistema"
                        />
                        <CardBody>
                            <div className="settings-toggles">
                                <ToggleInput
                                    label="Caja obligatoria para vender"
                                    description="Si está activo, no se puede vender sin tener la caja abierta"
                                    checked={businessConfig.requireCashRegisterForSales}
                                    onChange={value => handleToggle('requireCashRegisterForSales', value)}
                                />

                                <ToggleInput
                                    label="Permitir venta sin stock"
                                    description="Si está activo, se puede vender aunque no haya stock (advertirá pero permitirá)"
                                    checked={businessConfig.allowNegativeStock}
                                    onChange={value => handleToggle('allowNegativeStock', value)}
                                />

                                <ToggleInput
                                    label="Permitir pago mayor a deuda (saldo a favor)"
                                    description="Si está activo, el cliente puede pagar más de lo que debe"
                                    checked={businessConfig.allowCreditOverpayment}
                                    onChange={value => handleToggle('allowCreditOverpayment', value)}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Employee Permissions */}
                    <Card>
                        <CardHeader
                            title="Permisos de empleados"
                            subtitle="Configura lo que los empleados pueden hacer"
                        />
                        <CardBody>
                            <div className="settings-toggles">
                                <ToggleInput
                                    label="Empleado puede editar precios en venta"
                                    description="Permite modificar el precio de un producto al agregar al carrito"
                                    checked={businessConfig.employeeCanEditPrices}
                                    onChange={value => handleToggle('employeeCanEditPrices', value)}
                                />

                                <ToggleInput
                                    label="Empleado puede ajustar stock"
                                    description="Permite hacer ajustes manuales de inventario"
                                    checked={businessConfig.employeeCanAdjustStock}
                                    onChange={value => handleToggle('employeeCanAdjustStock', value)}
                                />

                                <ToggleInput
                                    label="Mostrar costos a empleados"
                                    description="Los empleados verán la columna de costo en productos"
                                    checked={businessConfig.showCostsToEmployee}
                                    onChange={value => handleToggle('showCostsToEmployee', value)}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Accountant Permissions */}
                    <Card>
                        <CardHeader
                            title="Permisos de contadora"
                            subtitle="Configura lo que la contadora puede ver"
                        />
                        <CardBody>
                            <div className="settings-toggles">
                                <ToggleInput
                                    label="Mostrar costos a contadora"
                                    description="La contadora verá la columna de costo en productos"
                                    checked={businessConfig.showCostsToAccountant}
                                    onChange={value => handleToggle('showCostsToAccountant', value)}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
