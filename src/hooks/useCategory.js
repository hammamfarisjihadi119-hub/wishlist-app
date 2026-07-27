import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useCategory() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('[useCategory] Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Tambah Kategori Custom
  const addCategory = async (name, icon = '📌', color = '#7C9A8C') => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          user_id: user.id,
          name: name.trim(),
          icon: icon || '📌',
          color: color || '#7C9A8C',
          is_default: false
        }])
        .select();

      if (error) throw error;
      toast.success('Kategori baru berhasil ditambahkan! 📁');
      await fetchCategories();
      return data[0];
    } catch (err) {
      toast.error('Gagal menambahkan kategori');
      throw err;
    }
  };

  // Hapus Kategori Custom
  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('is_default', false);

      if (error) throw error;
      toast.success('Kategori berhasil dihapus');
      await fetchCategories();
    } catch (err) {
      toast.error('Gagal menghapus kategori');
    }
  };

  return {
    categories,
    loading,
    refetch: fetchCategories,
    addCategory,
    deleteCategory
  };
}
