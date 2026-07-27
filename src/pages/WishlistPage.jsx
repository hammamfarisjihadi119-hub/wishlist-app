import React, { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useCategory } from '../hooks/useCategory';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { WishlistFormModal } from '../components/wishlist/WishlistFormModal';
import { SavingModal } from '../components/saving/SavingModal';
import { CategoryManagerModal } from '../components/category/CategoryManagerModal';
import { Search, Plus, Tag, Sparkles, Filter } from 'lucide-react';

export function WishlistPage() {
  const { items, loading, addWishlist, updateWishlist, toggleDoneStatus, deleteWishlist, refetch } = useWishlist();
  const { categories } = useCategory();

  const [activeTab, setActiveTab] = useState('active'); // 'active', 'done', 'shared'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItem, setSavingItem] = useState(null);

  // Filter items based on tab, category, and search query
  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === 'active' && item.status === 'done') return false;
    if (activeTab === 'done' && item.status !== 'done') return false;
    if (activeTab === 'shared' && (!item.is_shared || item.status === 'done')) return false;

    // Category filter
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category?.name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

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
    <div className="space-y-5 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📋 Semua Wishlist
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar keinginan pribadi & bersama pasangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white dark:bg-darkCard border border-sage-200 dark:border-darkBorder text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
            title="Kelola Kategori Custom"
          >
            <Tag className="w-4 h-4 text-sage-600" />
          </button>
          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="px-3.5 py-2.5 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Wishlist</span>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'active'
              ? 'bg-white dark:bg-darkCard text-sage-600 dark:text-sage-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          🔵 Aktif ({items.filter(i => i.status !== 'done').length})
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'done'
              ? 'bg-white dark:bg-darkCard text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          ✅ Terlaksana ({items.filter(i => i.status === 'done').length})
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'shared'
              ? 'bg-white dark:bg-darkCard text-peach-600 dark:text-peach-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          👥 Bersama ({items.filter(i => i.is_shared && i.status !== 'done').length})
        </button>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari wishlist (nama, deskripsi...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder text-xs font-medium focus:ring-2 focus:ring-sage-500 outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-sage-500 text-white shadow-xs'
                : 'bg-white dark:bg-darkCard text-slate-600 dark:text-slate-300 border border-sage-100 dark:border-darkBorder'
            }`}
          >
            📂 Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-sage-500 text-white shadow-xs'
                  : 'bg-white dark:bg-darkCard text-slate-600 dark:text-slate-300 border border-sage-100 dark:border-darkBorder'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wishlist Items Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Memuat wishlist...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-sage-100 dark:border-darkBorder text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak ada wishlist ditemukan</p>
          <p className="text-[11px] text-slate-400 mt-1">Coba ubah kata kunci pencarian atau kategori filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
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

      {/* Modals */}
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

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

    </div>
  );
}
