import React, { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { WishlistFormModal } from '../components/wishlist/WishlistFormModal';
import { SavingModal } from '../components/saving/SavingModal';
import { useCategory } from '../hooks/useCategory';
import { formatRupiah } from '../lib/utils';
import { Heart, Target, PiggyBank, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { items, loading, addWishlist, updateWishlist, toggleDoneStatus, deleteWishlist, refetch } = useWishlist();
  const { profile, partnerProfile } = useAuth();
  const { categories } = useCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItem, setSavingItem] = useState(null);

  // Summary stats
  const totalItems = items.length;
  const activeItems = items.filter(i => i.status !== 'done');
  const doneItems = items.filter(i => i.status === 'done');
  
  const totalTarget = activeItems.reduce((acc, i) => acc + (i.target_amount || 0), 0);
  const totalSavings = activeItems.reduce((acc, i) => {
    const itemSaved = i.savings?.reduce((sAcc, s) => sAcc + (s.amount || 0), 0) || 0;
    return acc + itemSaved;
  }, 0);

  const latestItems = activeItems.slice(0, 4);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSaveWishlist = async (formData) => {
    if (editingItem) {
      await updateWishlist(editingItem.id, formData);
    } else {
      await addWishlist(formData);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sage-500 via-sage-600 to-peach-500 text-white shadow-xl shadow-sage-500/20 relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] text-white/10 pointer-events-none">
          <Heart className="w-48 h-48 fill-white" />
        </div>
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Wishlist Berdua
          </span>
          <h2 className="text-2xl font-black tracking-tight">
            Halo, {profile?.display_name || 'Kamu'}! ❤️
          </h2>
          <p className="text-xs text-white/90 mt-1 max-w-xs leading-relaxed">
            {partnerProfile
              ? `Bersama ${partnerProfile.display_name}, yuk wujudkan impian kalian satu per satu!`
              : 'Pilih dan tabung wishlist impianmu bareng pasangan!'}
          </p>

          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="mt-4 px-4 py-2.5 rounded-2xl bg-white text-sage-700 font-bold text-xs shadow-md hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-sage-600" />
            Tambah Wishlist Baru
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-slate-800 text-sage-600 dark:text-sage-400 flex items-center justify-center mb-2">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Wishlist</p>
          <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalItems}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Target</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{formatRupiah(totalTarget)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-peach-100 dark:bg-slate-800 text-peach-600 dark:text-peach-400 flex items-center justify-center mb-2">
            <PiggyBank className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Terkumpul</p>
          <p className="text-xs font-bold text-sage-600 dark:text-sage-400 truncate">{formatRupiah(totalSavings)}</p>
        </div>
      </div>

      {/* Latest Wishlists Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📌 Wishlist Terbaru
          </h3>
          <Link to="/wishlist" className="text-xs font-bold text-sage-600 dark:text-sage-400 flex items-center gap-1 hover:underline">
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Memuat wishlist...</div>
        ) : latestItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder text-center">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada wishlist aktif</p>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">Mulai catat barang atau kegiatan impianmu bareng pasangan!</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-xl bg-sage-500 text-white font-bold text-xs shadow-md"
            >
              + Tambah Wishlist Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {latestItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onEdit={handleOpenEdit}
                onDelete={deleteWishlist}
                onOpenSaving={(item) => setSavingItem(item)}
                onToggleDone={toggleDoneStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form & Savings Modals */}
      <WishlistFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveWishlist}
        categories={categories}
        initialData={editingItem}
      />

      <SavingModal
        isOpen={!!savingItem}
        onClose={() => setSavingItem(null)}
        wishlist={savingItem}
        onSavingAdded={refetch}
      />

    </div>
  );
}
