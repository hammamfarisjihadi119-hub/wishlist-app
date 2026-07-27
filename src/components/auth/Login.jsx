import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Heart, Lock, User, Sparkles, UserPlus, LogIn } from 'lucide-react';

export function Login() {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    if (isRegister && !displayName) return;

    try {
      setSubmitting(true);
      if (isRegister) {
        await signup(username, displayName, password);
        setIsRegister(false);
      } else {
        await login(username, password);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 via-warmBg to-peach-50 dark:from-darkBg dark:via-darkCard dark:to-darkBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl border border-sage-100 dark:border-darkBorder rounded-3xl p-8 shadow-xl shadow-sage-500/10">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sage-500 to-peach-400 mx-auto flex items-center justify-center shadow-lg shadow-sage-500/30 text-white mb-4">
            <Heart className="w-8 h-8 fill-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-sage-600 to-peach-500 bg-clip-text text-transparent">
            Wishlist Kami ❤️
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Catat keinginan & tabung impian bersama pasangan
          </p>
        </div>

        {/* Closed Registration Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-sage-50 dark:bg-slate-800/60 border border-sage-200/60 dark:border-slate-700 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-sage-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Aplikasi ini dibuat khusus untuk <strong>2 Akun (Kamu & Pacar)</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: kamu / pacar"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm font-medium transition"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Nama Panggilan
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama panggilan sayang"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm font-medium transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm font-medium transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sage-500 to-peach-500 text-white font-bold text-sm shadow-lg shadow-sage-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Daftar Akun Baru
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-sage-600 dark:text-sage-400 hover:underline"
          >
            {isRegister
              ? 'Sudah punya akun? Masuk di sini'
              : 'Belum punya akun? Daftar di sini'}
          </button>
        </div>

      </div>
    </div>
  );
}
