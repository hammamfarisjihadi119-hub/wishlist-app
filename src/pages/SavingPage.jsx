import React, { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { formatRupiah } from '../lib/utils';
import { SavingModal } from '../components/saving/SavingModal';
import { PiggyBank, Target, TrendingUp, Sparkles } from 'lucide-react';

export function SavingPage() {
  const { items, loading, refetch } = useWishlist();
  const [selectedSavingItem, setSelectedSavingItem] = useState(null);

  // Filter items with target_amount > 0 and status pending
  const savingItems = items.filter(i => (i.target_amount || 0) > 0 && i.status !== 'done');

  const totalTarget = savingItems.reduce((acc, i) => acc + (i.target_amount || 0), 0);
  const totalSavings = savingItems.reduce((acc, i) => {
    const itemSaved = i.savings?.reduce((sAcc, s) => sAcc + (s.amount || 0), 0) || 0;
    return acc + itemSaved;
  }, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSavings);
  const overallPercent = totalTarget > 0 ? Math.min(Math.round((totalSavings / totalTarget) * 100), 100) : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          💰 Ringkasan Tabungan Bersama
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pantau progres tabungan impian kamu dan pasangan
        </p>
      </div>

      {/* Main Stats Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-sage-500 to-peach-500 text-white shadow-xl shadow-sage-500/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-1">
            <PiggyBank className="w-3.5 h-3.5" /> Total Progres Bersama
          </span>
          <span className="text-2xl font-black">{overallPercent}%</span>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/30 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/20">
          <div>
            <p className="text-[10px] text-white/80">Total Target</p>
            <p className="text-xs font-extrabold">{formatRupiah(totalTarget)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/80">Terkumpul</p>
            <p className="text-xs font-extrabold text-emerald-200">{formatRupiah(totalSavings)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/80">Sisa Target</p>
            <p className="text-xs font-extrabold text-amber-200">{formatRupiah(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Progress per Wishlist */}
      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          📊 Progres per Wishlist ({savingItems.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat tabungan...</div>
        ) : savingItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder text-center">
            <p className="text-3xl mb-2">🐖</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada target tabungan</p>
            <p className="text-[11px] text-slate-400 mt-1">Tambah harga target pada wishlist untuk mulai menabung!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savingItems.map((item) => {
              const itemSaved = item.savings?.reduce((acc, s) => acc + (s.amount || 0), 0) || 0;
              const itemTarget = item.target_amount || 0;
              const percent = itemTarget > 0 ? Math.min(Math.round((itemSaved / itemTarget) * 100), 100) : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.category?.icon || '🎁'}</span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{item.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          {formatRupiah(itemSaved)} / {formatRupiah(itemTarget)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSavingItem(item)}
                      className="py-1.5 px-3 rounded-xl bg-sage-500 text-white font-bold text-xs shadow-xs hover:bg-sage-600 transition"
                    >
                      + Setor
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sage-500 to-peach-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>{percent}% Terkumpul</span>
                    <span>Sisa: {formatRupiah(Math.max(0, itemTarget - itemSaved))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SavingModal
        isOpen={!!selectedSavingItem}
        onClose={() => setSelectedSavingItem(null)}
        wishlist={selectedSavingItem}
        onSavingAdded={refetch}
      />

    </div>
  );
}
