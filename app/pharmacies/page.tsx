'use client';

import { useState, useEffect } from 'react';
import { pharmaciesApi } from '@/lib/api';
import type { Pharmacie } from '@/types';
import Navbar from '@/components/Navbar';
import { Plus, Edit, Trash2, Building2, MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useAuthStore();

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const data = await pharmaciesApi.getAll();
      setPharmacies(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ?')) return;

    try {
      await pharmaciesApi.delete(id);
      setPharmacies(pharmacies.filter((p) => p.id !== id));
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
                <Building2 className="w-8 h-8 mr-2 text-primary-600" />
                Pharmacies
              </h1>
              <p className="mt-2 text-gray-600">Liste des pharmacies disponibles</p>
            </div>
            {hasRole('admin') && (
              <Link
                href="/pharmacies/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle pharmacie</span>
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacie) => (
              <div
                key={pharmacie.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{pharmacie.nom}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {pharmacie.adresse && (
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary-600" />
                      <span>{pharmacie.adresse}</span>
                    </div>
                  )}
                  {pharmacie.telephone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-primary-600" />
                      <span>{pharmacie.telephone}</span>
                    </div>
                  )}
                  {pharmacie.latitude && pharmacie.longitude && (
                    <p className="text-xs text-gray-500">
                      📍 {pharmacie.latitude.toFixed(4)}, {pharmacie.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
                {hasRole('admin') && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <Link
                      href={`/pharmacies/${pharmacie.id}/edit`}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(pharmacie.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pharmacies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune pharmacie trouvée</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

