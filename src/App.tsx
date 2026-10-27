import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Common Layout
import { AppLayout } from './components/layout/AppLayout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Farmer Portal Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { MyCrops } from './pages/farmer/MyCrops';
import { AddCrop } from './pages/farmer/AddCrop';
import { CropRecommendations } from './pages/farmer/CropRecommendations';
import { WeatherInfo } from './pages/farmer/WeatherInfo';
import { FarmerOrders } from './pages/farmer/FarmerOrders';
import { FarmerNotifications } from './pages/farmer/FarmerNotifications';
import { FarmerSettings } from './pages/farmer/FarmerSettings';

// Buyer Portal Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BrowseProducts } from './pages/buyer/BrowseProducts';
import { CartPage } from './pages/buyer/CartPage';
import { CheckoutPage } from './pages/buyer/CheckoutPage';
import { MyOrders } from './pages/buyer/MyOrders';
import { OrderTracking } from './pages/buyer/OrderTracking';
import { BuyerProfile } from './pages/buyer/BuyerProfile';
import { BuyerNotifications } from './pages/buyer/BuyerNotifications';
import { BuyerSettings } from './pages/buyer/BuyerSettings';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageFarmers } from './pages/admin/ManageFarmers';
import { ManageBuyers } from './pages/admin/ManageBuyers';
import { ManageCrops } from './pages/admin/ManageCrops';
import { ManageOrders } from './pages/admin/ManageOrders';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProfile } from './pages/admin/AdminProfile';

import { LanguageProvider } from './context/LanguageContext';
import { AIChatbotPage } from './pages/common/AIChatbotPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Layout with Shared Header, Sidebar & Footer */}
      <Route element={<AppLayout />}>
        {/* Farmer Portal (Farmer Role Only) */}
        <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
          <Route path="/farmer/crops" element={<MyCrops />} />
          <Route path="/farmer/add-crop" element={<AddCrop />} />
          <Route path="/farmer/recommendations" element={<CropRecommendations />} />
          <Route path="/farmer/weather" element={<WeatherInfo />} />
          <Route path="/farmer/chatbot" element={<AIChatbotPage />} />
          <Route path="/farmer/orders" element={<FarmerOrders />} />
          <Route path="/farmer/notifications" element={<FarmerNotifications />} />
          <Route path="/farmer/settings" element={<FarmerSettings />} />
        </Route>

        {/* Buyer Portal (Buyer Role Only) */}
        <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/browse" element={<BrowseProducts />} />
          <Route path="/buyer/cart" element={<CartPage />} />
          <Route path="/buyer/checkout" element={<CheckoutPage />} />
          <Route path="/buyer/orders" element={<MyOrders />} />
          <Route path="/buyer/track/:id" element={<OrderTracking />} />
          <Route path="/buyer/track" element={<Navigate to="/buyer/orders" replace />} />
          <Route path="/buyer/chatbot" element={<AIChatbotPage />} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />
          <Route path="/buyer/notifications" element={<BuyerNotifications />} />
          <Route path="/buyer/settings" element={<BuyerSettings />} />
        </Route>

        {/* Admin Portal (Admin Role Only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/farmers" element={<ManageFarmers />} />
          <Route path="/admin/buyers" element={<ManageBuyers />} />
          <Route path="/admin/crops" element={<ManageCrops />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/payments" element={<PaymentsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/chatbot" element={<AIChatbotPage />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
