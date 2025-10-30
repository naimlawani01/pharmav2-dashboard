'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/lib/store';
import { produitsApi } from '@/lib/api';
import type { Produit } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProduitPage() {
  const router = useRouter();
  const params = useParams();
  const { hasRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: '',
    prix_unitaire: '',
  });

  useEffect(() => {
    if (!hasRole('admin')) {
      router.push('/produits');
      return;
    }
    const idParam = params?.id as string | undefined;
    if (!idParam) return;

    const load = async () => {
      try {
        setLoading(true);
        const produit = await produitsApi.getById(parseInt(idParam));
        setFormData({
          nom: produit.nom,
          description: produit.description || '',
          categorie: produit.categorie || '',
          prix_unitaire: produit.prix_unitaire.toString(),
        });
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params, router, hasRole]);

  const formatError = (error: any): string => {
    if (!error) return 'Erreur';
    const detail = error?.response?.data?.detail;
    if (!detail) return 'Erreur';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((err: any) => {
          const field = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : '';
          return field ? `${field}: ${err.msg}` : err.msg;
        })
        .join('\n');
    }
    if (typeof detail === 'object') return JSON.stringify(detail);
    return 'Erreur';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const prix = parseFloat(formData.prix_unitaire);
    if (isNaN(prix) || prix < 0) {
      setError('Veuillez saisir un prix unitaire valide');
      return;
    }

    try {
      setSaving(true);
      await produitsApi.update(parseInt(params.id as string), {
        nom: formData.nom,
        description: formData.description || undefined,
        categorie: formData.categorie || undefined,
        prix_unitaire: prix,
      });
      router.push('/produits');
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/produits" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le produit</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  id="nom"
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
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
                />
              </div>

              <div>
                <label htmlFor="prix_unitaire" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix unitaire
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
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/produits" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}


