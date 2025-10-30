# Configuration Vercel

## Problème d'authentification sur Vercel

Si vous obtenez "authentification requise" sur Vercel mais que tout fonctionne en local, c'est un problème de cookies entre domaines.

## Solution

### 1. Variables d'environnement Vercel

Dans votre projet Vercel, allez dans **Settings > Environment Variables** et ajoutez :

```
NEXT_PUBLIC_API_URL = https://votre-api-backend.com
```

⚠️ **Important** : Remplacez par l'URL réelle de votre backend (Render, Railway, etc.)

### 2. Configuration du Backend (FastAPI)

Votre backend doit avoir la configuration CORS suivante :

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration CORS pour Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local
        "https://votre-app.vercel.app",  # Vercel
        "https://votre-domaine.com"  # Domaine personnalisé
    ],
    allow_credentials=True,  # ⚠️ TRÈS IMPORTANT pour les cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Configuration des Cookies (Backend)

Dans votre endpoint de login FastAPI, les cookies doivent être configurés ainsi :

```python
from fastapi import Response

@app.post("/api/auth/login")
async def login(response: Response, ...):
    # ... votre logique de login ...
    
    # Configuration des cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # ⚠️ OBLIGATOIRE en production (HTTPS)
        samesite="none",  # ⚠️ IMPORTANT pour les cookies cross-domain
        max_age=1800,  # 30 minutes
        domain=None  # Ou votre domaine spécifique
    )
    
    return {"message": "Login successful"}
```

### 4. Alternative : Utiliser localStorage au lieu des cookies

Si les cookies cross-domain posent trop de problèmes, vous pouvez modifier le frontend pour utiliser `localStorage` :

**Modifier `lib/api.ts`** :

```typescript
// Au lieu de withCredentials: true
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Modifier la fonction login** :

```typescript
login: async (data: UserLogin): Promise<AuthResponse> => {
  // ... code existant ...
  const response = await apiClient.post('/api/auth/login?use_cookie=false', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // Stocker le token
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  
  return response.data;
}
```

## Vérification

Après ces modifications :

1. Redéployez votre backend avec la nouvelle config CORS
2. Ajoutez `NEXT_PUBLIC_API_URL` dans Vercel
3. Redéployez votre frontend sur Vercel

## Debug

Pour vérifier que l'API est bien appelée, ouvrez la console du navigateur (F12) et vérifiez :
- L'onglet **Network** : les requêtes vers votre API
- Les erreurs CORS
- Les cookies dans l'onglet **Application > Cookies**

