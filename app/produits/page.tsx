'use client';

import { useState, useEffect } from 'react';
import { produitsApi } from '@/lib/api';
import type { Produit } from '@/types';
import Navbar from '@/components/Navbar';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useAuthStore();

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      setLoading(true);
      const data = await produitsApi.getAll();
      setProduits(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await produitsApi.delete(id);
      setProduits(produits.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="w-8 h-8 mr-2 text-primary-600" />
                Produits
              </h1>
              <p className="mt-2 text-gray-600">Gérez les produits pharmaceutiques</p>
            </div>
            {hasRole('admin') && (
              <Link
                href="/produits/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau produit</span>
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produits.map((produit) => (
              <div
                key={produit.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{produit.nom}</h3>
                {produit.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{produit.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    {produit.categorie && (
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        {produit.categorie}
                      </span>
                    )}
                    <p className="text-2xl font-bold text-primary-600 mt-2">
                      {produit.prix_unitaire.toFixed(2)} €
                    </p>
                  </div>
                  {hasRole('admin') && (
                    <div className="flex space-x-2">
                      <Link
                        href={`/produits/${produit.id}/edit`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(produit.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {produits.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

