import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VerifyProduct from './pages/VerifyProduct';
import QRVerifyPage from './pages/QRVerifyPage';
import LandingPage from './pages/LandingPage';
import CreateProduct from './pages/CreateProduct';
import TransferProduct from './pages/TransferProduct';
import UpdateLocation from './pages/UpdateLocation';
import ProductQr from './pages/ProductQr';
import ExpiringProducts from './pages/ExpiringProducts';
import InventoryPage from './pages/InventoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import type { UserRole } from './types';
import './index.css';

const ALL_ROLES: UserRole[] = ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer'];
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
        <Route path="/dashboard" element={<LandingPage />} />
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
