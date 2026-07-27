import React, { useState, useEffect } from 'react';
import { useSaving } from '../../hooks/useSaving';
import { formatRupiah, formatDate } from '../../lib/utils';
import { X, PiggyBank, Plus, Trash2, History, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function SavingModal({ isOpen, onClose, wishlist, onSavingAdded }) {
  const { addSaving, fetchSavingsByWishlist, deleteSaving, savingsHistory } = useSaving();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (wishlist?.id && isOpen) {
      fetchSavingsByWishlist(wishlist.id);
    }
  }, [wishlist, isOpen, fetchSavingsByWishlist]);

  if (!isOpen || !wishlist) return null;

  const totalSaved = savingsHistory.reduce((acc, s) => acc + (s.amount || 0), 0);
  const target = wishlist.target_amount || 0;
  const remaining = Math.max(0, target - totalSaved);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Masukkan nominal setoran yang valid');
      return;
    }

    try {
      setSubmitting(true);
      await addSaving(wishlist.id, amount, note);
      setAmount('');
      setNote('');
      await fetchSavingsByWishlist(wishlist.id);
      if (onSavingAdded) onSavingAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (savingId) => {
    if (confirm('Hapus riwayat setoran ini?')) {
      await deleteSaving(savingId, wishlist.id);
      if (onSavingAdded) onSavingAdded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-3xl p-6 shadow-2xl border border-sage-100 dark:border-darkBorder my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-slate-800 flex items-center justify-center text-sage-600 dark:text-sage-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Setor Tabungan</h2>
              <p className="text-[11px] text-slate-500 line-clamp-1">{wishlist.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Card */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-sage-50 to-peach-50 dark:from-slate-800 dark:to-slate-800/60 border border-sage-100 dark:border-slate-700">
          <div className="grid grid-cols-3 text-center gap-2">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Target</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatRupiah(target)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Terkumpul</p>
              <p className="text-xs font-bold text-sage-600 dark:text-sage-400">{formatRupiah(totalSaved)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Sisa</p>
              <p className="text-xs font-bold text-peach-600 dark:text-peach-400">{formatRupiah(remaining)}</p>
            </div>
          </div>
        </div>

        {/* Form Setor Baru */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nominal Setoran (Rp) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 50000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-sage-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Catatan Setoran (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Misal: Sisa uang jajan, Gaji bulan ini..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Menyimpan...' : 'Tambah Setoran'}
          </button>
        </form>

        {/* History List */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-sage-500" />
            Riwayat Setoran ({savingsHistory.length})
          </h3>

          {savingsHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400 italic">Belum ada riwayat setoran</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savingsHistory.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatRupiah(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.user?.display_name || 'Pasangan'} {item.note ? `("${item.note}")` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
