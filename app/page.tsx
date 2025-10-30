'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const hasRedirected = useRef(false);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Fetch l'utilisateur une seule fois si pas déjà fait
    if (!hasFetched) {
      fetchUser().catch(() => {
        // Ignorer les erreurs silencieusement
      });
    }
  }, [hasFetched, fetchUser]);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    // Attendre que le fetch soit terminé
    if (!hasFetched || isLoading) return;

    hasRedirected.current = true;

    // Rediriger selon l'état
    if (isAuthenticated && user) {
      const targetRoute = 
        user.role === 'admin' ? '/dashboard/admin' :
        user.role === 'pharmacien' ? '/dashboard/pharmacien' :
        '/dashboard/client';
      router.replace(targetRoute);
    } else {
      router.replace('/login');
    }
  }, [hasFetched, isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

