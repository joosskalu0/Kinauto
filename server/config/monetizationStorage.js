/**
 * Configuration et Données du Module de Monétisation AutoKin / AutoConcession
 * 
 * Modèles économiques complets :
 * 1. Annonces Gratuites (3 annonces actives max pour les particuliers)
 * 2. Annonces Premium & Visibilité avec durées configurables (3, 7, 15, 30 jours) :
 *    - À la une (featured)
 *    - Annonce sponsorisée (sponsored)
 *    - Remonter l'annonce dans les résultats (bump)
 *    - Badge "Premium" (badge_premium)
 * 3. Abonnements Professionnels (Concessionnaires, Vendeurs Pro, Garages)
 * 4. Système de Paiement Sécurisé (Statuts PENDING, PAID, FAILED, CANCELLED, EXPIRED)
 * 5. Régie Publicitaire (homepage, search_results, vehicle_detail, sidebar, banner)
 * 6. Automatisation des Expirations
 */

// 1. ANNONCES GRATUITES - CONFIGURATION
const FREE_LISTINGS_CONFIG = {
  max_active_listings: 3, // Limite stricte pour les particuliers
  duration_days: 30,
  max_photos: 5,
  description: "Publication sans frais pour les particuliers : jusqu'à 3 annonces actives simultanément."
};

// 2. ANNONCES PREMIUM & OPTIONS DE PROMOTION (Durées : 3, 7, 15 ou 30 jours)
const PROMOTION_OPTIONS = {
  featured: {
    id: 'featured',
    code: 'A_LA_UNE',
    nom: 'À la Une (Vedette & Carrousel VIP)',
    badge_label: '🔥 À LA UNE',
    description: 'Affichage prioritaire en page d’accueil dans le carrousel VIP, tête de tous les résultats de recherche et cadre mis en avant.',
    type: 'featured',
    durees: [
      { jours: 3, prix_usd: 7, prix_fc: 19950 },
      { jours: 7, prix_usd: 12, prix_fc: 34200, is_popular: true },
      { jours: 15, prix_usd: 22, prix_fc: 62700 },
      { jours: 30, prix_usd: 39, prix_fc: 111150 }
    ],
    avantages: [
      'Positionnement n°1 en page d’accueil',
      'Carrousel dynamique consulté par 100% des visiteurs',
      'Badge flamboyant « 🔥 À LA UNE »',
      'x5 demandes de contacts WhatsApp'
    ]
  },
  sponsored: {
    id: 'sponsored',
    code: 'SPONSORISEE',
    nom: 'Annonce Sponsorisée',
    badge_label: '⚡ SPONSORISÉ',
    description: 'Mise en avant sponsorisée dans toutes les recherches avec étiquette dédiée et affichage sur les fiches de véhicules concurrents.',
    type: 'sponsored',
    durees: [
      { jours: 3, prix_usd: 5, prix_fc: 14250 },
      { jours: 7, prix_usd: 9, prix_fc: 25650, is_popular: true },
      { jours: 15, prix_usd: 16, prix_fc: 45600 },
      { jours: 30, prix_usd: 28, prix_fc: 79800 }
    ],
    avantages: [
      'Bandeau sponsorisé distinctif',
      'Affichage prioritaire dans la catégorie',
      'Recommandé aux acheteurs de la même marque',
      'Taux de clics +85%'
    ]
  },
  bump: {
    id: 'bump',
    code: 'REMONTEE',
    nom: 'Remonter l’annonce dans les résultats',
    badge_label: '⬆️ ACTUALISÉ',
    description: 'Repositionne instantanément l’annonce en 1ère place du catalogue comme une nouvelle publication toute fraîche.',
    type: 'bump',
    durees: [
      { jours: 3, prix_usd: 3, prix_fc: 8550 },
      { jours: 7, prix_usd: 5, prix_fc: 14250, is_popular: true },
      { jours: 15, prix_usd: 9, prix_fc: 25650 },
      { jours: 30, prix_usd: 15, prix_fc: 42750 }
    ],
    avantages: [
      'Remontée instantanée en tête de liste',
      'Date de publication rafraîchie à aujourd’hui',
      'Visibilité renouvelée pour les acheteurs récents',
      'Idéal pour relancer une vente'
    ]
  },
  badge_premium: {
    id: 'badge_premium',
    code: 'BADGE_PREMIUM',
    nom: 'Badge « Premium » Doré & Cadre VIP',
    badge_label: '⭐ PREMIUM',
    description: 'Liseré or scintillant autour de la photo et macaron officiel Premium pour inspirer une confiance absolue.',
    type: 'badge_premium',
    durees: [
      { jours: 3, prix_usd: 4, prix_fc: 11400 },
      { jours: 7, prix_usd: 7, prix_fc: 19950, is_popular: true },
      { jours: 15, prix_usd: 12, prix_fc: 34200 },
      { jours: 30, prix_usd: 20, prix_fc: 57000 }
    ],
    avantages: [
      'Cadre doré distinctif haute finition',
      'Badge officiel « ⭐ PREMIUM »',
      'Rassure les acheteurs avec liquidités',
      'Jusqu’à 15 photos haute définition'
    ]
  }
};

// 3. ABONNEMENTS PROFESSIONNELS (Concessionnaires, Vendeurs Pro, Garages)
const SUBSCRIPTION_PLANS = {
  dealers: [
    {
      id: 'starter',
      code: 'DEALER_STARTER',
      nom: 'Formule Découverte Concession',
      target: 'concessionnaires',
      prix_mensuel_usd: 49,
      prix_annuel_usd: 490,
      prix_mensuel_fc: 139650,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 15,
      annonces_vedettes_incluses: 1,
      commission: '0%',
      is_active: 1,
      description: 'Pour démarrer la vitrine en ligne de votre parc automobile.',
      fonctionnalites: [
        'Jusqu’à 15 annonces en ligne en simultané',
        '1 annonce « À la Une » incluse chaque mois',
        'Vitrine concessionnaire personnalisée (logo, adresse, horaires)',
        'Formulaire de contact WhatsApp direct',
        'Générateur d’annonces avec IA Gemini',
        'Support technique 6j/7'
      ]
    },
    {
      id: 'pro',
      code: 'DEALER_PRO',
      nom: 'Formule Concessionnaire Pro',
      target: 'concessionnaires',
      prix_mensuel_usd: 99,
      prix_annuel_usd: 990,
      prix_mensuel_fc: 282150,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 50,
      annonces_vedettes_incluses: 5,
      commission: '0%',
      is_popular: true,
      is_active: 1,
      description: 'La formule plébiscitée par les showrooms actifs à Kinshasa.',
      fonctionnalites: [
        'Jusqu’à 50 annonces simultanées',
        '5 annonces « À la Une » incluses chaque mois',
        'Toutes les annonces bénéficient du statut « ⭐ PREMIUM »',
        'Module de réservation d’essais routiers et offres de reprise',
        'Tableau de bord CRM complet avec gestion des leads',
        'Rapports statistiques de visites et d’engagement',
        'Badge « Concessionnaire Officiel Vérifié »',
        'Support prioritaire 7j/7'
      ]
    },
    {
      id: 'enterprise',
      code: 'DEALER_ELITE',
      nom: 'Formule Élite & Réseau Multi-Sites',
      target: 'concessionnaires',
      prix_mensuel_usd: 199,
      prix_annuel_usd: 1990,
      prix_mensuel_fc: 567150,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 999, // Illimité
      annonces_vedettes_incluses: 15,
      commission: '0%',
      is_active: 1,
      description: 'La formule sans limite de stock avec accompagnement stratégique dédié.',
      fonctionnalites: [
        'Nombre d’annonces illimité (999+)',
        '15 annonces « À la Une » incluses chaque mois',
        'Gestion multi-vendeurs et gestionnaire de flotte',
        'Flux d’import / export automatique d’inventaire (API / XML / Excel)',
        'Bannière publicitaire offerte sur la plateforme',
        'Chargé de compte dédié avec interventions sur site',
        'Accès prioritaire aux leads d’acheteurs qualifiés',
        'SLA Garanti avec disponibilité 99.9%'
      ]
    }
  ],
  sellers: [
    {
      id: 'seller_starter',
      code: 'SELLER_STARTER',
      nom: 'Vendeur Indépendant Actif',
      target: 'vendeurs_pro',
      prix_mensuel_usd: 29,
      prix_annuel_usd: 290,
      prix_mensuel_fc: 82650,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 10,
      annonces_vedettes_incluses: 1,
      commission: '0%',
      is_active: 1,
      description: 'Pour les courtiers et intermédiaires automobiles indépendants.',
      fonctionnalites: [
        'Jusqu’à 10 annonces simultanées (contre 3 pour un particulier)',
        '1 mise en avant « À la Une » par mois',
        'Badge « Vendeur Indépendant Agréé »',
        'Liaison directe avec WhatsApp des acheteurs',
        'Statistiques de consultation des annonces'
      ]
    },
    {
      id: 'seller_pro',
      code: 'SELLER_PRO',
      nom: 'Courtier Automobile Pro',
      target: 'vendeurs_pro',
      prix_mensuel_usd: 59,
      prix_annuel_usd: 590,
      prix_mensuel_fc: 168150,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 25,
      annonces_vedettes_incluses: 3,
      commission: '0%',
      is_popular: true,
      is_active: 1,
      description: 'La solution professionnelle pour vendre un flux régulier de véhicules.',
      fonctionnalites: [
        'Jusqu’à 25 annonces simultanées',
        '3 annonces « À la Une » par mois',
        'Remontée automatique hebdomadaire de tout le stock',
        'Badge « Courtier Pro Vérifié »',
        'Gestion des offres de reprise en direct'
      ]
    }
  ],
  garages: [
    {
      id: 'garage_starter',
      code: 'GARAGE_STARTER',
      nom: 'Référencement Atelier Découverte',
      target: 'garages',
      prix_mensuel_usd: 0,
      prix_annuel_usd: 0,
      prix_mensuel_fc: 0,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 0,
      is_active: 1,
      description: 'Présence essentielle dans l’annuaire automobile des 24 communes.',
      fonctionnalites: [
        'Fiche d’atelier standard dans l’annuaire',
        'Affichage des spécialités principales et localisation',
        'Numéro de téléphone et contact direct',
        'Affichage jusqu’à 3 tarifs indicatifs'
      ]
    },
    {
      id: 'garage_pro',
      code: 'GARAGE_PRO',
      nom: 'Formule Garage Agréé & SOS Direct',
      target: 'garages',
      prix_mensuel_usd: 39,
      prix_annuel_usd: 390,
      prix_mensuel_fc: 111150,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 0,
      is_popular: true,
      is_active: 1,
      description: 'Recevez les demandes de dépannage en direct sur WhatsApp et rassurez vos clients.',
      fonctionnalites: [
        'Badge de confiance « 🛡️ Atelier Agréé & Vérifié »',
        'Réception prioritaire des alertes SOS Dépannage par commune',
        'Bouton d’appel d’urgence WhatsApp direct 24/7',
        'Galerie photos de l’atelier et des équipements (ponts, valises de diagnostic)',
        'Grille tarifaire complète sans limitation',
        'Gestion des avis clients'
      ]
    },
    {
      id: 'garage_enterprise',
      code: 'GARAGE_ENTERPRISE',
      nom: 'Centre Auto & Flotte SOS 24/7',
      target: 'garages',
      prix_mensuel_usd: 89,
      prix_annuel_usd: 890,
      prix_mensuel_fc: 253650,
      devise: 'USD',
      duree: 'mensuel',
      nombre_max_annonces: 0,
      is_active: 1,
      description: 'Positionnement numéro 1 sur le service de remorquage et assistance routière.',
      fonctionnalites: [
        'Positionnement prioritaire en tête de liste pour les pannes urgentes',
        'Équipe mobile de dépannage mise en avant sur la carte interactive',
        'Bannière partenaire native dans l’onglet SOS Dépannage',
        'Gestion de plusieurs véhicules d’assistance et remorqueuses',
        'Rapports mensuels des interventions générées',
        'Assistance technique et support prioritaire 7j/7'
      ]
    }
  ]
};

// 4. RÉGIE PUBLICITAIRE - EMPLACEMENTS ET TARIFS
const AD_PLACEMENTS = [
  {
    id: 'homepage',
    code: 'homepage',
    nom: 'Bannière Grand Format Page d’Accueil',
    dimensions: '728 x 90 px (Desktop) / 320 x 100 px (Mobile)',
    emplacement: 'homepage',
    format: 'banner_leaderboard',
    tarif_mensuel_usd: 150,
    impressions_estimees: '50 000 / mois',
    description: 'Visibilité maximale dès l’ouverture de la plateforme par tous les visiteurs.'
  },
  {
    id: 'search_results',
    code: 'search_results',
    nom: 'Bannière Native Résultats de Recherche',
    dimensions: '970 x 250 px / Grille catalogue responsive',
    emplacement: 'search_results',
    format: 'banner_inline',
    tarif_mensuel_usd: 120,
    impressions_estimees: '70 000 / mois',
    description: 'Parfaitement intégrée au flux de recherche automobile, intercalée tous les 6 véhicules.'
  },
  {
    id: 'vehicle_detail',
    code: 'vehicle_detail',
    nom: 'Pavé Exclusif Fiche Véhicule',
    dimensions: '300 x 250 px',
    emplacement: 'vehicle_detail',
    format: 'sidebar_box',
    tarif_mensuel_usd: 90,
    impressions_estimees: '35 000 / mois',
    description: 'Cible les acheteurs hautement qualifiés qui consultent le détail d’un véhicule.'
  },
  {
    id: 'sidebar',
    code: 'sidebar',
    nom: 'Colonne Latérale Filtres & Navigation',
    dimensions: '250 x 250 px ou 300 x 600 px',
    emplacement: 'sidebar',
    format: 'sidebar_box',
    tarif_mensuel_usd: 80,
    impressions_estimees: '30 000 / mois',
    description: 'Présence permanente sur la barre latérale lors de l’application des filtres.'
  },
  {
    id: 'banner',
    code: 'banner',
    nom: 'Bannière Globale En-Tête du Site',
    dimensions: 'Pleine largeur responsive',
    emplacement: 'banner',
    format: 'banner_leaderboard',
    tarif_mensuel_usd: 160,
    impressions_estimees: '60 000 / mois',
    description: 'Bannière supérieure visible sur l’ensemble des pages de la plateforme.'
  }
];

// INITIAL AD CAMPAIGNS
const INITIAL_AD_CAMPAIGNS = [
  {
    id: 'camp-rawbank-credit',
    nom_entreprise: 'Rawbank RDC',
    annonceur: 'Rawbank RDC',
    titre: 'Crédit Auto Rawbank : Roulez l’esprit tranquille',
    description: 'Financez jusqu’à 80% du véhicule de vos rêves à taux préférentiel. Accord de principe en 48h à Kinshasa.',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    lien: '#financement',
    cta_text: 'Simuler mon Financement',
    cta_url: '#financement',
    emplacement: 'homepage',
    format: 'banner_leaderboard',
    tag: 'Financement Officiel',
    badge_color: 'bg-emerald-600 text-white',
    budget: 450,
    statut: 'active',
    impressions: 26400,
    clics: 1390,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: 1
  },
  {
    id: 'camp-sonas-auto',
    nom_entreprise: 'Société Nationale d’Assurances (SONAS)',
    annonceur: 'SONAS RDC',
    titre: 'Assurance Automobile SONAS : Votre sécurité garantie',
    description: 'Souscrivez votre police d’assurance auto responsabilité civile et tous risques avec attestation instantanée.',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    lien: '#assurance',
    cta_text: 'Obtenir une Attestation',
    cta_url: '#assurance',
    emplacement: 'vehicle_detail',
    format: 'sidebar_box',
    tag: 'Assurance Obligatoire',
    badge_color: 'bg-blue-600 text-white',
    budget: 270,
    statut: 'active',
    impressions: 19800,
    clics: 940,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: 1
  },
  {
    id: 'camp-total-quartz',
    nom_entreprise: 'TotalEnergies Marketing RDC',
    annonceur: 'TotalEnergies Marketing RDC',
    titre: 'Huile Quartz TotalEnergies : Performance par forte chaleur',
    description: 'Optimisée pour les conditions routières et le climat de Kinshasa. Disponible dans toutes les stations.',
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200',
    lien: '#garages',
    cta_text: 'Localiser une Station',
    cta_url: '#garages',
    emplacement: 'search_results',
    format: 'banner_inline',
    tag: 'Entretien Moteur',
    badge_color: 'bg-rose-600 text-white',
    budget: 360,
    statut: 'active',
    impressions: 15300,
    clics: 710,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: 1
  }
];

// INITIAL PAYMENTS & ORDERS (avec statuts conformes PENDING, PAID, FAILED, CANCELLED, EXPIRED)
const INITIAL_PAYMENTS = [
  {
    id: 1,
    uuid: 'pay-2026-001',
    payment_id: 'PAY-2026-001',
    transaction_reference: 'TXN-MP-89241044',
    user_id: 1,
    dealer_id: 1,
    vehicle_id: 1,
    purpose: 'vehicle_promotion',
    amount: 12.00,
    currency: 'USD',
    payment_method: 'mpesa',
    payer_phone: '+243 81 555 0101',
    payer_name: 'Auto Prestige Kinshasa',
    status: 'PAID',
    metadata: { option_id: 'featured', duration_days: 7, vehicle_id: 1 },
    notes: 'Option À la Une (7 jours) validée',
    paid_at: new Date(Date.now() - 3600000 * 48),
    created_at: new Date(Date.now() - 3600000 * 48)
  },
  {
    id: 2,
    uuid: 'pay-2026-002',
    payment_id: 'PAY-2026-002',
    transaction_reference: 'TXN-OM-34982103',
    user_id: 2,
    dealer_id: null,
    vehicle_id: 3,
    purpose: 'vehicle_promotion',
    amount: 7.00,
    currency: 'USD',
    payment_method: 'orange_money',
    payer_phone: '+243 99 888 1234',
    payer_name: 'M. Jean-Luc Kalonji',
    status: 'PAID',
    metadata: { option_id: 'badge_premium', duration_days: 7, vehicle_id: 3 },
    notes: 'Badge Premium (7 jours) validé',
    paid_at: new Date(Date.now() - 3600000 * 12),
    created_at: new Date(Date.now() - 3600000 * 12)
  },
  {
    id: 3,
    uuid: 'pay-2026-003',
    payment_id: 'PAY-2026-003',
    transaction_reference: 'TXN-VIR-RAW-9921',
    user_id: 1,
    dealer_id: 1,
    vehicle_id: null,
    purpose: 'subscription',
    amount: 99.00,
    currency: 'USD',
    payment_method: 'virement',
    payer_phone: '+243 81 555 0101',
    payer_name: 'Auto Prestige Kinshasa',
    status: 'PAID',
    metadata: { plan_id: 'pro', target: 'concessionnaires', duration: 'mensuel' },
    notes: 'Abonnement Mensuel Concession Pro',
    paid_at: new Date(Date.now() - 3600000 * 240),
    created_at: new Date(Date.now() - 3600000 * 240)
  },
  {
    id: 4,
    uuid: 'pay-2026-004',
    payment_id: 'PAY-2026-004',
    transaction_reference: 'TXN-MP-77281900',
    user_id: 3,
    dealer_id: null,
    vehicle_id: 2,
    purpose: 'vehicle_promotion',
    amount: 5.00,
    currency: 'USD',
    payment_method: 'mpesa',
    payer_phone: '+243 81 999 4433',
    payer_name: 'Patrick Banza',
    status: 'PENDING',
    metadata: { option_id: 'bump', duration_days: 7, vehicle_id: 2 },
    notes: 'Remontée en tête (7 jours) en attente de règlement Mobile Money',
    paid_at: null,
    created_at: new Date(Date.now() - 3600000 * 2)
  }
];

// COMPTES MARCHANDS / RÉCEPTION MOBILE MONEY (MANUEL)
const ADMIN_PAYMENT_ACCOUNTS = {
  titulaire: "AutoKin RDC / Direction Financière",
  mpesa_number: "+243 82 555 0199",
  mpesa_name: "AutoKin M-Pesa",
  airtel_number: "+243 99 555 0199",
  airtel_name: "AutoKin Airtel Money",
  orange_number: "+243 89 555 0199",
  orange_name: "AutoKin Orange Money",
  whatsapp_number: "+243 82 555 0199",
  instructions: "Effectuez votre transfert par M-Pesa, Airtel Money ou Orange Money sur les numéros ci-dessus, puis importez la capture d'écran du reçu/SMS confirmant la transaction pour validation instantanée par l'administrateur."
};

// INITIAL VEHICLE BOOSTS
const INITIAL_VEHICLE_BOOSTS = [
  {
    id: 1,
    vehicle_id: 1,
    boost_type: 'featured',
    duration_days: 7,
    date_debut: new Date(Date.now() - 3600000 * 48),
    date_fin: new Date(Date.now() + 3600000 * 24 * 5),
    order_id: 'TXN-MP-89241044',
    is_active: 1,
    created_at: new Date(Date.now() - 3600000 * 48)
  },
  {
    id: 2,
    vehicle_id: 3,
    boost_type: 'badge_premium',
    duration_days: 7,
    date_debut: new Date(Date.now() - 3600000 * 12),
    date_fin: new Date(Date.now() + 3600000 * 24 * 6),
    order_id: 'TXN-OM-34982103',
    is_active: 1,
    created_at: new Date(Date.now() - 3600000 * 12)
  }
];

// IN-MEMORY STORE
const monetizationStore = {
  payment_accounts: { ...ADMIN_PAYMENT_ACCOUNTS },
  free_listings_config: FREE_LISTINGS_CONFIG,
  promotion_options: PROMOTION_OPTIONS,
  subscription_plans: SUBSCRIPTION_PLANS,
  ad_placements: AD_PLACEMENTS,
  ad_campaigns: [...INITIAL_AD_CAMPAIGNS],
  payments: [...INITIAL_PAYMENTS],
  vehicle_boosts: [...INITIAL_VEHICLE_BOOSTS],
  inquiries: [],
  orders: [
    {
      id: 'ORD-2026-001',
      type: 'listing_tier',
      item_id: 'featured',
      item_nom: 'Passage Annonce À la Une (Toyota Land Cruiser 300)',
      target_vehicle_id: 1,
      client_nom: 'Auto Prestige Kinshasa',
      client_phone: '+243 81 555 0101',
      montant_usd: 12,
      devise: 'USD',
      payment_method: 'mpesa',
      payment_reference: 'TXN-MP-89241044',
      status: 'PAID',
      created_at: new Date(Date.now() - 3600000 * 48)
    },
    {
      id: 'ORD-2026-002',
      type: 'visibility_boost',
      item_id: 'badge_premium',
      item_nom: 'Badge Premium (Toyota Hilux Revo)',
      target_vehicle_id: 3,
      client_nom: 'M. Jean-Luc Kalonji',
      client_phone: '+243 99 888 1234',
      montant_usd: 7,
      devise: 'USD',
      payment_method: 'orange_money',
      payment_reference: 'TXN-OM-34982103',
      status: 'PAID',
      created_at: new Date(Date.now() - 3600000 * 12)
    },
    {
      id: 'ORD-2026-003',
      type: 'dealership_subscription',
      item_id: 'pro',
      item_nom: 'Abonnement Mensuel Concession Pro',
      dealership_id: 1,
      client_nom: 'Auto Prestige Kinshasa',
      client_phone: '+243 81 555 0101',
      montant_usd: 99,
      devise: 'USD',
      payment_method: 'virement',
      payment_reference: 'TXN-VIR-RAW-9921',
      status: 'PAID',
      created_at: new Date(Date.now() - 3600000 * 240)
    }
  ]
};

/**
 * Gestionnaire SQL résilient pour le module de monétisation (MySQL & In-Memory fallback)
 */
function handleMonetizationQuery(normalizedSql, sql, params, memoryStore) {
  // 1. Table PAYMENTS
  if (normalizedSql.includes('PAYMENTS') || normalizedSql.includes('PAIEMENTS')) {
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...monetizationStore.payments];
      if (normalizedSql.includes('WHERE STATUS = ?')) {
        const targetStatus = String(params[0]).toUpperCase();
        list = list.filter(p => String(p.status).toUpperCase() === targetStatus);
      }
      if (normalizedSql.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        return list.filter(p => Number(p.id) === id);
      }
      if (normalizedSql.includes('USER_ID = ?')) {
        const uid = Number(params[0]);
        list = list.filter(p => Number(p.user_id) === uid);
      }
      return list;
    }
    if (normalizedSql.startsWith('INSERT INTO PAYMENTS')) {
      const newId = monetizationStore.payments.length > 0 
        ? Math.max(...monetizationStore.payments.map(p => Number(p.id) || 0)) + 1 
        : 1;
      return { affectedRows: 1, insertId: newId };
    }
    if (normalizedSql.startsWith('UPDATE PAYMENTS')) {
      return { affectedRows: 1 };
    }
  }

  // 2. Table AD_CAMPAIGNS
  if (normalizedSql.includes('AD_CAMPAIGNS')) {
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...monetizationStore.ad_campaigns];
      if (normalizedSql.includes('IS_ACTIVE = 1') || normalizedSql.includes('IS_ACTIVE = TRUE')) {
        list = list.filter(a => a.is_active);
      }
      if (normalizedSql.includes('WHERE ID = ?')) {
        const id = params[0];
        return list.filter(a => a.id === id);
      }
      if (normalizedSql.includes('EMPLACEMENT = ?')) {
        const emp = params[0];
        list = list.filter(a => a.emplacement === emp || a.format === emp);
      }
      return list;
    }
    if (normalizedSql.startsWith('UPDATE AD_CAMPAIGNS')) {
      if (normalizedSql.includes('CLICS = CLICS + 1')) {
        const id = params[params.length - 1];
        const ad = monetizationStore.ad_campaigns.find(a => a.id === id);
        if (ad) ad.clics = (ad.clics || 0) + 1;
        return { affectedRows: 1 };
      }
      if (normalizedSql.includes('IMPRESSIONS = IMPRESSIONS + 1')) {
        const id = params[params.length - 1];
        const ad = monetizationStore.ad_campaigns.find(a => a.id === id);
        if (ad) ad.impressions = (ad.impressions || 0) + 1;
        return { affectedRows: 1 };
      }
      return { affectedRows: 1 };
    }
    if (normalizedSql.startsWith('INSERT INTO AD_CAMPAIGNS')) {
      return { affectedRows: 1, insertId: Date.now() };
    }
    if (normalizedSql.startsWith('DELETE FROM AD_CAMPAIGNS')) {
      const id = params[0];
      monetizationStore.ad_campaigns = monetizationStore.ad_campaigns.filter(a => a.id !== id);
      return { affectedRows: 1 };
    }
  }

  // 3. Table VEHICLE_BOOSTS
  if (normalizedSql.includes('VEHICLE_BOOSTS')) {
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...monetizationStore.vehicle_boosts];
      if (normalizedSql.includes('WHERE IS_ACTIVE = 1')) {
        list = list.filter(b => b.is_active);
      }
      if (normalizedSql.includes('VEHICLE_ID = ?')) {
        const vid = Number(params[0]);
        list = list.filter(b => Number(b.vehicle_id) === vid);
      }
      return list;
    }
    if (normalizedSql.startsWith('INSERT INTO VEHICLE_BOOSTS')) {
      const newId = monetizationStore.vehicle_boosts.length + 1;
      return { affectedRows: 1, insertId: newId };
    }
    if (normalizedSql.startsWith('UPDATE VEHICLE_BOOSTS')) {
      return { affectedRows: 1 };
    }
  }

  // 4. Table MONETIZATION_ORDERS
  if (normalizedSql.includes('MONETIZATION_ORDERS')) {
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...monetizationStore.orders];
      if (normalizedSql.includes('WHERE STATUS = ?')) {
        list = list.filter(o => o.status === params[0]);
      }
      return list;
    }
    if (normalizedSql.startsWith('INSERT INTO MONETIZATION_ORDERS')) {
      return { affectedRows: 1, insertId: Date.now() };
    }
    if (normalizedSql.startsWith('UPDATE MONETIZATION_ORDERS')) {
      return { affectedRows: 1 };
    }
  }

  // 5. Table AD_INQUIRIES
  if (normalizedSql.includes('AD_INQUIRIES')) {
    if (normalizedSql.startsWith('SELECT')) {
      return [...monetizationStore.inquiries];
    }
    if (normalizedSql.startsWith('INSERT INTO AD_INQUIRIES')) {
      return { affectedRows: 1, insertId: Date.now() };
    }
  }

  return null;
}

module.exports = {
  ADMIN_PAYMENT_ACCOUNTS,
  FREE_LISTINGS_CONFIG,
  PROMOTION_OPTIONS,
  SUBSCRIPTION_PLANS,
  AD_PLACEMENTS,
  INITIAL_AD_CAMPAIGNS,
  INITIAL_PAYMENTS,
  INITIAL_VEHICLE_BOOSTS,
  monetizationStore,
  handleMonetizationQuery
};
