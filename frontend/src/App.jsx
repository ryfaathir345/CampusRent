// src/App.jsx
// Root component — Router configuration

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import MyItems from './pages/MyItems';
import ItemForm from './pages/ItemForm';
import Transactions from './pages/Transactions';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Wallet from './pages/Wallet';
import AdminLayout from './components/layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminKTMVerification from './pages/admin/AdminKTMVerification';
import AdminFinance from './pages/admin/AdminFinance';
import AdminItemsModeration from './pages/admin/AdminItemsModeration';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReports from './pages/admin/AdminReports';

// ─── Protected Route wrapper ──────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
          <p className="text-gray-400 text-sm font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ─── Admin Route wrapper ──────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN' && user?.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
};

// ─── Guest Route wrapper (redirect if already logged in) ──
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

// ─── App Routes ──────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with MainLayout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/items"
        element={
          <MainLayout>
            <Items />
          </MainLayout>
        }
      />
      <Route
        path="/items/:id"
        element={
          <MainLayout>
            <ItemDetail />
          </MainLayout>
        }
      />

      {/* Protected routes */}
      <Route
        path="/my-items"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyItems />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-items/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ItemForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Transactions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Chat />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Wishlist />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Wallet />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-items/edit/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ItemForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Auth routes — no layout (full-page forms) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* Admin Route */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ktm" element={<AdminKTMVerification />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="items" element={<AdminItemsModeration />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ─── Root App ────────────────────────────────
const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
