import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Heart, PiggyBank, Users, Settings } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Beranda' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/savings', icon: PiggyBank, label: 'Tabungan' },
    { to: '/partner', icon: Users, label: 'Aktivitas' },
    { to: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-darkCard/90 backdrop-blur-lg border-t border-sage-200/50 dark:border-darkBorder transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
                  isActive
                    ? 'text-sage-600 dark:text-sage-400 font-bold bg-sage-50 dark:bg-slate-800 scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
