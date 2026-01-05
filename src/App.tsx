// ================================
// MAIN APP COMPONENT
// Sistema de Gestión Comercial
// ================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { MainLayout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { AccountPage } from './pages/Account';
import { POSPage } from './pages/POS';
import { CashRegisterPage } from './pages/CashRegister';
import { ProductsPage } from './pages/Products';
import { SettingsPage } from './pages/Settings';
import { ClientsPage } from './pages/Clients';
import { ExportsPage } from './pages/Exports';
import {
  ReportsPage,
  UsersPage,
  LoginPage,
} from './pages/Placeholder';

import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Routes>
            {/* Auth routes (outside layout) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Main app routes (with layout) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/caja" element={<CashRegisterPage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/reportes" element={<ReportsPage />} />
              <Route path="/exportaciones" element={<ExportsPage />} />
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/configuracion" element={<SettingsPage />} />
              <Route path="/cuenta" element={<AccountPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
