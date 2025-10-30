'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/lib/store';
import { pharmaciesApi } from '@/lib/api';
import type { Pharmacie } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditPharmaciePage() {
  const router = useRouter();
  const params = useParams();
  const { hasRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    latitude: '',
    longitude: '',
    telephone: '',
  });

  useEffect(() => {
    if (!hasRole('admin')) {
      router.push('/pharmacies');
      return;
    }
    const idParam = params?.id as string | undefined;
    if (!idParam) return;

    const load = async () => {
      try {
        setLoading(true);
        const ph = await pharmaciesApi.getById(parseInt(idParam));
        setFormData({
          nom: ph.nom,
          adresse: ph.adresse || '',
          latitude: ph.latitude != null ? ph.latitude.toString() : '',
          longitude: ph.longitude != null ? ph.longitude.toString() : '',
          telephone: ph.telephone || '',
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

    const latitude = formData.latitude ? parseFloat(formData.latitude) : undefined;
    const longitude = formData.longitude ? parseFloat(formData.longitude) : undefined;

    if (formData.latitude && (isNaN(latitude as number) || Math.abs(latitude as number) > 90)) {
      setError('Latitude invalide');
      return;
    }
    if (formData.longitude && (isNaN(longitude as number) || Math.abs(longitude as number) > 180)) {
      setError('Longitude invalide');
      return;
    }

    try {
      setSaving(true);
      await pharmaciesApi.update(parseInt(params.id as string), {
        nom: formData.nom,
        adresse: formData.adresse || undefined,
        latitude,
        longitude,
        telephone: formData.telephone || undefined,
      });
      router.push('/pharmacies');
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
          <Link href="/pharmacies" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier la pharmacie</h1>

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
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  id="adresse"
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/pharmacies" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
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


