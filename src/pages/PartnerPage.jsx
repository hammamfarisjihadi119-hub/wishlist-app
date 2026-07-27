import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { Heart, Activity, User, Bell, Sparkles } from 'lucide-react';

export function PartnerPage() {
  const { profile, partnerProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('[PartnerPage] Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Couple Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-peach-400 via-peach-500 to-sage-500 text-white shadow-xl shadow-peach-500/20 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black">
            {profile?.display_name?.charAt(0).toUpperCase() || 'K'}
          </div>

          <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-md animate-pulse">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black">
            {partnerProfile?.display_name?.charAt(0).toUpperCase() || 'P'}
          </div>
        </div>

        <h2 className="text-xl font-black tracking-tight">
          {profile?.display_name || 'Kamu'} & {partnerProfile?.display_name || 'Pacar'}
        </h2>
        <p className="text-xs text-white/90 mt-1">
          {partnerProfile ? 'Akun saling terhubung' : 'Menunggu pasangan mendaftar'}
        </p>
      </div>

      {/* Activity Log */}
      <div>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sage-500" />
          Aktivitas & Pemberitahuan Real-time
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat aktivitas...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada aktivitas terbaru</p>
            <p className="text-[11px] text-slate-400 mt-1">Setiap penambahan wishlist dan setoran tabungan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-sage-50 dark:bg-slate-800 text-sage-600 dark:text-sage-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
