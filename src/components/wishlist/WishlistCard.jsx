import React from 'react';
import { formatRupiah } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ExternalLink, PiggyBank, Edit3, Trash2, Gift, Lock, Globe } from 'lucide-react';

export function WishlistCard({ item, onEdit, onDelete, onOpenSaving, onToggleDone }) {
  const { user } = useAuth();

  // Calculations for savings
  const totalSavings = item.savings?.reduce((acc, s) => acc + (s.amount || 0), 0) || 0;
  const targetAmount = item.target_amount || 0;
  const progressPercent = targetAmount > 0 ? Math.min(Math.round((totalSavings / targetAmount) * 100), 100) : 0;
  const isDone = item.status === 'done';
  const isOwner = item.user_id === user?.id;

  const priorityBadges = {
    high: { label: 'Penting', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
    medium: { label: 'Biasa', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
    low: { label: 'Santai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' }
  };

  return (
    <div className={`relative rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder p-4 shadow-sm hover:shadow-md transition-all ${isDone ? 'opacity-75 bg-slate-50 dark:bg-slate-900/40' : ''}`}>
      
      {/* Top Banner: Image & Badges */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-sage-50 dark:bg-slate-800 mb-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-4xl bg-gradient-to-br from-sage-100 to-peach-100 dark:from-slate-800 dark:to-slate-700">
            <span>{item.category?.icon || '🎁'}</span>
          </div>
        )}

        {/* Priority & Privacy Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${priorityBadges[item.priority]?.color || priorityBadges.medium.color}`}>
            {priorityBadges[item.priority]?.label}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/40 text-white backdrop-blur-md flex items-center gap-1">
            {item.is_shared ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {item.is_shared ? 'Bersama' : 'Pribadi'}
          </span>
        </div>

        {/* Done Overlay */}
        {isDone && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            <span>Terlaksana</span>
          </div>
        )}
      </div>

      {/* Item Title & Category */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 flex items-center gap-1">
            {item.category?.icon} {item.category?.name || 'Umum'}
          </span>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1">
            {item.name}
          </h3>
        </div>

        {/* Product URL Button (TikTok/IG/Web) */}
        {item.product_url && (
          <a
            href={item.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-peach-50 dark:bg-peach-950/40 text-peach-600 dark:text-peach-300 hover:bg-peach-100 transition"
            title="Buka Link Produk (TikTok/IG/Web)"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Description & Note */}
      {item.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {item.description}
        </p>
      )}

      {/* Savings Progress Bar (If target_amount exists) */}
      {targetAmount > 0 && (
        <div className="my-3 p-3 rounded-2xl bg-sage-50/70 dark:bg-slate-800/60 border border-sage-100/50 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600 dark:text-slate-300">
              {formatRupiah(totalSavings)} <span className="text-[10px] text-slate-400 font-normal">/ {formatRupiah(targetAmount)}</span>
            </span>
            <span className="text-sage-600 dark:text-sage-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sage-500 to-peach-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Creator & Purchaser Badges */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 mb-3">
        <span>Oleh: <strong className="text-slate-600 dark:text-slate-300">{item.creator?.display_name || 'Pasangan'}</strong></span>
        {isDone && item.purchaser && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Dibeli oleh: <strong>{item.purchaser.display_name}</strong>
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Setor Button */}
        {!isDone && targetAmount > 0 && (
          <button
            onClick={() => onOpenSaving(item)}
            className="flex-1 py-2 px-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Setor
          </button>
        )}

        {/* Toggle Done Button */}
        <button
          onClick={() => onToggleDone(item)}
          className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition ${
            isDone
              ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300'
              : 'bg-peach-500 hover:bg-peach-600 text-white shadow-xs'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          {isDone ? 'Batal Selesai' : 'Tandai Selesai'}
        </button>

        {/* Edit & Delete (If Creator or Shared) */}
        {(isOwner || item.is_shared) && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-xl text-slate-400 hover:text-sage-600 hover:bg-sage-50 dark:hover:bg-slate-800 transition"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
