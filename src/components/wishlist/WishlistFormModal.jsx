import React, { useState, useEffect } from 'react';
import { fetchLinkMetadata } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { X, Sparkles, Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function WishlistFormModal({ isOpen, onClose, onSave, categories = [], initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    target_amount: '',
    priority: 'medium',
    note: '',
    image_url: '',
    product_url: '',
    is_shared: true
  });

  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        description: initialData.description || '',
        target_amount: initialData.target_amount ? String(initialData.target_amount) : '',
        priority: initialData.priority || 'medium',
        note: initialData.note || '',
        image_url: initialData.image_url || '',
        product_url: initialData.product_url || '',
        is_shared: initialData.is_shared !== undefined ? initialData.is_shared : true
      });
    } else {
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        description: '',
        target_amount: '',
        priority: 'medium',
        note: '',
        image_url: '',
        product_url: '',
        is_shared: true
      });
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  // Auto extract metadata ketika menempelkan Link TikTok/IG/Web
  const handleProductUrlChange = async (url) => {
    setFormData(prev => ({ ...prev, product_url: url }));
    if (!url || url.length < 10) return;

    try {
      setExtracting(true);
      const metadata = await fetchLinkMetadata(url);
      if (metadata) {
        setFormData(prev => ({
          ...prev,
          name: prev.name || metadata.title || prev.name,
          image_url: prev.image_url || metadata.imageUrl || prev.image_url,
          description: prev.description || metadata.description || prev.description
        }));
        toast.success('Foto & info produk berhasil ditarik otomatis! ✨');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setExtracting(false);
    }
  };

  // Upload Foto Manual ke Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `wishlist/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wishlist-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('wishlist-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Foto berhasil di-upload!');
    } catch (err) {
      toast.error('Gagal mengupload foto ke Supabase Storage');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama wishlist wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-darkCard rounded-3xl p-6 shadow-2xl border border-sage-100 dark:border-darkBorder my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-peach-500" />
            {initialData ? 'Edit Wishlist' : 'Tambah Wishlist Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Link Produk (TikTok / IG / Shopee / Web) with Auto Extract */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Link Barang / Produk (TikTok, IG, Shopee, Tokopedia, dll)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.product_url}
                onChange={(e) => handleProductUrlChange(e.target.value)}
                placeholder="https://vt.tiktok.com/... atau instagram.com/..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
              />
              {extracting && (
                <Loader2 className="w-4 h-4 text-sage-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <p className="text-[11px] text-sage-600 dark:text-sage-400 mt-1">
              ✨ Tempel link TikTok/IG di atas, foto & info barang akan terisi otomatis!
            </p>
          </div>

          {/* Nama Wishlist */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nama Wishlist *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Sepatu Jordan, Tiket Konser, Liburan Bali"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-sage-500 outline-none"
            />
          </div>

          {/* Kategori & Prioritas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Prioritas
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
              >
                <option value="high">⭐ Penting</option>
                <option value="medium">○ Biasa</option>
                <option value="low">☕ Santai</option>
              </select>
            </div>
          </div>

          {/* Harga Target (Rupiah) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Harga Target (Nominal Rupiah)
            </label>
            <input
              type="number"
              min="0"
              value={formData.target_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
              placeholder="Contoh: 1500000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
            />
          </div>

          {/* Deskripsi & Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Deskripsi & Catatan Tambahan
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Catatan ukuran, warna, atau tempat beli..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sage-500 outline-none"
            />
          </div>

          {/* Upload / Preview Foto */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Foto Barang
            </label>
            
            {formData.image_url ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white shadow-md hover:bg-rose-600 transition text-xs font-bold"
                >
                  Hapus Foto
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-sage-500 transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {uploading ? 'Mengupload...' : 'Upload Foto Baru'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Maks 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Privasi (Pribadi / Bersama Toggle) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Privasi Wishlist
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_shared: true }))}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  formData.is_shared
                    ? 'bg-sage-500 text-white border-sage-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌐 Wishlist Bersama
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_shared: false }))}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  !formData.is_shared
                    ? 'bg-sage-500 text-white border-sage-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                🔒 Wishlist Pribadi
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sage-500 to-peach-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Wishlist'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
