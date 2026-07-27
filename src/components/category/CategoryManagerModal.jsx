import React, { useState } from 'react';
import { useCategory } from '../../hooks/useCategory';
import { X, FolderPlus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export function CategoryManagerModal({ isOpen, onClose }) {
  const { categories, addCategory, deleteCategory } = useCategory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [color, setColor] = useState('#7C9A8C');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const popularEmojis = ['🎁', '🚗', '🛍️', '🎬', '📚', '🏠', '✈️', '💻', '🎮', '👗', '☕', '🍔', '💍', '👟'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await addCategory(name, icon, color);
      setName('');
      setIcon('🎁');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-3xl p-6 shadow-2xl border border-sage-100 dark:border-darkBorder my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-sage-500" />
            Kelola Kategori Custom
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Add Custom Category */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 rounded-2xl bg-sage-50/50 dark:bg-slate-800/50 border border-sage-100 dark:border-slate-700">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <FolderPlus className="w-4 h-4 text-sage-500" /> Tambah Kategori Baru
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gadget, Fashion, Buku..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Pilih Emoji
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {popularEmojis.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition ${
                    icon === e ? 'bg-sage-200 dark:bg-sage-900 border border-sage-500 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-xs transition"
          >
            {submitting ? 'Menyimpan...' : '+ Simpan Kategori'}
          </button>
        </form>

        {/* Existing Categories List */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Daftar Kategori</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                  {cat.is_default && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-500 font-medium">Default</span>
                  )}
                </div>
                {!cat.is_default && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
