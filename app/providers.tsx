'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { setLogoutCallback } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const { fetchUser, hasFetched, isLoading, forceLogout } = useAuthStore();

  useEffect(() => {
    // Enregistrer le callback de déconnexion pour l'intercepteur API
    setLogoutCallback(() => {
      forceLogout();
    });
    
    // Initialiser l'authentification au chargement de l'application
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

