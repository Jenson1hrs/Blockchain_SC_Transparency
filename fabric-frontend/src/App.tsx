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
import ManufacturerProductsPage from './pages/ManufacturerProductsPage';
import ManufacturerComplaintsPage from './pages/ManufacturerComplaintsPage';
import MyProductReportsPage from './pages/MyProductReportsPage';
import AssignedProductsPage from './pages/AssignedProductsPage';
import OrganizationProfile from './pages/OrganizationProfile';
import OrganizationManagement from './pages/OrganizationManagement';
import RegulatorProductsPage from './pages/RegulatorProductsPage';
import RegulatorTransparencyPage from './pages/RegulatorTransparencyPage';
import NotificationsPage from './pages/NotificationsPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import type { UserRole } from './types';
import './index.css';

const ALL_ROLES: UserRole[] = ['admin', 'manufacturer', 'distributor', 'retailer', 'consumer', 'regulator'];
const REGULATOR_ONLY: UserRole[] = ['regulator'];
const ADMIN_ONLY: UserRole[] = ['admin'];
const INVENTORY_ROLES: UserRole[] = ['consumer'];
const EXPIRING_ROLES: UserRole[] = [
  'admin',
  'manufacturer',
  'distributor',
  'retailer',
  'consumer',
  'regulator',
];
const CREATE_ROLES: UserRole[] = ['admin', 'manufacturer'];
const MANUFACTURER_ONLY: UserRole[] = ['manufacturer'];
const TRANSFER_ROLES: UserRole[] = ['admin', 'manufacturer', 'distributor', 'retailer'];
const LOCATION_ROLES: UserRole[] = ['admin', 'distributor', 'retailer'];
const ASSIGNED_ROLES: UserRole[] = ['distributor', 'retailer'];
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyProduct />} />
        <Route path="/verify-product" element={<VerifyProduct />} />
        <Route path="/organization/:userId" element={<OrganizationProfile />} />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expiring"
          element={
            <ProtectedRoute allowedRoles={EXPIRING_ROLES}>
              <ExpiringProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-products"
          element={
            <ProtectedRoute allowedRoles={MANUFACTURER_ONLY}>
              <ManufacturerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/complaints"
          element={
            <ProtectedRoute allowedRoles={MANUFACTURER_ONLY}>
              <ManufacturerComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <MyProductReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assigned-products"
          element={
            <ProtectedRoute allowedRoles={ASSIGNED_ROLES}>
              <AssignedProductsPage />
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
            <ProtectedRoute allowedRoles={TRANSFER_ROLES}>
              <TransferProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/requests"
          element={
            <ProtectedRoute allowedRoles={TRANSFER_ROLES}>
              <TransferProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location"
          element={
            <ProtectedRoute allowedRoles={LOCATION_ROLES}>
              <UpdateLocation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/regulator/organizations"
          element={
            <ProtectedRoute allowedRoles={REGULATOR_ONLY}>
              <OrganizationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulator/products"
          element={
            <ProtectedRoute allowedRoles={REGULATOR_ONLY}>
              <RegulatorProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulator/transparency"
          element={
            <ProtectedRoute allowedRoles={REGULATOR_ONLY}>
              <RegulatorTransparencyPage />
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
