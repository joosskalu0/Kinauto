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

  return null;
}

module.exports = {
  INITIAL_BRANDS,
  INITIAL_MODELS,
  INITIAL_REPORTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PAYMENTS,
  initAdminStore,
  handleAdminStoreQuery
};

