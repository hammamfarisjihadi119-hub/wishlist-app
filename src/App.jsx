import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Login } from './components/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { WishlistPage } from './pages/WishlistPage';
import { SavingPage } from './pages/SavingPage';
import { PartnerPage } from './pages/PartnerPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-warmBg dark:bg-darkBg flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-sage-600 dark:text-sage-400">Memuat Wishlist Kami...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-warmBg dark:bg-darkBg text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/savings" element={<SavingPage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '16px',
                background: '#2D2D3F',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600'
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
