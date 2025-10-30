'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/lib/store';
import { stocksApi, produitsApi } from '@/lib/api';
import type { Produit, Stock } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditStockPage() {
  const router = useRouter();
  const params = useParams();
  const { user, hasRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [produits, setProduits] = useState<Produit[]>([]);
  const [stock, setStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    produit_id: '',
    quantite_disponible: '',
    prix: '',
  });

  useEffect(() => {
    if (!hasRole('pharmacien') && !hasRole('admin')) {
      router.push('/dashboard/client');
      return;
    }
    const idParam = params?.id as string | undefined;
    if (!idParam) return;

    const load = async () => {
      try {
        setLoading(true);
        const [stockData, produitsData] = await Promise.all([
          stocksApi.getById(parseInt(idParam)),
          produitsApi.getAll(),
        ]);
        setStock(stockData);
        setProduits(produitsData);
        setFormData({
          produit_id: stockData.produit_id.toString(),
          quantite_disponible: stockData.quantite_disponible.toString(),
          prix: stockData.prix != null ? stockData.prix.toString() : '',
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

    if (!stock) return;

    const produitId = parseInt(formData.produit_id);
    const quantite = parseInt(formData.quantite_disponible);
    const prixVal = formData.prix ? parseFloat(formData.prix) : undefined;

    if (isNaN(produitId) || produitId <= 0) {
      setError('Veuillez sélectionner un produit valide');
      return;
    }
    if (isNaN(quantite) || quantite < 0) {
      setError('Veuillez saisir une quantité valide');
      return;
    }

    try {
      setSaving(true);
      await stocksApi.update(stock.id, {
        quantite_disponible: quantite,
        prix: prixVal,
      });
      router.push('/dashboard/pharmacien');
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

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700">Stock introuvable.</p>
            <Link href="/dashboard/pharmacien" className="text-primary-600 hover:text-primary-700">Retour</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/pharmacien" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le stock</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="produit_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Produit
                </label>
                <select
                  id="produit_id"
                  value={formData.produit_id}
                  onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                >
                  {produits.map((produit) => (
                    <option key={produit.id} value={produit.id}>
                      {produit.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantite_disponible" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité disponible
                </label>
                <input
                  id="quantite_disponible"
                  type="number"
                  min="0"
                  value={formData.quantite_disponible}
                  onChange={(e) => setFormData({ ...formData, quantite_disponible: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (optionnel)
                </label>
                <input
                  id="prix"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/pharmacien" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
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


