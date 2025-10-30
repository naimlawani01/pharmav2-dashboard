'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { login, user, isAuthenticated, hasFetched } = useAuthStore();
  const hasRedirected = useRef(false);

  // Rediriger si déjà connecté (seulement si pas en train de soumettre le formulaire)
  useEffect(() => {
    // Ne rediriger que si on est sur la page login
    if (pathname !== '/login') return;
    
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    if (!loading && hasFetched && isAuthenticated && user) {
      hasRedirected.current = true;
      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'pharmacien') {
        router.replace('/dashboard/pharmacien');
      } else {
        router.replace('/dashboard/client');
      }
    }
  }, [user, isAuthenticated, hasFetched, router, loading, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.login({ email, mot_de_passe: password });
      // Récupérer les infos utilisateur
      const user = await authApi.me();
      login(user);

      // Rediriger selon le rôle
      hasRedirected.current = true;
      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'pharmacien') {
        router.replace('/dashboard/pharmacien');
      } else {
        router.replace('/dashboard/client');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-primary-600" />
          <span className="text-2xl font-bold text-primary-600 ml-2">Pharmacy</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Connexion</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

