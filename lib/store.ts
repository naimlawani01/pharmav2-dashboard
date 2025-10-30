import { create } from 'zustand';
import type { MeOut, UserRole } from '@/types';
import { authApi } from './api';

interface AuthState {
  user: MeOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasFetched: boolean;
  login: (user: MeOut) => void;
  logout: () => Promise<void>;
  forceLogout: () => void;
  fetchUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  hasFetched: false,

  login: (user: MeOut) => {
    set({ user, isAuthenticated: true, hasFetched: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      set({ user: null, isAuthenticated: false, hasFetched: false });
    }
  },

  // Fonction pour déconnexion forcée (utilisée par l'intercepteur)
  forceLogout: () => {
    // Nettoyer localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, hasFetched: true });
  },

  fetchUser: async () => {
    // Ne pas refetch si déjà fait
    if (get().hasFetched && !get().isLoading) {
      return;
    }
    
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, hasFetched: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false, hasFetched: true });
    } finally {
      set({ isLoading: false });
    }
  },

  hasRole: (role: UserRole) => {
    const { user } = get();
    if (!user) return false;
    return user.role === role;
  },
}));

