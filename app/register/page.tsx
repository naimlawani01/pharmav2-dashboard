'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    role: 'client' as UserRole,
    pharmacie_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        pharmacie_id: formData.pharmacie_id ? parseInt(formData.pharmacie_id) : undefined,
      };
      await authApi.register(data);
      // Automatiquement se connecter après inscription
      const response = await authApi.login({ email: formData.email, mot_de_passe: formData.mot_de_passe });
      const user = await authApi.me();
      login(user);

      // Rediriger selon le rôle
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'pharmacien') {
        router.push('/dashboard/pharmacien');
      } else {
        router.push('/dashboard/client');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-primary-600" />
          <span className="text-2xl font-bold text-primary-600 ml-2">Pharmacy</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Inscription</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              id="nom"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.mot_de_passe}
              onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="client">Client</option>
              <option value="pharmacien">Pharmacien</option>
            </select>
          </div>

          {formData.role === 'pharmacien' && (
            <div>
              <label htmlFor="pharmacie_id" className="block text-sm font-medium text-gray-700 mb-2">
                ID de la pharmacie
              </label>
              <input
                id="pharmacie_id"
                type="number"
                value={formData.pharmacie_id}
                onChange={(e) => setFormData({ ...formData, pharmacie_id: e.target.value })}
                required={formData.role === 'pharmacien'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Entrez l'ID de la pharmacie à laquelle vous êtes associé
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

