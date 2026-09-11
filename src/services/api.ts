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
  return localStorage.getItem('congocar_token') || localStorage.getItem('autoconcession_token');
};

/**
 * Sauvegarder le jeton JWT
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('congocar_token', token);
  localStorage.setItem('autoconcession_token', token);
};

/**
 * Supprimer le jeton JWT (Déconnexion)
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('congocar_token');
  localStorage.removeItem('congocar_user');
  localStorage.removeItem('autoconcession_token');
  localStorage.removeItem('autoconcession_user');
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
// 1. API AUTHENTIFICATION NODE.JS + MYSQL (CONGOCAR)
// ====================================================================
export const authApi = {
  // Connexion
  login: (credentials: { email: string; password: string }) => 
    request<{ success: boolean; data: { token: string; user: any }; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  // Inscription
  register: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: 'admin' | 'dealer' | 'seller' | 'garage' | 'user'; 
    phone?: string;
    city?: string;
    dealershipName?: string;
    garageName?: string;
    commune?: string;
  }) => 
    request<{ success: boolean; data: { token: string; user: any }; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  // Déconnexion
  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST'
    }),

  // Demande de code/token de réinitialisation de mot de passe
  forgotPassword: (data: { email: string }) =>
    request<{ success: boolean; message: string; data?: { email: string; resetCode?: string; resetToken?: string } }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Réinitialisation du mot de passe avec code et nouveau mot de passe
  resetPassword: (data: { email: string; code?: string; token?: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Obtenir le profil de l'utilisateur connecté via JWT
  getMe: () => 
    request<{ success: boolean; data: any }>('/auth/me'),

  // Mettre à jour le profil ou changer le mot de passe
  updateProfile: (profileData: { name?: string; phone?: string; city?: string; avatar?: string; currentPassword?: string; newPassword?: string }) =>
    request<{ success: boolean; data: any; message?: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  // Gestion des rôles (Admin uniquement) : Liste des utilisateurs
  getUsers: () =>
    request<{ success: boolean; total: number; data: any[] }>('/auth/users'),

  // Gestion des rôles (Admin uniquement) : Mise à jour du rôle
  updateUserRole: (userId: number | string, role: 'admin' | 'dealer' | 'seller' | 'garage' | 'user') =>
    request<{ success: boolean; message: string; data: any }>(`/auth/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }),

  // Liste des définitions de rôles
  getRoles: () =>
    request<{ success: boolean; roles: Array<{ id: string; label: string; description: string }> }>('/auth/roles')
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
    }),

  // Actions dédiées Concessionnaire Connecté & Gestion Stock/Stats/Leads
  getProfile: () => 
    request<{ success: boolean; has_dealership?: boolean; data: any; message?: string }>('/dealers/me'),

  createProfile: (dealershipData: any) =>
    request<{ success: boolean; data: any; message: string }>('/dealers', {
      method: 'POST',
      body: JSON.stringify(dealershipData)
    }),

  updateProfile: (dealershipData: any) =>
    request<{ success: boolean; data: any; message: string }>('/dealers/me', {
      method: 'PUT',
      body: JSON.stringify(dealershipData)
    }),

  getStock: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; summary: any; count: number; page: number; limit: number; data: any[] }>(`/dealers/me/stock${queryString}`);
  },

  addVehicle: (vehicleData: any) =>
    request<{ success: boolean; data: any; message: string }>('/dealers/me/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    }),

  updateStockStatus: (vehicleId: string | number, stockData: { status?: string; prix?: number; en_promo?: boolean; prix_promo?: number; en_vedette?: boolean }) =>
    request<{ success: boolean; data: any; message: string }>(`/dealers/stock/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(stockData)
    }),

  getStats: () =>
    request<{ success: boolean; dealership: any; inventory: any; engagement: any; inquiries: any; top_viewed_vehicles: any[] }>('/dealers/me/stats'),

  getInquiries: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; count: number; unread_count: number; total: number; page: number; limit: number; data: any[] }>(`/dealers/me/inquiries${queryString}`);
  },

  updateInquiryStatus: (inquiryId: string | number, data: { statut?: string; notes_internes?: string }) =>
    request<{ success: boolean; data: any; message: string }>(`/dealers/inquiries/${inquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  sendCustomerInquiry: (dealershipId: string | number, inquiryData: any) =>
    request<{ success: boolean; reference_number: string; data: any; message: string }>(`/dealers/${dealershipId}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    })
};

export const dealersApi = dealershipsApi;

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
  getAll: (filters: { commune?: string; ville?: string; specialty?: string; isOpen24h?: boolean | string; search?: string; statut_validation?: string; admin_view?: boolean | string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.commune) params.append('commune', filters.commune);
    if (filters.ville) params.append('ville', filters.ville);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.isOpen24h !== undefined) params.append('isOpen24h', String(filters.isOpen24h));
    if (filters.search) params.append('search', filters.search);
    if (filters.statut_validation) params.append('statut_validation', filters.statut_validation);
    if (filters.admin_view !== undefined) params.append('admin_view', String(filters.admin_view));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; total: number; count: number; page: number; totalPages: number; data: any[]; garages: any[] }>(`/garages${queryString}`);
  },

  getById: (id: string | number) => 
    request<{ success: boolean; data: any; garage: any }>(`/garages/${id}`),

  getMyProfile: () =>
    request<{ success: boolean; has_garage: boolean; data: any; message?: string }>('/garages/me'),

  updateMyProfile: (garageData: any) =>
    request<{ success: boolean; message: string; data: any }>('/garages/me', {
      method: 'PUT',
      body: JSON.stringify(garageData)
    }),

  register: (garageData: any) => 
    request<{ success: boolean; message: string; data: any; garageId: number }>('/garages/register', {
      method: 'POST',
      body: JSON.stringify(garageData)
    }),

  create: (garageData: any) => 
    request<{ success: boolean; message: string; data: any; garageId: number }>('/garages', {
      method: 'POST',
      body: JSON.stringify(garageData)
    }),

  update: (id: string | number, garageData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/garages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(garageData)
    }),

  validate: (id: string | number, validationData: { statut: 'valide' | 'rejete' | 'en_attente'; motif_rejet?: string }) =>
    request<{ success: boolean; message: string; data: any }>(`/garages/${id}/validate`, {
      method: 'PATCH',
      body: JSON.stringify(validationData)
    }),

  getServices: (garageId: string | number) =>
    request<{ success: boolean; garage_id: number; count: number; data: any[] }>(`/garages/${garageId}/services`),

  addService: (garageId: string | number, serviceData: { nom: string; description?: string; prix_indicatif?: number; duree_estimee?: string; icone?: string; is_disponible?: boolean }) =>
    request<{ success: boolean; message: string; data: any }>(`/garages/${garageId}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData)
    }),

  deleteService: (serviceId: string | number) =>
    request<{ success: boolean; message: string }>(`/garages/services/${serviceId}`, {
      method: 'DELETE'
    }),

  getPhotos: (garageId: string | number) =>
    request<{ success: boolean; garage_id: number; count: number; data: any[] }>(`/garages/${garageId}/photos`),

  addPhoto: (garageId: string | number, photoData: { image_url: string; titre?: string; is_primary?: boolean; display_order?: number }) =>
    request<{ success: boolean; message: string; photoId: number; data: any }>(`/garages/${garageId}/photos`, {
      method: 'POST',
      body: JSON.stringify(photoData)
    }),

  deletePhoto: (photoId: string | number) =>
    request<{ success: boolean; message: string }>(`/garages/photos/${photoId}`, {
      method: 'DELETE'
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
    request<{ success: boolean; message: string; requestId: number; data?: any }>('/garages/sos-breakdown', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }),

  getBreakdownRequests: () => 
    request<{ success: boolean; count: number; requests: any[]; data?: any[] }>('/garages/sos-breakdown/list'),

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
