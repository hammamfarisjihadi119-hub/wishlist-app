import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import { User, Sun, Moon, Download, Smartphone, Heart, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { profile, updateProfile, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { items } = useWishlist();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  // Tangkap event PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast('Aplikasi sudah terinstall atau gunakan menu "Add to Home Screen" di browsermu! 📲', { icon: 'ℹ️' });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('Aplikasi berhasil diinstall!');
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    await updateProfile(displayName.trim());
    setIsEditing(false);
  };

  // Export Wishlist Data as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wishlist_kami_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Data wishlist diexport ke JSON! 📥');
  };

  // Export Wishlist Data as CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error('Tidak ada data wishlist untuk diexport');
      return;
    }

    const headers = ["Nama Wishlist", "Kategori", "Deskripsi", "Harga Target", "Prioritas", "Status", "Privasi", "Link Produk"];
    const rows = items.map(i => [
      `"${i.name || ''}"`,
      `"${i.category?.name || ''}"`,
      `"${i.description || ''}"`,
      i.target_amount || 0,
      i.priority || 'medium',
      i.status || 'pending',
      i.is_shared ? 'Bersama' : 'Pribadi',
      `"${i.product_url || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wishlist_kami_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Data wishlist diexport ke CSV! 📥');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          ⚙️ Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kelola profil, tampilan, dan install aplikasi PWA
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-sage-500" /> Profil Saya
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Username (ID Login)</label>
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              @{profile?.username || 'user'}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Panggilan</label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-sage-500 outline-none"
                />
                <button
                  onClick={handleSaveProfile}
                  className="p-2.5 rounded-2xl bg-sage-500 text-white font-bold text-xs"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold">
                <span>{profile?.display_name || 'Kamu'}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sage-600 dark:text-sage-400 flex items-center gap-1 text-[11px] hover:underline"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Ubah
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          🎨 Tema & Tampilan
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Mode Gelap (Dark Mode)</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-sage-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* PWA Install Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-sage-500 to-peach-400 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <h3 className="font-bold text-xs">Install Aplikasi di HP (PWA)</h3>
        </div>
        <p className="text-xs text-white/90 leading-relaxed">
          Nikmati tampilan fullscreen seperti aplikasi native HP dan akses data offline!
        </p>

        <button
          onClick={handleInstallPWA}
          className="w-full py-2.5 rounded-2xl bg-white text-sage-700 font-bold text-xs shadow-md hover:bg-slate-50 transition"
        >
          📲 Install Aplikasi ke Home Screen
        </button>
      </div>

      {/* Export Data */}
      <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Download className="w-4 h-4 text-sage-500" /> Export Data Wishlist
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            📥 Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* About Section & Logout */}
      <div className="text-center space-y-3 pt-2">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> untuk kamu & pacar (v1.0.0 PWA)
        </p>
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition"
        >
          Keluar dari Akun
        </button>
      </div>

    </div>
  );
}
