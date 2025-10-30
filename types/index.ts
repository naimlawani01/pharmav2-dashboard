// Types pour les produits
export interface Produit {
  id: number;
  nom: string;
  description?: string;
  categorie?: string;
  prix_unitaire: number;
}

export interface ProduitCreate {
  nom: string;
  description?: string;
  categorie?: string;
  prix_unitaire: number;
}

export interface ProduitUpdate {
  nom?: string;
  description?: string;
  categorie?: string;
  prix_unitaire?: number;
}

// Types pour les pharmacies
export interface Pharmacie {
  id: number;
  nom: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
}

export interface PharmacieCreate {
  nom: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
}

export interface PharmacieUpdate {
  nom?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
}

// Types pour les stocks
export interface Stock {
  id: number;
  produit_id: number;
  pharmacie_id: number;
  quantite_disponible: number;
  prix?: number;
}

export interface StockCreate {
  produit_id: number;
  pharmacie_id: number;
  quantite_disponible: number;
  prix?: number;
}

export interface StockUpdate {
  quantite_disponible?: number;
  prix?: number;
}

// Types pour la recherche
export interface ProduitDisponible {
  produit_id: number;
  produit_nom: string;
  pharmacie_id: number;
  pharmacie_nom: string;
  pharmacie_adresse?: string;
  pharmacie_latitude?: number;
  pharmacie_longitude?: number;
  pharmacie_telephone?: string;
  quantite_disponible: number;
  prix?: number;
  distance_km?: number;
}

// Types pour l'authentification
export type UserRole = 'client' | 'pharmacien' | 'admin';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: UserRole;
  pharmacie_id?: number;
}

export interface UserCreate {
  nom: string;
  email: string;
  mot_de_passe: string;
  role?: UserRole;
  pharmacie_id?: number;
}

export interface UserLogin {
  email: string;
  mot_de_passe: string;
}

export interface MeOut {
  id: number;
  nom: string;
  email: string;
  role: UserRole;
  pharmacie?: Pharmacie;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

