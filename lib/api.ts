import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Produit,
  ProduitCreate,
  ProduitUpdate,
  Pharmacie,
  PharmacieCreate,
  PharmacieUpdate,
  Stock,
  StockCreate,
  StockUpdate,
  ProduitDisponible,
  UserCreate,
  UserLogin,
  AuthResponse,
  MeOut,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Créer une instance axios avec configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les cookies HTTP-only
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable pour stocker la fonction de déconnexion
let logoutCallback: (() => void) | null = null;

// Fonction pour enregistrer le callback de déconnexion
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== 'undefined') {
        // Supprimer les cookies
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Appeler le callback de déconnexion si disponible (mise à jour du store)
        if (logoutCallback) {
          logoutCallback();
        }
        // Les pages détecteront automatiquement isAuthenticated = false et redirigeront
        // Ne PAS utiliser window.location car ça force un rechargement complet
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTIFICATION ====================

export const authApi = {
  register: async (data: UserCreate): Promise<{ id: number; nom: string; email: string; role: string; pharmacie_id?: number }> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: UserLogin, useCookie: boolean = true): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.mot_de_passe);

    const response = await apiClient.post(`/api/auth/login?use_cookie=${useCookie}`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  me: async (): Promise<MeOut> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  refresh: async (): Promise<{ access_token: string; token_type: string }> => {
    const response = await apiClient.post('/api/auth/refresh');
    return response.data;
  },
};

// ==================== PRODUITS ====================

export const produitsApi = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Produit[]> => {
    const response = await apiClient.get('/api/produits/', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: number): Promise<Produit> => {
    const response = await apiClient.get(`/api/produits/${id}`);
    return response.data;
  },

  create: async (data: ProduitCreate): Promise<Produit> => {
    const response = await apiClient.post('/api/produits/', data);
    return response.data;
  },

  update: async (id: number, data: ProduitUpdate): Promise<Produit> => {
    const response = await apiClient.put(`/api/produits/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/produits/${id}`);
  },
};

// ==================== PHARMACIES ====================

export const pharmaciesApi = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Pharmacie[]> => {
    const response = await apiClient.get('/api/pharmacies/', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: number): Promise<Pharmacie> => {
    const response = await apiClient.get(`/api/pharmacies/${id}`);
    return response.data;
  },

  create: async (data: PharmacieCreate): Promise<Pharmacie> => {
    const response = await apiClient.post('/api/pharmacies/', data);
    return response.data;
  },

  update: async (id: number, data: PharmacieUpdate): Promise<Pharmacie> => {
    const response = await apiClient.put(`/api/pharmacies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/pharmacies/${id}`);
  },
};

// ==================== STOCKS ====================

export const stocksApi = {
  getAll: async (skip: number = 0, limit: number = 100, produit_id?: number, pharmacie_id?: number): Promise<Stock[]> => {
    const response = await apiClient.get('/api/stocks/', {
      params: { skip, limit, produit_id, pharmacie_id },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Stock> => {
    const response = await apiClient.get(`/api/stocks/${id}`);
    return response.data;
  },

  create: async (data: StockCreate): Promise<Stock> => {
    const response = await apiClient.post('/api/stocks/', data);
    return response.data;
  },

  update: async (id: number, data: StockUpdate): Promise<Stock> => {
    const response = await apiClient.put(`/api/stocks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/stocks/${id}`);
  },
};

// ==================== RECHERCHE ====================

export const rechercheApi = {
  searchProduit: async (
    nom: string,
    latitude?: number,
    longitude?: number
  ): Promise<ProduitDisponible[]> => {
    const params: any = { nom };
    if (latitude !== undefined && longitude !== undefined) {
      params.latitude = latitude;
      params.longitude = longitude;
    }
    const response = await apiClient.get('/api/recherche/produit', { params });
    return response.data;
  },
};

export default apiClient;

