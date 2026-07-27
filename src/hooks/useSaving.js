import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useSaving() {
  const { user, profile } = useAuth();
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Setor Tabungan ke Wishlist
  const addSaving = async (wishlistId, amount, note = '') => {
    if (!user) return;
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Nominal setoran tidak valid');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('savings')
        .insert([{
          wishlist_id: wishlistId,
          user_id: user.id,
          amount: numAmount,
          note: note.trim() || null
        }])
        .select();

      if (error) throw error;
      toast.success('Setoran berhasil ditambahkan! 💰');

      // Ambil nama wishlist untuk notifikasi
      const { data: item } = await supabase
        .from('wishlist_items')
        .select('name')
        .eq('id', wishlistId)
        .single();

      if (item) {
        await supabase.from('notifications').insert([{
          user_id: user.id,
          type: 'new_saving',
          message: `${profile?.display_name || 'Pasanganmu'} menyetor ${numAmount.toLocaleString('id-ID')} untuk wishlist "${item.name}"`
        }]);
      }

      return data;
    } catch (err) {
      toast.error('Gagal menambahkan setoran');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ambil riwayat setoran per wishlist
  const fetchSavingsByWishlist = useCallback(async (wishlistId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          user:profiles(username, display_name)
        `)
        .eq('wishlist_id', wishlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavingsHistory(data || []);
      return data || [];
    } catch (err) {
      console.error('[useSaving] Error fetching savings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Hapus setoran
  const deleteSaving = async (id, wishlistId) => {
    try {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Setoran berhasil dihapus');
      if (wishlistId) {
        await fetchSavingsByWishlist(wishlistId);
      }
    } catch (err) {
      toast.error('Gagal menghapus setoran');
    }
  };

  return {
    addSaving,
    fetchSavingsByWishlist,
    deleteSaving,
    savingsHistory,
    loading
  };
}
