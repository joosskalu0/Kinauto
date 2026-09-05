/**
 * SERVICE CLIENT API REST POUR CONCESSIONNAIRES AUTOMOBILES & GARAGES
 * Permet au frontend de communiquer avec le backend Node.js + Express + MySQL
 * Compatible environnement local, prévisualisation Cloud et déploiement Hostinger
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

/**
 * Récupérer le jeton JWT stocké dans le navigateur
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('autoconcession_token') || localStorage.getItem('kinimmo_token');
};

/**
 * Sauvegarder le jeton JWT
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('autoconcession_token', token);
};

/**
 * Supprimer le jeton JWT (Déconnexion)
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('autoconcession_token');
  localStorage.removeItem('autoconcession_user');
  localStorage.removeItem('kinimmo_token');
  localStorage.removeItem('kinimmo_user');
};

/**
 * Helper générique pour requêtes HTTP Fetch
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue lors de la communication avec le serveur.');
  }

  return data as T;
}

// ====================================================================
// 1. API AUTHENTIFICATION
// ====================================================================
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    request<{ success: boolean; data: { token: string; user: any }; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: 'user' | 'dealer' | 'salesperson' | 'garage'; 
    phone?: string;
    dealershipName?: string;
    garageName?: string;
    commune?: string;
  }) => 
    request<{ success: boolean; data: { token: string; user: any }; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getMe: () => 
    request<{ success: boolean; data: any }>('/auth/me'),

  updateProfile: (profileData: { name?: string; phone?: string; avatar?: string; password?: string }) =>
    request<{ success: boolean; data: any; message?: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
};

// ====================================================================
// 2. API VÉHICULES DU PARC AUTOMOBILE
// ====================================================================
export const vehiclesApi = {
  getAll: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; total: number; count: number; page: number; totalPages: number; data: any[] }>(`/vehicles${queryString}`);
  },

  getById: (id: string | number) => 
    request<{ success: boolean; data: any }>(`/vehicles/${id}`),

  create: (vehicleData: any) => 
    request<{ success: boolean; data: any; message: string }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    }),

  update: (id: string | number, vehicleData: any) => 
    request<{ success: boolean; data: any; message: string }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    }),

  delete: (id: string | number) => 
    request<{ success: boolean; message: string }>(`/vehicles/${id}`, {
      method: 'DELETE'
    })
};

// ====================================================================
// 3. API CONCESSIONNAIRES AUTOMOBILES
// ====================================================================
export const dealershipsApi = {
  getAll: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; total: number; count: number; page: number; totalPages: number; data: any[] }>(`/dealerships${queryString}`);
  },

  getById: (id: string | number) => 
    request<{ success: boolean; data: any }>(`/dealerships/${id}`),

  create: (dealershipData: any) => 
    request<{ success: boolean; data: any; message: string }>('/dealerships', {
      method: 'POST',
      body: JSON.stringify(dealershipData)
    }),

  update: (id: string | number, dealershipData: any) => 
    request<{ success: boolean; data: any; message: string }>(`/dealerships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealershipData)
    }),

  delete: (id: string | number) => 
    request<{ success: boolean; message: string }>(`/dealerships/${id}`, {
      method: 'DELETE'
    })
};

// ====================================================================
// 4. API LEADS & DEMANDES CLIENTS (Essais, Reprises, Financement)
// ====================================================================
export const leadsApi = {
  create: (leadData: {
    dealership_id?: number | string;
    vehicle_id?: number | string;
    vehicle_title: string;
    vehicle_price?: number;
    nom_client: string;
    email: string;
    telephone: string;
    type_demande?: 'essai' | 'information' | 'offre_reprise' | 'financement' | 'offre_prix';
    date_souhaitee?: string;
    horaire_souhaite?: string;
    message?: string;
    offre_prix_proposee?: number;
    vehicule_reprise_info?: string;
  }) => 
    request<{ success: boolean; data: any; message: string }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    }),

  getAll: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; total: number; count: number; page: number; data: any[] }>(`/leads${queryString}`);
  },

  updateStatus: (id: string | number, statusData: { statut: string; notes_admin?: string }) => 
    request<{ success: boolean; data: any; message: string }>(`/leads/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    })
};

// ====================================================================
// 5. API FAVORIS VÉHICULES
// ====================================================================
export const favoritesApi = {
  getUserFavorites: () => 
    request<{ success: boolean; count: number; favorites: any[] }>('/favorites'),

  add: (vehicleId: string | number) => 
    request<{ success: boolean; message: string; vehicleId: number }>(`/favorites/${vehicleId}`, {
      method: 'POST'
    }),

  remove: (vehicleId: string | number) => 
    request<{ success: boolean; message: string; vehicleId: number }>(`/favorites/${vehicleId}`, {
      method: 'DELETE'
    }),

  check: (vehicleId: string | number) => 
    request<{ success: boolean; isFavorite: boolean }>(`/favorites/check/${vehicleId}`)
};

// ====================================================================
// 6. API GARAGES & SOS DÉPANNAGE 24/7
// ====================================================================
export const garagesApi = {
  getAll: (filters: { commune?: string; specialty?: string; isOpen24h?: boolean | string; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.commune) params.append('commune', filters.commune);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.isOpen24h) params.append('isOpen24h', String(filters.isOpen24h));
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; count: number; garages: any[] }>(`/garages${queryString}`);
  },

  getById: (id: string | number) => 
    request<{ success: boolean; garage: any }>(`/garages/${id}`),

  create: (garageData: any) => 
    request<{ success: boolean; message: string; garageId: number }>('/garages', {
      method: 'POST',
      body: JSON.stringify(garageData)
    }),

  createBreakdownRequest: (requestData: {
    garage_id?: number | string;
    client_name: string;
    client_phone: string;
    commune: string;
    car_model?: string;
    issue_description: string;
    emergency_level?: 'normal' | 'urgent' | 'critique_nuit';
  }) => 
    request<{ success: boolean; message: string; requestId: number }>('/garages/sos-breakdown', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }),

  getBreakdownRequests: () => 
    request<{ success: boolean; count: number; requests: any[] }>('/garages/sos-breakdown/list'),

  updateBreakdownStatus: (id: string | number, status: 'en_attente' | 'pris_en_charge' | 'termine' | 'annule') => 
    request<{ success: boolean; message: string }>(`/garages/sos-breakdown/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
};

// ====================================================================
// 7. API ADMINISTRATION GLOBALE
// ====================================================================
export const adminApi = {
  getStats: () => 
    request<{ success: boolean; stats: any }>('/admin/stats'),

  getUsers: (params: { role?: string; search?: string; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<{ success: boolean; total: number; page: number; limit: number; users: any[] }>(`/admin/users${queryString}`);
  },

  updateUserRole: (id: number | string, role: string) => 
    request<{ success: boolean; message: string }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }),

  deleteUser: (id: number | string) => 
    request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    })
};

// Rétrocompatibilité
export const propertiesApi = vehiclesApi;
export const agenciesApi = dealershipsApi;
