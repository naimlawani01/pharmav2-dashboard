'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { produitsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProduitPage() {
  const router = useRouter();
  const { hasRole, hasFetched, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: '',
    prix_unitaire: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasFetched && (!isAuthenticated || !hasRole('admin'))) {
      router.replace('/produits');
    }
  }, [hasFetched, isAuthenticated, hasRole, router]);

  if (!hasFetched || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await produitsApi.create({
        nom: formData.nom,
        description: formData.description || undefined,
        categorie: formData.categorie || undefined,
        prix_unitaire: parseFloat(formData.prix_unitaire),
      });
      router.push('/produits');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/produits"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau produit</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  id="nom"
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Paracétamol 500mg"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Description du produit..."
                />
              </div>

              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  id="categorie"
                  type="text"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Antalgique"
                />
              </div>

              <div>
                <label htmlFor="prix_unitaire" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix unitaire (€) *
                </label>
                <input
                  id="prix_unitaire"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix_unitaire}
                  onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="2.50"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/produits"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

