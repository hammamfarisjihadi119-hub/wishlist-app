import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Sun, Moon, LogOut, Wifi, WifiOff } from 'lucide-react';

export function Navbar() {
  const { profile, partnerProfile, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-sage-200/50 dark:border-darkBorder transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sage-500 to-peach-400 flex items-center justify-center shadow-md shadow-sage-500/20 text-white font-bold">
            <Heart className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-sage-600 to-peach-500 bg-clip-text text-transparent">
              Wishlist Kami
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {profile?.display_name || 'Kamu'} {partnerProfile ? `❤️ ${partnerProfile.display_name}` : ''}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Online / Offline Badge */}
          <div title={isOnline ? 'Terhubung' : 'Offline'} className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-sage-50 dark:bg-slate-800 text-sage-700 dark:text-amber-300 hover:bg-sage-100 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
