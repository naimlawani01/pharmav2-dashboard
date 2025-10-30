'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { stocksApi, produitsApi } from '@/lib/api';
import type { Stock, Produit } from '@/types';
import Navbar from '@/components/Navbar';
import { Package, Plus, Edit, Trash2, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PharmacienDashboard() {
  const { user, isAuthenticated, isLoading, hasFetched } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  // Obtenir l'ID de la pharmacie depuis user
  const getPharmacieId = (): number | undefined => {
    if (!user) return undefined;
    return (user as any).pharmacie_id || user.pharmacie?.id;
  };

  useEffect(() => {
    // Ne rediriger que si on est sur cette page
    if (pathname !== '/dashboard/pharmacien') return;
    
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    // Attendre que le fetch soit terminé avant de rediriger
    if (!hasFetched || isLoading) return;
    
    // Si déconnecté ou mauvais rôle, rediriger vers login
    if (!isAuthenticated || user?.role !== 'pharmacien') {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }
    
    // Reset du flag si authentification réussie (au cas où)
    hasRedirected.current = false;
    
    const pharmacieId = getPharmacieId();
    if (pharmacieId) {
      loadStocks(pharmacieId);
      loadProduits();
    } else {
      setLoadingStocks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isLoading, hasFetched, router, pathname]);

  const loadStocks = async (pharmacieId: number) => {
    try {
      setLoadingStocks(true);
      const data = await stocksApi.getAll(0, 100, undefined, pharmacieId);
      setStocks(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des stocks:', err);
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

  const loadProduits = async () => {
    try {
      const data = await produitsApi.getAll();
      setProduits(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des produits:', err);
    }
  };

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;

    try {
      await stocksApi.delete(id);
      setStocks(stocks.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const getProduitNom = (produitId: number) => {
    const produit = produits.find((p) => p.id === produitId);
    return produit?.nom || `Produit #${produitId}`;
  };

  // Calcul des statistiques
  const totalStocks = stocks.length;
  const lowStock = stocks.filter((s) => s.quantite_disponible < 10).length;
  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantite_disponible, 0);

  if (!hasFetched || isLoading || !user || user.role !== 'pharmacien') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Dashboard Pharmacien
              </h1>
              <p className="text-lg text-gray-600">
                {user.pharmacie ? user.pharmacie.nom : 'Gestion des stocks'}
              </p>
            </div>
            <Link
              href="/stocks/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau stock</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total stocks</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStocks}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantité totale</p>
                  <p className="text-3xl font-bold text-gray-900">{totalQuantity}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stocks faibles</p>
                  <p className="text-3xl font-bold text-gray-900">{lowStock}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy Info Card */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center mb-4">
              <Building2 className="w-7 h-7 mr-3" />
              <h2 className="text-2xl font-bold">Ma pharmacie</h2>
            </div>
            {user.pharmacie ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold">{user.pharmacie.nom}</p>
                {user.pharmacie.adresse && (
                  <p className="text-primary-100">{user.pharmacie.adresse}</p>
                )}
                {user.pharmacie.telephone && (
                  <p className="text-primary-100 flex items-center">
                    <span className="mr-2">📞</span>
                    {user.pharmacie.telephone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-primary-100">Aucune pharmacie associée</p>
            )}
          </div>

          {/* Stocks Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-2 text-primary-600" />
                Mes stocks ({stocks.length})
              </h2>
            </div>

            {loadingStocks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              </div>
            ) : stocks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4 text-lg">Aucun stock enregistré</p>
                <Link
                  href="/stocks/new"
                  className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Ajouter un stock
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stocks.map((stock) => {
                      const isLowStock = stock.quantite_disponible < 10;
                      return (
                        <tr
                          key={stock.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {getProduitNom(stock.produit_id)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                isLowStock
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {stock.quantite_disponible}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-primary-600">
                              {stock.prix?.toFixed(2) || 'N/A'} €
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                href={`/stocks/${stock.id}/edit`}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteStock(stock.id)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}