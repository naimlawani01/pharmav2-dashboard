'use client';

import { useState, useEffect } from 'react';
import { rechercheApi } from '@/lib/api';
import type { ProduitDisponible } from '@/types';
import Navbar from '@/components/Navbar';
import { Search, MapPin, Package, Building2 } from 'lucide-react';

export default function RecherchePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProduitDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  // Demander la géolocalisation au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        () => {
          console.log('Géolocalisation refusée');
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await rechercheApi.searchProduit(searchTerm, latitude, longitude);
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la recherche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <Search className="w-8 h-8 mr-2 text-primary-600" />
              Recherche de produits
            </h1>
            <p className="text-gray-600">Trouvez où se procurer vos médicaments</p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit (ex: Paracétamol)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
              </button>
            </div>
            {latitude && longitude && (
              <p className="mt-2 text-sm text-gray-500">
                📍 Utilisation de votre position pour trier par distance
              </p>
            )}
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Package className="w-5 h-5 text-primary-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.produit_nom}
                          </h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2 text-primary-600" />
                          <span className="font-medium">{result.pharmacie_nom}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {result.prix?.toFixed(2) || 'N/A'} €
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {result.pharmacie_adresse && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary-600" />
                          <span>{result.pharmacie_adresse}</span>
                        </div>
                      )}
                      {result.pharmacie_telephone && (
                        <p>📞 {result.pharmacie_telephone}</p>
                      )}
                      <p>Stock disponible: {result.quantite_disponible} unité(s)</p>
                      {result.distance_km && (
                        <p className="text-primary-600 font-semibold">
                          📍 À {result.distance_km.toFixed(2)} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && searchTerm && results.length === 0 && !error && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

