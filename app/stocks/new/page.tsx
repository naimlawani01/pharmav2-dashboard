'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { stocksApi, produitsApi } from '@/lib/api';
import type { Produit } from '@/types';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewStockPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [formData, setFormData] = useState({
    produit_id: '',
    pharmacie_id: '',
    quantite_disponible: '',
    prix: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasRole('pharmacien') && !hasRole('admin')) {
      router.push('/dashboard/client');
      return;
    }
    
    // Initialiser pharmacie_id depuis user quand disponible
    if (user && !hasRole('admin')) {
      // Pour les pharmaciens, utiliser user.pharmacie?.id
      const pharmacieId = (user as any).pharmacie_id || user?.pharmacie?.id;
      if (pharmacieId) {
        setFormData(prev => ({
          ...prev,
          pharmacie_id: pharmacieId.toString(),
        }));
      }
    }
    
    loadProduits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasRole, router]);

  const loadProduits = async () => {
    try {
      setLoadingProduits(true);
      const data = await produitsApi.getAll();
      setProduits(data);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
    } finally {
      setLoadingProduits(false);
    }
  };

  const formatError = (error: any): string => {
    if (!error) return 'Erreur lors de la création';
    
    const detail = error?.response?.data?.detail;
    if (!detail) return 'Erreur lors de la création';
    
    // Si detail est une chaîne, on la retourne directement
    if (typeof detail === 'string') return detail;
    
    // Si detail est un tableau d'erreurs de validation
    if (Array.isArray(detail)) {
      return detail.map((err: any) => {
        const field = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : '';
        return field ? `${field}: ${err.msg}` : err.msg;
      }).join('\n');
    }
    
    // Si detail est un objet (cas rare)
    if (typeof detail === 'object') {
      return JSON.stringify(detail);
    }
    
    return 'Erreur lors de la création';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation des champs requis
    const produitId = parseInt(formData.produit_id);
    const pharmacieId = parseInt(formData.pharmacie_id);
    const quantite = parseInt(formData.quantite_disponible);

    if (isNaN(produitId) || produitId <= 0) {
      setError('Veuillez sélectionner un produit valide');
      setLoading(false);
      return;
    }

    if (isNaN(pharmacieId) || pharmacieId <= 0) {
      setError('Veuillez saisir un ID de pharmacie valide');
      setLoading(false);
      return;
    }

    if (isNaN(quantite) || quantite < 0) {
      setError('Veuillez saisir une quantité valide');
      setLoading(false);
      return;
    }

    try {
      await stocksApi.create({
        produit_id: produitId,
        pharmacie_id: pharmacieId,
        quantite_disponible: quantite,
        prix: formData.prix ? parseFloat(formData.prix) : undefined,
      });
      router.push('/dashboard/pharmacien');
    } catch (err: any) {
      setError(formatError(err));
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
            href={hasRole('pharmacien') ? '/dashboard/pharmacien' : '/stocks'}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau stock</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="produit_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Produit *
                </label>
                <select
                  id="produit_id"
                  value={formData.produit_id}
                  onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
                  required
                  disabled={loadingProduits}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map((produit) => (
                    <option key={produit.id} value={produit.id}>
                      {produit.nom} - {produit.prix_unitaire.toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>

              {hasRole('admin') && (
                <div>
                  <label htmlFor="pharmacie_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Pharmacie ID *
                  </label>
                  <input
                    id="pharmacie_id"
                    type="number"
                    value={formData.pharmacie_id}
                    onChange={(e) => setFormData({ ...formData, pharmacie_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label htmlFor="quantite_disponible" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité disponible *
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
                  Prix (optionnel, si différent du prix unitaire)
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
                <Link
                  href={hasRole('pharmacien') ? '/dashboard/pharmacien' : '/stocks'}
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

