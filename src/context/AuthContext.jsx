import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk mengubah username menjadi format email internal Supabase
  const formatUsernameToEmail = (username) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUsername}@wishlist.local`;
  };

  // Mengambil profile pengguna & partner
  const fetchProfiles = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      setPartnerProfile(null);
      return;
    }

    try {
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (allProfiles) {
        const myProfile = allProfiles.find(p => p.id === currentUser.id);
        const partner = allProfiles.find(p => p.id !== currentUser.id);

        setProfile(myProfile || { id: currentUser.id, username: currentUser.email.split('@')[0], display_name: currentUser.email.split('@')[0] });
        setPartnerProfile(partner || null);
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching profiles:', err);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession()
      .then(({ data }) => {
        const currentUser = data?.session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfiles(currentUser);
        }
      })
      .catch((err) => {
        console.warn('[AuthContext] Session fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen to Auth state changes
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfiles(currentUser);
      } else {
        setProfile(null);
        setPartnerProfile(null);
      }
      setLoading(false);
    });

    return () => data?.subscription?.unsubscribe();
  }, []);

  // Login dengan Username & Password
  const login = async (username, password) => {
    try {
      const email = formatUsernameToEmail(username);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Username atau Password salah');
        }
        throw error;
      }

      toast.success(`Selamat datang kembali, ${username}! ❤️`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Gagal login');
      throw err;
    }
  };

  // Register Akun Baru dengan Username, Display Name, dan Password
  const signup = async (username, displayName, password) => {
    try {
      const email = formatUsernameToEmail(username);
      const cleanUsername = username.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: displayName.trim()
          }
        }
      });

      if (error) throw error;

      toast.success('Pendaftaran berhasil! Silakan login ❤️');
      return data;
    } catch (err) {
      toast.error(err.message || 'Gagal mendaftar');
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setPartnerProfile(null);
      toast.success('Berhasil keluar');
    } catch (err) {
      toast.error('Gagal keluar');
    }
  };

  // Update Profile
  const updateProfile = async (newDisplayName) => {
    if (!user || !profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: newDisplayName })
        .eq('id', user.id);

      if (error) throw error;
      setProfile(prev => ({ ...prev, display_name: newDisplayName }));
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error('Gagal memperbarui profil');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, partnerProfile, loading, login, signup, logout, updateProfile, refetchProfiles: () => fetchProfiles(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
