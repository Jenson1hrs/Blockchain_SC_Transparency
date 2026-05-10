import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VerifyProduct from './pages/VerifyProduct';
import QRVerifyPage from './pages/QRVerifyPage';
import LandingPage from './pages/LandingPage';
import WorkspaceHome from './pages/WorkspaceHome';
import CreateProduct from './pages/CreateProduct';
import TransferProduct from './pages/TransferProduct';
import UpdateLocation from './pages/UpdateLocation';
import ProductQr from './pages/ProductQr';
import ExpiringProducts from './pages/ExpiringProducts';
import InventoryPage from './pages/InventoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSystemPage from './pages/AdminSystemPage';
import AdminAuditPage from './pages/AdminAuditPage';
import AdminConfigPage from './pages/AdminConfigPage';
import ProtectedRoute from './components/ProtectedRoute';
import type { UserRole } from './types';
import './index.css';

const ALL_ROLES: UserRole[] = ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer'];
const ADMIN_ONLY: UserRole[] = ['admin'];
const INVENTORY_ROLES: UserRole[] = ['admin', 'consumer'];
const CREATE_ROLES: UserRole[] = ['admin', 'manufacturer'];
const MOVE_ROLES: UserRole[] = ['admin', 'distributor', 'retailer'];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyProduct />} />
        <Route path="/verify-product" element={<VerifyProduct />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <WorkspaceHome />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <AdminSystemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <AdminAuditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/config"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <AdminConfigPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiring"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <ExpiringProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_ROLES}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={CREATE_ROLES}>
              <CreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute allowedRoles={MOVE_ROLES}>
              <TransferProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location"
          element={
            <ProtectedRoute allowedRoles={MOVE_ROLES}>
              <UpdateLocation />
            </ProtectedRoute>
          }
        />

        <Route path="/qr/:productId" element={<ProductQr />} />
        <Route path="/verify/:productId" element={<QRVerifyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
