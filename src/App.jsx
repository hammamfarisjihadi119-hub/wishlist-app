import React, { Component } from 'react';
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
import { isSupabaseConfigured } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Error Boundary Component untuk menangkap runtime error & mencegah layar putih
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-warmBg dark:bg-darkBg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Terjadi Kesalahan Aplikasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
            {this.state.error?.message || 'Gagal memuat komponen aplikasi. Silakan muat ulang halaman.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-2xl bg-sage-500 text-white font-bold text-xs shadow-md hover:bg-sage-600 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-warmBg dark:bg-darkBg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          Koneksi Supabase Belum Dikonfigurasi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
          Pastikan kamu sudah memasukkan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> di file <code>.env.local</code> (lokal) atau di menu Environment Variables Vercel.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-sage-500 text-white font-bold text-xs shadow-xs"
        >
          Muat Ulang
        </button>
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
