'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Package, Building2, Search, User, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const { user, isAuthenticated, isLoading, hasFetched } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Ne rediriger que si on est sur cette page
    if (pathname !== '/dashboard/client') return;
    
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    // Attendre que le fetch soit terminé avant de rediriger
    if (!hasFetched || isLoading) return;
    
    // Si déconnecté ou mauvais rôle, rediriger vers login
    if (!isAuthenticated || user?.role !== 'client') {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }
    
    // Reset du flag si authentification réussie (au cas où)
    hasRedirected.current = false;
  }, [isAuthenticated, user, isLoading, hasFetched, router, pathname]);

  if (!hasFetched || isLoading || !user || user.role !== 'client') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Rechercher un produit',
      description: 'Trouvez où se procurer vos médicaments',
      icon: Search,
      href: '/recherche',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Voir tous les produits',
      description: 'Parcourez notre catalogue complet',
      icon: Package,
      href: '/produits',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pharmacies',
      description: 'Découvrez les pharmacies disponibles',
      icon: Building2,
      href: '/pharmacies',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-10">
            <div className="relative">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Bienvenue, {user.nom} !
              </h1>
              <p className="text-lg text-gray-600">Tableau de bord client</p>
              <div className="absolute -top-2 -right-2 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>
          </div>

          {/* Quick Actions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-transparent overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative">
                    <div className={`${action.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                      <Icon className={`w-7 h-7 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <User className="w-6 h-6 mr-2" />
                Profil utilisateur
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Nom
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{user.nom}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </div>
                  <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Shield className="w-4 h-4 mr-2" />
                    Rôle
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-800 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}