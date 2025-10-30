'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LogOut, User, ShoppingCart, Building2, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!isAuthenticated || !user) return null;

  const getDashboardLink = () => {
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'pharmacien') return '/dashboard/pharmacien';
    return '/dashboard/client';
  };

  const getRoleIcon = () => {
    if (user.role === 'admin') return <Shield className="w-5 h-5" />;
    if (user.role === 'pharmacien') return <Building2 className="w-5 h-5" />;
    return <User className="w-5 h-5" />;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-primary-600">Pharmacy</span>
            </Link>

            <div className="flex space-x-4">
              <Link
                href="/produits"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Produits
              </Link>
              <Link
                href="/pharmacies"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pharmacies
              </Link>
              <Link
                href="/recherche"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Recherche
              </Link>
              {(user.role === 'admin' || user.role === 'pharmacien') && (
                <Link
                  href={getDashboardLink()}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              {getRoleIcon()}
              <span className="font-medium">{user.nom}</span>
              <span className="text-gray-500">({user.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

