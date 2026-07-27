import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useWishlist() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all wishlists (shared or created by current user/partner)
  const fetchWishlists = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          category:categories(*),
          creator:profiles!wishlist_items_user_id_fkey(username, display_name),
          purchaser:profiles!wishlist_items_purchased_by_fkey(username, display_name),
          savings(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('[useWishlist] Error fetching wishlists:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to Realtime Changes
  useEffect(() => {
    fetchWishlists();

    if (!user) return;

    const channel = supabase
      .channel('public:wishlist_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishlist_items' },
        (payload) => {
          fetchWishlists();
          if (payload.eventType === 'INSERT' && payload.new.user_id !== user.id) {
            toast('✨ Pasanganmu menambah wishlist baru!', { icon: '🎁', duration: 4000 });
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'done' && payload.old.status !== 'done') {
            toast('🎉 Multi-task selesai! Status wishlist diperbarui pasanganmu!', { icon: '✅', duration: 4000 });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWishlists]);

  // Tambah Wishlist Baru
  const addWishlist = async (formData) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert([{
          user_id: user.id,
          name: formData.name,
          category_id: formData.category_id || null,
          description: formData.description || '',
          target_amount: formData.target_amount ? parseInt(formData.target_amount) : 0,
          priority: formData.priority || 'medium',
          note: formData.note || '',
          image_url: formData.image_url || null,
          product_url: formData.product_url || null,
          is_shared: formData.is_shared !== undefined ? formData.is_shared : true,
          status: 'pending'
        }])
        .select();

      if (error) throw error;
      toast.success('Wishlist berhasil ditambahkan! ❤️');

      // Notifikasi ke pasangan
      await supabase.from('notifications').insert([{
        user_id: user.id,
        type: 'new_wishlist',
        message: `${profile?.display_name || 'Pasanganmu'} menambahkan wishlist baru: "${formData.name}"`
      }]);

      await fetchWishlists();
      return data;
    } catch (err) {
      toast.error('Gagal menambahkan wishlist');
      throw err;
    }
  };

  // Update Wishlist
  const updateWishlist = async (id, formData) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          name: formData.name,
          category_id: formData.category_id || null,
          description: formData.description || '',
          target_amount: formData.target_amount ? parseInt(formData.target_amount) : 0,
          priority: formData.priority || 'medium',
          note: formData.note || '',
          image_url: formData.image_url || null,
          product_url: formData.product_url || null,
          is_shared: formData.is_shared !== undefined ? formData.is_shared : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Wishlist berhasil diperbarui!');
      await fetchWishlists();
    } catch (err) {
      toast.error('Gagal mengedit wishlist');
      throw err;
    }
  };

  // Tandai Selesai (Done) / Kembalikan ke Pending
  const toggleDoneStatus = async (item, purchasedType = 'self') => {
    if (!user) return;
    const isDone = item.status === 'done';
    const newStatus = isDone ? 'pending' : 'done';

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          status: newStatus,
          purchased_by: isDone ? null : user.id,
          purchased_type: isDone ? null : purchasedType,
          purchased_at: isDone ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;

      if (!isDone) {
        toast.success(purchasedType === 'gift' ? 'Sweet! Kamu membelikan ini untuk pasangan! 🎁' : 'Selamat! Wishlist telah dibeli! 🎉');
      } else {
        toast('Wishlist dikembalikan ke daftar aktif', { icon: '🔄' });
      }

      await fetchWishlists();
    } catch (err) {
      toast.error('Gagal merubah status wishlist');
    }
  };

  // Hapus Wishlist
  const deleteWishlist = async (id) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Wishlist berhasil dihapus');
      await fetchWishlists();
    } catch (err) {
      toast.error('Gagal menghapus wishlist');
    }
  };

  return {
    items,
    loading,
    refetch: fetchWishlists,
    addWishlist,
    updateWishlist,
    toggleDoneStatus,
    deleteWishlist
  };
}
