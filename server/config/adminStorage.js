/**
 * Moteur de données et stockage en mémoire pour les fonctionnalités d'Administration :
 * - Marques (Brands)
 * - Modèles (Models)
 * - Signalements (Reports / Flags)
 * - Abonnements (Subscriptions) & Formules (Plans)
 * - Transactions & Paiements (Payments)
 */

const INITIAL_BRANDS = [
  {
    id: 1,
    nom: 'Toyota',
    slug: 'toyota',
    pays: 'Japon',
    logo_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80',
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 2,
    nom: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    pays: 'Allemagne',
    logo_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=120&q=80',
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 3,
    nom: 'Land Rover',
    slug: 'land-rover',
    pays: 'Royaume-Uni',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 4,
    nom: 'Nissan',
    slug: 'nissan',
    pays: 'Japon',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 5,
    nom: 'Ford',
    slug: 'ford',
    pays: 'États-Unis',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 6,
    nom: 'Hyundai',
    slug: 'hyundai',
    pays: 'Corée du Sud',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 7,
    nom: 'Kia',
    slug: 'kia',
    pays: 'Corée du Sud',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 8,
    nom: 'BMW',
    slug: 'bmw',
    pays: 'Allemagne',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 9,
    nom: 'Mitsubishi',
    slug: 'mitsubishi',
    pays: 'Japon',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 10,
    nom: 'Suzuki',
    slug: 'suzuki',
    pays: 'Japon',
    logo_url: null,
    is_popular: 1,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 11,
    nom: 'Peugeot',
    slug: 'peugeot',
    pays: 'France',
    logo_url: null,
    is_popular: 0,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 12,
    nom: 'Volkswagen',
    slug: 'volkswagen',
    pays: 'Allemagne',
    logo_url: null,
    is_popular: 0,
    is_active: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  }
];

const INITIAL_MODELS = [
  {
    id: 1,
    marque_id: 1,
    marque_nom: 'Toyota',
    nom: 'Land Cruiser 300',
    slug: 'land-cruiser-300',
    categorie: 'SUV',
    annee_debut: 2021,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 2,
    marque_id: 1,
    marque_nom: 'Toyota',
    nom: 'Land Cruiser Prado',
    slug: 'land-cruiser-prado',
    categorie: 'SUV',
    annee_debut: 2009,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 3,
    marque_id: 1,
    marque_nom: 'Toyota',
    nom: 'Hilux',
    slug: 'hilux',
    categorie: 'Pick-up',
    annee_debut: 2015,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 4,
    marque_id: 1,
    marque_nom: 'Toyota',
    nom: 'RAV4',
    slug: 'rav4',
    categorie: 'SUV',
    annee_debut: 2019,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 5,
    marque_id: 1,
    marque_nom: 'Toyota',
    nom: 'Fortuner',
    slug: 'fortuner',
    categorie: 'SUV',
    annee_debut: 2016,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 6,
    marque_id: 2,
    marque_nom: 'Mercedes-Benz',
    nom: 'Classe G',
    slug: 'classe-g',
    categorie: 'SUV',
    annee_debut: 2018,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 7,
    marque_id: 2,
    marque_nom: 'Mercedes-Benz',
    nom: 'GLE',
    slug: 'gle',
    categorie: 'SUV',
    annee_debut: 2019,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 8,
    marque_id: 2,
    marque_nom: 'Mercedes-Benz',
    nom: 'Classe E',
    slug: 'classe-e',
    categorie: 'Berline',
    annee_debut: 2016,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 9,
    marque_id: 3,
    marque_nom: 'Land Rover',
    nom: 'Range Rover Sport',
    slug: 'range-rover-sport',
    categorie: 'SUV',
    annee_debut: 2022,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 10,
    marque_id: 3,
    marque_nom: 'Land Rover',
    nom: 'Defender 110',
    slug: 'defender-110',
    categorie: 'SUV',
    annee_debut: 2020,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 11,
    marque_id: 4,
    marque_nom: 'Nissan',
    nom: 'Patrol',
    slug: 'patrol',
    categorie: 'SUV',
    annee_debut: 2020,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 12,
    marque_id: 5,
    marque_nom: 'Ford',
    nom: 'Ranger',
    slug: 'ranger',
    categorie: 'Pick-up',
    annee_debut: 2022,
    annee_fin: null,
    is_popular: 1,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z')
  }
];

const INITIAL_REPORTS = [
  {
    id: 1,
    target_type: 'vehicle',
    target_id: 3,
    target_title: 'Toyota Hilux Revo Double Cabine 4x4',
    reporter_name: 'Patrick Mwamba',
    reporter_email: 'patrick.m@gmail.com',
    reporter_phone: '+243 81 222 3344',
    reason: 'prix_douteux',
    description: 'Le prix affiché semble très en-dessous de la cote du marché. Le vendeur demande un acompte préalable par Mobile Money.',
    status: 'en_attente',
    admin_notes: null,
    treated_by: null,
    treated_at: null,
    created_at: new Date(Date.now() - 3600000 * 24),
    updated_at: new Date(Date.now() - 3600000 * 24)
  },
  {
    id: 2,
    target_type: 'garage',
    target_id: 2,
    target_title: 'Centre Auto Gombe Performance',
    reporter_name: 'Gisèle Kabongo',
    reporter_email: 'gisele.k@entreprise.cd',
    reporter_phone: '+243 99 888 7766',
    reason: 'coordonnees_invalides',
    description: 'Ligne d\'urgence non disponible lors d\'une panne nocturne sur le Boulevard du 30 Juin.',
    status: 'traite',
    admin_notes: 'Numéro d\'astreinte vérifié et actualisé directement avec le responsable d\'atelier.',
    treated_by: 1,
    treated_at: new Date(Date.now() - 3600000 * 12),
    created_at: new Date(Date.now() - 3600000 * 72),
    updated_at: new Date(Date.now() - 3600000 * 12)
  },
  {
    id: 3,
    target_type: 'dealer',
    target_id: 1,
    target_title: 'Auto Prestige Kinshasa',
    reporter_name: 'David Lukusa',
    reporter_email: 'david.l@gmail.com',
    reporter_phone: '+243 82 444 5566',
    reason: 'vehicule_deja_vendu',
    description: 'Un véhicule affiché disponible a déjà été cédé la semaine passée.',
    status: 'en_attente',
    admin_notes: null,
    treated_by: null,
    treated_at: null,
    created_at: new Date(Date.now() - 3600000 * 6),
    updated_at: new Date(Date.now() - 3600000 * 6)
  }
];

const INITIAL_PLANS = [
  {
    id: 'starter',
    nom: 'Formule Découverte Concession',
    type: 'dealership',
    prix_mensuel: 250000,
    prix_usd: 90,
    max_vehicles: 20,
    description: 'Idéal pour petits parcs automobiles et indépendants',
    features: [
      'Jusqu’à 20 véhicules en ligne',
      'Module de réservation d’essais routiers',
      'Générateur d’annonces IA basique',
      'Support par email prioritaire'
    ]
  },
  {
    id: 'pro',
    nom: 'Formule Concession Pro',
    type: 'dealership',
    prix_mensuel: 500000,
    prix_usd: 185,
    max_vehicles: 100,
    description: 'Pour concessions indépendantes à fort volume de vente',
    features: [
      'Jusqu’à 100 véhicules en ligne',
      'IA Gemini intégrée (rédaction illimitée)',
      'Simulateur de financement & reprise',
      'Tableau de bord statistique avancé',
      'Mise en vedette prioritaire',
      'Multi-utilisateurs & gestion des leads'
    ]
  },
  {
    id: 'enterprise',
    nom: 'Formule Groupe Concessionnaire',
    type: 'dealership',
    prix_mensuel: 1000000,
    prix_usd: 370,
    max_vehicles: 999,
    description: 'Pour réseaux de concessions, franchises et grands groupes',
    features: [
      'Véhicules illimités',
      'Multi-sites & concessions associées',
      'Gestionnaire de compte dédié & API',
      'Personnalisation complète de la vitrine',
      'SLA Garanti 99.9%'
    ]
  },
  {
    id: 'garage_starter',
    nom: 'Formule Atelier Indépendant',
    type: 'garage',
    prix_mensuel: 150000,
    prix_usd: 55,
    max_vehicles: 0,
    description: 'Pour mécaniciens indépendants, dépanneurs et ateliers de quartier',
    features: [
      'Fiche d’atelier vérifiée dans l’annuaire',
      'Affichage des spécialités & horaires d’ouverture',
      'Boutons d’appel direct & WhatsApp client sans intermédiaire',
      'Grille tarifaire indicative jusqu’à 5 prestations'
    ]
  },
  {
    id: 'garage_pro',
    nom: 'Formule Garage Expert & SOS 24/7',
    type: 'garage',
    prix_mensuel: 350000,
    prix_usd: 130,
    max_vehicles: 0,
    description: 'Pour ateliers professionnels avec équipe mobile d’intervention sur route',
    features: [
      'Réception prioritaire des alertes SOS Pannes en direct',
      'Badge de confiance « Atelier Certifié & Recommandé »',
      'Dépannage d’urgence mobile 24/7 activé',
      'Positionnement prioritaire dans les 24 communes',
      'Grille tarifaire & galerie photos illimitées'
    ]
  }
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 1,
    entity_type: 'dealership',
    dealership_id: 1,
    garage_id: null,
    user_id: 2,
    entity_nom: 'Auto Prestige Kinshasa',
    plan_id: 'pro',
    plan_nom: 'Formule Concession Pro',
    prix_usd: 185,
    prix_cdf: 500000,
    statut: 'actif',
    date_debut: new Date('2025-01-10T00:00:00Z'),
    date_fin: new Date('2026-01-10T00:00:00Z'),
    renouvellement_auto: 1,
    payment_status: 'paye',
    created_at: new Date('2025-01-10T00:00:00Z'),
    updated_at: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 2,
    entity_type: 'garage',
    dealership_id: null,
    garage_id: 1,
    user_id: 4,
    entity_nom: 'SOS Dépannage Kin Mécanique',
    plan_id: 'garage_pro',
    plan_nom: 'Formule Garage Expert & SOS 24/7',
    prix_usd: 130,
    prix_cdf: 350000,
    statut: 'actif',
    date_debut: new Date('2025-02-01T00:00:00Z'),
    date_fin: new Date('2026-02-01T00:00:00Z'),
    renouvellement_auto: 1,
    payment_status: 'paye',
    created_at: new Date('2025-02-01T00:00:00Z'),
    updated_at: new Date('2025-02-01T00:00:00Z')
  },
  {
    id: 3,
    entity_type: 'dealership',
    dealership_id: 2,
    garage_id: null,
    user_id: 3,
    entity_nom: 'Kinshasa Motors Lubumbashi',
    plan_id: 'starter',
    plan_nom: 'Formule Découverte Concession',
    prix_usd: 90,
    prix_cdf: 250000,
    statut: 'en_attente',
    date_debut: new Date('2026-02-01T00:00:00Z'),
    date_fin: new Date('2026-03-01T00:00:00Z'),
    renouvellement_auto: 0,
    payment_status: 'en_attente',
    created_at: new Date('2026-02-01T00:00:00Z'),
    updated_at: new Date('2026-02-01T00:00:00Z')
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 1,
    transaction_id: 'TXN-202602-001',
    user_id: 2,
    dealership_id: 1,
    garage_id: null,
    entity_nom: 'Auto Prestige Kinshasa',
    client_nom: 'Directeur Général Auto Prestige',
    client_email: 'dealer@congocar.cd',
    amount: 185,
    currency: 'USD',
    payment_method: 'M-Pesa',
    phone_number: '+243 81 222 3344',
    purpose: 'abonnement',
    purpose_label: 'Abonnement Mensuel Concession Pro',
    statut: 'reussi',
    reference: 'MPESA-98721456',
    notes: 'Transaction approuvée instantanément par Vodacom M-Pesa RDC.',
    created_at: new Date('2026-02-10T10:30:00Z'),
    updated_at: new Date('2026-02-10T10:30:00Z')
  },
  {
    id: 2,
    transaction_id: 'TXN-202602-002',
    user_id: 4,
    dealership_id: null,
    garage_id: 1,
    entity_nom: 'SOS Dépannage Kin Mécanique',
    client_nom: 'Responsable Dépannage',
    client_email: 'garage@congocar.cd',
    amount: 130,
    currency: 'USD',
    payment_method: 'Orange Money',
    phone_number: '+243 89 555 0101',
    purpose: 'abonnement',
    purpose_label: 'Abonnement Annuaire & Badge Certifié SOS 24/7',
    statut: 'reussi',
    reference: 'OM-67341902',
    notes: 'Paiement confirmé par la passerelle Orange Money.',
    created_at: new Date('2026-02-15T14:15:00Z'),
    updated_at: new Date('2026-02-15T14:15:00Z')
  },
  {
    id: 3,
    transaction_id: 'TXN-202602-003',
    user_id: 2,
    dealership_id: 1,
    garage_id: null,
    entity_nom: 'Auto Prestige Kinshasa',
    client_nom: 'Auto Prestige Kinshasa',
    client_email: 'dealer@congocar.cd',
    amount: 50,
    currency: 'USD',
    payment_method: 'Airtel Money',
    phone_number: '+243 97 123 4567',
    purpose: 'boost_annonce',
    purpose_label: 'Boost Annonce VIP (Toyota LC 300)',
    statut: 'reussi',
    reference: 'AM-44231876',
    notes: 'Pack mise en avant 14 jours appliqué.',
    created_at: new Date('2026-02-20T09:00:00Z'),
    updated_at: new Date('2026-02-20T09:00:00Z')
  },
  {
    id: 4,
    transaction_id: 'TXN-202602-004',
    user_id: 3,
    dealership_id: 2,
    garage_id: null,
    entity_nom: 'Kinshasa Motors Lubumbashi',
    client_nom: 'Kinshasa Motors',
    client_email: 'contact@kinshasamotors.cd',
    amount: 90,
    currency: 'USD',
    payment_method: 'Carte Bancaire',
    phone_number: '+243 82 444 5566',
    purpose: 'abonnement',
    purpose_label: 'Renouvellement Formule Découverte',
    statut: 'en_attente',
    reference: 'VISA-88390123',
    notes: 'Autorisation 3D Secure en attente de validation.',
    created_at: new Date('2026-02-25T16:45:00Z'),
    updated_at: new Date('2026-02-25T16:45:00Z')
  }
];

function initAdminStore(store) {
  if (!store.marques) store.marques = [...INITIAL_BRANDS];
  if (!store.modeles) store.modeles = [...INITIAL_MODELS];
  if (!store.reports) store.reports = [...INITIAL_REPORTS];
  if (!store.plans) store.plans = [...INITIAL_PLANS];
  if (!store.subscriptions) store.subscriptions = [...INITIAL_SUBSCRIPTIONS];
  if (!store.payments) store.payments = [...INITIAL_PAYMENTS];
}

function handleAdminStoreQuery(normalizedSql, rawSql, params, memoryStore) {
  initAdminStore(memoryStore);

  // 1. MARQUES / BRANDS
  if (normalizedSql.includes('FROM MARQUES') || normalizedSql.includes('FROM BRANDS')) {
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      return [{ total: memoryStore.marques.length }];
    }
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.marques;
    }
  }

  // 2. MODELES / MODELS
  if (normalizedSql.includes('FROM MODELES') || normalizedSql.includes('FROM MODELS')) {
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      return [{ total: memoryStore.modeles.length }];
    }
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.modeles;
    }
  }

  // 3. REPORTS / SIGNALEMENTS
  if (normalizedSql.includes('FROM REPORTS') || normalizedSql.includes('FROM SIGNALEMENTS')) {
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      return [{ total: memoryStore.reports.length }];
    }
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.reports;
    }
  }

  // 4. SUBSCRIPTIONS / ABONNEMENTS
  if (normalizedSql.includes('FROM SUBSCRIPTIONS') || normalizedSql.includes('FROM ABONNEMENTS')) {
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      return [{ total: memoryStore.subscriptions.length }];
    }
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.subscriptions;
    }
  }

  // 5. PAYMENTS / PAIEMENTS
  if (normalizedSql.includes('FROM PAYMENTS') || normalizedSql.includes('FROM PAIEMENTS')) {
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      return [{ total: memoryStore.payments.length }];
    }
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.payments;
    }
  }

  // 6. PLANS
  if (normalizedSql.includes('FROM PLANS') || normalizedSql.includes('FROM SUBSCRIPTION_PLANS')) {
    if (normalizedSql.startsWith('SELECT')) {
      return memoryStore.plans;
    }
  }

  return null;
}

// Helpers CRUD directs pour contrôleurs en mode mémoire ou hybride
const adminStorage = {
  // MARQUES
  getBrands: (store, { search, is_popular } = {}) => {
    initAdminStore(store);
    let list = [...store.marques];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(b => b.nom.toLowerCase().includes(s) || (b.pays && b.pays.toLowerCase().includes(s)));
    }
    if (is_popular !== undefined && is_popular !== null && is_popular !== '') {
      list = list.filter(b => Number(b.is_popular) === Number(is_popular));
    }
    return list;
  },
  getBrandById: (store, id) => {
    initAdminStore(store);
    return store.marques.find(b => Number(b.id) === Number(id)) || null;
  },
  createBrand: (store, data) => {
    initAdminStore(store);
    const newId = store.marques.length > 0 ? Math.max(...store.marques.map(b => Number(b.id))) + 1 : 1;
    const brand = {
      id: newId,
      nom: data.nom,
      slug: data.slug || data.nom.toLowerCase().replace(/\s+/g, '-'),
      pays: data.pays || 'International',
      logo_url: data.logo_url || null,
      is_popular: data.is_popular ? 1 : 0,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    store.marques.push(brand);
    return brand;
  },
  updateBrand: (store, id, data) => {
    initAdminStore(store);
    const idx = store.marques.findIndex(b => Number(b.id) === Number(id));
    if (idx === -1) return null;
    const updated = {
      ...store.marques[idx],
      ...data,
      updated_at: new Date()
    };
    store.marques[idx] = updated;
    return updated;
  },
  deleteBrand: (store, id) => {
    initAdminStore(store);
    const idx = store.marques.findIndex(b => Number(b.id) === Number(id));
    if (idx === -1) return false;
    store.marques.splice(idx, 1);
    return true;
  },

  // MODELES
  getModels: (store, { marque_id, search, categorie } = {}) => {
    initAdminStore(store);
    let list = [...store.modeles];
    if (marque_id) {
      list = list.filter(m => Number(m.marque_id) === Number(marque_id));
    }
    if (categorie) {
      list = list.filter(m => String(m.categorie).toLowerCase() === String(categorie).toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(m => m.nom.toLowerCase().includes(s) || (m.marque_nom && m.marque_nom.toLowerCase().includes(s)));
    }
    return list;
  },
  getModelById: (store, id) => {
    initAdminStore(store);
    return store.modeles.find(m => Number(m.id) === Number(id)) || null;
  },
  createModel: (store, data) => {
    initAdminStore(store);
    const brand = store.marques.find(b => Number(b.id) === Number(data.marque_id));
    const newId = store.modeles.length > 0 ? Math.max(...store.modeles.map(m => Number(m.id))) + 1 : 1;
    const model = {
      id: newId,
      marque_id: Number(data.marque_id),
      marque_nom: brand ? brand.nom : (data.marque_nom || 'Inconnue'),
      nom: data.nom,
      slug: data.slug || data.nom.toLowerCase().replace(/\s+/g, '-'),
      categorie: data.categorie || 'SUV',
      annee_debut: Number(data.annee_debut) || 2020,
      annee_fin: data.annee_fin ? Number(data.annee_fin) : null,
      is_popular: data.is_popular ? 1 : 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    store.modeles.push(model);
    return model;
  },
  updateModel: (store, id, data) => {
    initAdminStore(store);
    const idx = store.modeles.findIndex(m => Number(m.id) === Number(id));
    if (idx === -1) return null;
    let marque_nom = store.modeles[idx].marque_nom;
    if (data.marque_id) {
      const b = store.marques.find(br => Number(br.id) === Number(data.marque_id));
      if (b) marque_nom = b.nom;
    }
    const updated = {
      ...store.modeles[idx],
      ...data,
      marque_nom,
      updated_at: new Date()
    };
    store.modeles[idx] = updated;
    return updated;
  },
  deleteModel: (store, id) => {
    initAdminStore(store);
    const idx = store.modeles.findIndex(m => Number(m.id) === Number(id));
    if (idx === -1) return false;
    store.modeles.splice(idx, 1);
    return true;
  },

  // SIGNALEMENTS / REPORTS
  getReports: (store, { status, target_type, search } = {}) => {
    initAdminStore(store);
    let list = [...store.reports];
    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }
    if (target_type && target_type !== 'all') {
      list = list.filter(r => r.target_type === target_type);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        (r.target_title && r.target_title.toLowerCase().includes(s)) ||
        (r.reporter_name && r.reporter_name.toLowerCase().includes(s)) ||
        (r.description && r.description.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getReportById: (store, id) => {
    initAdminStore(store);
    return store.reports.find(r => Number(r.id) === Number(id)) || null;
  },
  createReport: (store, data) => {
    initAdminStore(store);
    const newId = store.reports.length > 0 ? Math.max(...store.reports.map(r => Number(r.id))) + 1 : 1;
    const report = {
      id: newId,
      target_type: data.target_type || 'vehicle',
      target_id: Number(data.target_id),
      target_title: data.target_title || 'Élément signalé',
      reporter_name: data.reporter_name || 'Anonyme',
      reporter_email: data.reporter_email || null,
      reporter_phone: data.reporter_phone || null,
      reason: data.reason || 'autre',
      description: data.description || '',
      status: 'en_attente',
      admin_notes: null,
      treated_by: null,
      treated_at: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    store.reports.push(report);
    return report;
  },
  updateReportStatus: (store, id, { status, admin_notes, treated_by }) => {
    initAdminStore(store);
    const idx = store.reports.findIndex(r => Number(r.id) === Number(id));
    if (idx === -1) return null;
    const updated = {
      ...store.reports[idx],
      status: status || store.reports[idx].status,
      admin_notes: admin_notes !== undefined ? admin_notes : store.reports[idx].admin_notes,
      treated_by: treated_by || store.reports[idx].treated_by,
      treated_at: status && status !== 'en_attente' ? new Date() : store.reports[idx].treated_at,
      updated_at: new Date()
    };
    store.reports[idx] = updated;
    return updated;
  },
  deleteReport: (store, id) => {
    initAdminStore(store);
    const idx = store.reports.findIndex(r => Number(r.id) === Number(id));
    if (idx === -1) return false;
    store.reports.splice(idx, 1);
    return true;
  },

  // PLANS & FORMULES
  getPlans: (store) => {
    initAdminStore(store);
    return [...store.plans];
  },

  // ABONNEMENTS / SUBSCRIPTIONS
  getSubscriptions: (store, { entity_type, statut, search } = {}) => {
    initAdminStore(store);
    let list = [...store.subscriptions];
    if (entity_type && entity_type !== 'all') {
      list = list.filter(s => s.entity_type === entity_type);
    }
    if (statut && statut !== 'all') {
      list = list.filter(s => s.statut === statut);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.entity_nom && s.entity_nom.toLowerCase().includes(q)) ||
        (s.plan_nom && s.plan_nom.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getSubscriptionById: (store, id) => {
    initAdminStore(store);
    return store.subscriptions.find(s => Number(s.id) === Number(id)) || null;
  },
  createSubscription: (store, data) => {
    initAdminStore(store);
    const newId = store.subscriptions.length > 0 ? Math.max(...store.subscriptions.map(s => Number(s.id))) + 1 : 1;
    const plan = store.plans.find(p => p.id === data.plan_id);
    const now = new Date();
    const dateFin = data.date_fin ? new Date(data.date_fin) : new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    const sub = {
      id: newId,
      entity_type: data.entity_type || 'dealership',
      dealership_id: data.dealership_id ? Number(data.dealership_id) : null,
      garage_id: data.garage_id ? Number(data.garage_id) : null,
      user_id: data.user_id ? Number(data.user_id) : null,
      entity_nom: data.entity_nom || (data.entity_type === 'garage' ? 'Garage Client' : 'Concession Client'),
      plan_id: data.plan_id || 'starter',
      plan_nom: plan ? plan.nom : 'Formule Pro',
      prix_usd: Number(data.prix_usd || (plan ? plan.prix_usd : 100)),
      prix_cdf: Number(data.prix_cdf || (plan ? plan.prix_mensuel : 270000)),
      statut: data.statut || 'actif',
      date_debut: data.date_debut ? new Date(data.date_debut) : now,
      date_fin: dateFin,
      renouvellement_auto: data.renouvellement_auto !== undefined ? (data.renouvellement_auto ? 1 : 0) : 1,
      payment_status: data.payment_status || 'paye',
      created_at: now,
      updated_at: now
    };
    store.subscriptions.push(sub);
    return sub;
  },
  updateSubscription: (store, id, data) => {
    initAdminStore(store);
    const idx = store.subscriptions.findIndex(s => Number(s.id) === Number(id));
    if (idx === -1) return null;
    let plan_nom = store.subscriptions[idx].plan_nom;
    if (data.plan_id) {
      const p = store.plans.find(pl => pl.id === data.plan_id);
      if (p) plan_nom = p.nom;
    }
    const updated = {
      ...store.subscriptions[idx],
      ...data,
      plan_nom,
      date_fin: data.date_fin ? new Date(data.date_fin) : store.subscriptions[idx].date_fin,
      updated_at: new Date()
    };
    store.subscriptions[idx] = updated;
    return updated;
  },
  deleteSubscription: (store, id) => {
    initAdminStore(store);
    const idx = store.subscriptions.findIndex(s => Number(s.id) === Number(id));
    if (idx === -1) return false;
    store.subscriptions.splice(idx, 1);
    return true;
  },

  // PAIEMENTS / PAYMENTS
  getPayments: (store, { statut, payment_method, purpose, search } = {}) => {
    initAdminStore(store);
    let list = [...store.payments];
    if (statut && statut !== 'all') {
      list = list.filter(p => p.statut === statut);
    }
    if (payment_method && payment_method !== 'all') {
      list = list.filter(p => p.payment_method && p.payment_method.toLowerCase() === payment_method.toLowerCase());
    }
    if (purpose && purpose !== 'all') {
      list = list.filter(p => p.purpose === purpose);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.transaction_id && p.transaction_id.toLowerCase().includes(q)) ||
        (p.entity_nom && p.entity_nom.toLowerCase().includes(q)) ||
        (p.client_nom && p.client_nom.toLowerCase().includes(q)) ||
        (p.reference && p.reference.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getPaymentById: (store, id) => {
    initAdminStore(store);
    return store.payments.find(p => Number(p.id) === Number(id) || p.transaction_id === id) || null;
  },
  createPayment: (store, data) => {
    initAdminStore(store);
    const newId = store.payments.length > 0 ? Math.max(...store.payments.map(p => Number(p.id))) + 1 : 1;
    const now = new Date();
    const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const txnCode = `TXN-${dateCode}-${String(newId).padStart(3, '0')}`;
    const payment = {
      id: newId,
      transaction_id: data.transaction_id || txnCode,
      user_id: data.user_id ? Number(data.user_id) : null,
      dealership_id: data.dealership_id ? Number(data.dealership_id) : null,
      garage_id: data.garage_id ? Number(data.garage_id) : null,
      entity_nom: data.entity_nom || 'Client CONGOCAR',
      client_nom: data.client_nom || 'Client Partenaire',
      client_email: data.client_email || null,
      amount: Number(data.amount) || 0,
      currency: data.currency || 'USD',
      payment_method: data.payment_method || 'M-Pesa',
      phone_number: data.phone_number || null,
      purpose: data.purpose || 'abonnement',
      purpose_label: data.purpose_label || 'Paiement de service automobile',
      statut: data.statut || 'reussi',
      reference: data.reference || `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: data.notes || '',
      created_at: now,
      updated_at: now
    };
    store.payments.push(payment);
    return payment;
  },
  updatePaymentStatus: (store, id, { statut, notes }) => {
    initAdminStore(store);
    const idx = store.payments.findIndex(p => Number(p.id) === Number(id) || p.transaction_id === id);
    if (idx === -1) return null;
    const updated = {
      ...store.payments[idx],
      statut: statut || store.payments[idx].statut,
      notes: notes !== undefined ? notes : store.payments[idx].notes,
      updated_at: new Date()
    };
    store.payments[idx] = updated;
    return updated;
  }
};

module.exports = {
  INITIAL_BRANDS,
  INITIAL_MODELS,
  INITIAL_REPORTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PAYMENTS,
  initAdminStore,
  handleAdminStoreQuery,
  adminStorage
};

