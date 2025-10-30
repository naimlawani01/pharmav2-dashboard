'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { produitsApi, pharmaciesApi, stocksApi } from '@/lib/api';
import type { Produit, Pharmacie, Stock } from '@/types';
import Navbar from '@/components/Navbar';
import { Package, Building2, Box, Shield, Plus, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, hasFetched } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [stats, setStats] = useState({
    produits: 0,
    pharmacies: 0,
    stocks: 0,
  });

  useEffect(() => {
    // Ne rediriger que si on est sur cette page
    if (pathname !== '/dashboard/admin') return;
    
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    // Attendre que le fetch soit terminé avant de rediriger
    if (!hasFetched || isLoading) return;
    
    // Si déconnecté ou mauvais rôle, rediriger vers login
    if (!isAuthenticated || user?.role !== 'admin') {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }
    
    // Reset du flag si authentification réussie (au cas où)
    hasRedirected.current = false;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isLoading, hasFetched, router, pathname]);

  const loadStats = async () => {
    try {
      const [produits, pharmacies, stocks] = await Promise.all([
        produitsApi.getAll(),
        pharmaciesApi.getAll(),
        stocksApi.getAll(),
      ]);
      setStats({
        produits: produits.length,
        pharmacies: pharmacies.length,
        stocks: stocks.length,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  if (!hasFetched || isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Produits',
      value: stats.produits,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/produits',
    },
    {
      title: 'Pharmacies',
      value: stats.pharmacies,
      icon: Building2,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      href: '/pharmacies',
    },
    {
      title: 'Stocks',
      value: stats.stocks,
      icon: Box,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/stocks',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-10">
            <div className="relative">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg mr-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Dashboard Admin
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">Gestion complète de la plateforme</p>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.href}
                  href={stat.href}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-transparent overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">{stat.title}</p>
                        <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.iconBg} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                        <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 group-hover:text-primary-600 transition-colors">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Voir les détails</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center">
                  <Package className="w-7 h-7 text-white mr-3" />
                  <h2 className="text-xl font-bold text-white">Gestion des produits</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Créez, modifiez et supprimez les produits pharmaceutiques de votre catalogue
                </p>
                <Link
                  href="/produits/new"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouveau produit</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <Building2 className="w-7 h-7 text-white mr-3" />
                  <h2 className="text-xl font-bold text-white">Gestion des pharmacies</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Gérez les pharmacies et leurs informations de contact et localisation
                </p>
                <Link
                  href="/pharmacies/new"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouvelle pharmacie</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}