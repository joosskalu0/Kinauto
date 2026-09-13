/**
 * Configuration et Données du Module de Monétisation
 * 
 * Modèles économiques pris en charge :
 * 1. Annonces Gratuites (Standard)
 * 2. Annonces Premium (Bordure dorée, badge, photos étendues, tri prioritaire)
 * 3. Annonces Mises en Avant (À la Une / Carrousel d'accueil, x5 visibilité)
 * 4. Options de visibilité à la carte (Remontée tête de liste, badge urgent, certification)
 * 5. Abonnements Concessionnaires (Formules SaaS récurrentes)
 * 6. Abonnements Garages & Dépanneurs (SOS 24/7 & Visibilité)
 * 7. Régie Publicitaire & Bannières Partenaires (Leaderboard, Native In-Feed, Sidebar)
 * 8. Architecture de Commandes & Passerelle de Paiement Extensible
 */

const LISTING_TIERS = [
  {
    id: 'free',
    code: 'STANDARD',
    nom: 'Annonce Gratuite',
    badge: 'Standard',
    prix_usd: 0,
    prix_fc: 0,
    duree_jours: 30,
    max_photos: 5,
    priorite_tri: 1,
    description: 'Publication standard pour les particuliers et indépendants sans frais.',
    caracteristiques: [
      'Visibilité standard dans les résultats de recherche',
      'Jusqu’à 5 photos haute définition',
      'Valable 30 jours consécutifs',
      'Messagerie et contact WhatsApp direct avec les acheteurs',
      'Modération et publication sous 24 heures'
    ],
    is_popular: false,
    color: 'slate'
  },
  {
    id: 'premium',
    code: 'PREMIUM',
    nom: 'Annonce Premium',
    badge: 'PREMIUM',
    prix_usd: 15,
    prix_fc: 42750,
    duree_jours: 60,
    max_photos: 15,
    priorite_tri: 2,
    description: 'Bordure dorée, priorité dans les résultats et jusqu’à 15 photos pour vendre 2x plus vite.',
    caracteristiques: [
      'Badge distinctif « ⭐ PREMIUM » doré',
      'Bordure et mise en surbrillance dans les listes',
      'Positionnement prioritaire au-dessus des annonces gratuites',
      'Jusqu’à 15 photos du véhicule (intérieur, moteur, carrosserie)',
      'Valable 60 jours consécutifs (2 mois)',
      'Statistiques de vues et de clics détaillées',
      'Support client et validation prioritaire en moins de 2 heures'
    ],
    is_popular: true,
    color: 'amber'
  },
  {
    id: 'featured',
    code: 'VEDETTE',
    nom: 'Annonce À la Une (Vedette)',
    badge: 'À LA UNE',
    prix_usd: 29,
    prix_fc: 82650,
    duree_jours: 30,
    max_photos: 30,
    priorite_tri: 3,
    description: 'Exposition maximale : carrousel en page d’accueil, tête de liste et badge flamboyant.',
    caracteristiques: [
      'Affichage dans le carrousel « Véhicules à la Une » sur la page d’accueil',
      'Badge flamboyant « 🔥 À LA UNE » et cadre VIP',
      'Priorité absolue en tête de tous les résultats de recherche',
      'Jusqu’à 30 photos + vidéo de présentation',
      'Diffusion relayée sur les canaux WhatsApp et réseaux sociaux partenaires',
      '5 fois plus de contacts et de demandes d’essais',
      'Assistance d’un conseiller commercial dédié'
    ],
    is_popular: false,
    color: 'purple'
  }
];

const VISIBILITY_OPTIONS = [
  {
    id: 'boost_top_search',
    nom: 'Remontée en Tête de Recherche (7 jours)',
    type: 'recherche',
    prix_usd: 5,
    prix_fc: 14250,
    duree_jours: 7,
    icone: 'ArrowUpCircle',
    description: 'Repositionne instantanément votre annonce en 1ère position comme si elle venait d’être publiée.',
    benefice: 'Jusqu’à +70% de consultations immédiates'
  },
  {
    id: 'boost_urgent',
    nom: 'Badge « Urgent / Vente Rapide »',
    type: 'badge',
    prix_usd: 3,
    prix_fc: 8550,
    duree_jours: 14,
    icone: 'AlertTriangle',
    description: 'Appose un macaron rouge « 🚨 URGENT » pour signaler aux acheteurs une opportunité immédiate.',
    benefice: 'Signal fort pour les acheteurs avec liquidités prêtes'
  },
  {
    id: 'boost_certifie',
    nom: 'Badge « Véhicule Inspecté & Garanti »',
    type: 'certification',
    prix_usd: 7,
    prix_fc: 19950,
    duree_jours: 30,
    icone: 'ShieldCheck',
    description: 'Appose le label de réassurance « 🛡️ INSPECTÉ & CERTIFIÉ » après vérification des documents / VIN.',
    benefice: 'Multiplie par 3 la confiance des acquéreurs'
  },
  {
    id: 'boost_carrousel_home',
    nom: 'Encart Vedette Page d’Accueil (14 jours)',
    type: 'accueil',
    prix_usd: 12,
    prix_fc: 34200,
    duree_jours: 14,
    icone: 'Sparkles',
    description: 'Place votre annonce dans la bannière carrousel d’accueil consultée par tous les visiteurs.',
    benefice: 'Visibilité garantie auprès de 100% de l’audience du site'
  }
];

const DEALERSHIP_SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    nom: 'Formule Découverte Concession',
    code: 'DEALER_STARTER',
    cible: 'Petits parcs automobiles & vendeurs indépendants',
    prix_mensuel_usd: 49,
    prix_annuel_usd: 490, // 2 mois offerts
    prix_mensuel_fc: 139650,
    limite_annonces: 15,
    annonces_vedettes_incluses: 1,
    commission_vente: '0%',
    description: 'Le pack idéal pour démarrer la numérisation de votre stock automobile.',
    features: [
      'Jusqu’à 15 annonces en ligne en simultané',
      '1 annonce « À la Une » incluse chaque mois',
      'Vitrine concessionnaire personnalisée (logo, adresse, horaires)',
      'Formulaire de prise de contact WhatsApp direct',
      'Générateur d’annonces avec IA Gemini',
      'Support technique par WhatsApp 6j/7'
    ]
  },
  {
    id: 'pro',
    nom: 'Formule Concessionnaire Pro',
    code: 'DEALER_PRO',
    cible: 'Concessions indépendantes et showrooms actifs à Kinshasa',
    prix_mensuel_usd: 99,
    prix_annuel_usd: 990,
    prix_mensuel_fc: 282150,
    limite_annonces: 50,
    annonces_vedettes_incluses: 5,
    commission_vente: '0%',
    description: 'Notre formule la plus plébiscitée pour accélérer la rotation de votre parc automobile.',
    features: [
      'Jusqu’à 50 annonces simultanées',
      '5 annonces « À la Une » incluses chaque mois',
      'Toutes les annonces bénéficient du statut « ⭐ PREMIUM »',
      'Module de réservation d’essais routiers et offres de reprise',
      'Tableau de bord CRM complet avec gestion des leads',
      'Rapports statistiques de visites et d’engagement',
      'Badge « Concessionnaire Officiel Vérifié »',
      'Intégration Google Tag Manager & Meta Pixel'
    ],
    is_popular: true
  },
  {
    id: 'enterprise',
    nom: 'Formule Élite & Réseau Multi-Sites',
    code: 'DEALER_ELITE',
    cible: 'Groupes de concessions, importateurs officiels et réseaux de distribution',
    prix_mensuel_usd: 199,
    prix_annuel_usd: 1990,
    prix_mensuel_fc: 567150,
    limite_annonces: 999, // Illimité
    annonces_vedettes_incluses: 15,
    commission_vente: '0%',
    description: 'La solution haut de gamme sans limite de stock avec accompagnement stratégique dédié.',
    features: [
      'Nombre d’annonces illimité',
      '15 annonces « À la Une » incluses chaque mois',
      'Gestion multi-vendeurs et gestionnaire de flotte',
      'Flux d’import / export automatique d’inventaire (API / XML / Excel)',
      'Bannière publicitaire partenaire offerte dans votre commune',
      'Chargé de compte dédié avec interventions sur site',
      'Accès prioritaire aux leads exclusifs de recherche personnalisée',
      'SLA Garanti avec disponibilité 99.9%'
    ]
  }
];

const GARAGE_SUBSCRIPTION_PLANS = [
  {
    id: 'garage_starter',
    nom: 'Référencement Découverte Atelier',
    code: 'GARAGE_STARTER',
    cible: 'Mécaniciens indépendants et ateliers de quartier',
    prix_mensuel_usd: 0,
    prix_mensuel_fc: 0,
    description: 'Présence essentielle dans l’annuaire automobile des 24 communes de Kinshasa.',
    features: [
      'Fiche d’atelier standard dans l’annuaire',
      'Affichage des spécialités principales et localisation',
      'Numéro de téléphone et contact direct',
      'Affichage jusqu’à 3 tarifs indicatifs'
    ]
  },
  {
    id: 'garage_pro',
    nom: 'Formule Garage Agréé & SOS Direct',
    code: 'GARAGE_PRO',
    cible: 'Garages établis souhaitant capter des automobilistes en panne',
    prix_mensuel_usd: 39,
    prix_annuel_usd: 390,
    prix_mensuel_fc: 111150,
    description: 'Recevez les demandes de dépannage en direct sur WhatsApp et rassurez vos clients.',
    features: [
      'Badge de confiance « 🛡️ Atelier Agréé & Vérifié »',
      'Réception prioritaire des alertes SOS Dépannage par commune',
      'Bouton d’appel d’urgence WhatsApp direct 24/7',
      'Galerie photos de l’atelier et des équipements (ponts, valises de diagnostic)',
      'Grille tarifaire complète sans limitation',
      'Gestion des avis clients et réponses de l’atelier'
    ],
    is_popular: true
  },
  {
    id: 'garage_enterprise',
    nom: 'Formule Centre Automobile & Flotte Mobile 24/7',
    code: 'GARAGE_ENTERPRISE',
    cible: 'Centres de service complets, dépanneuses et remorquage lourd',
    prix_mensuel_usd: 89,
    prix_annuel_usd: 890,
    prix_mensuel_fc: 253650,
    description: 'Positionnement numéro 1 sur le service de remorquage et assistance routière à Kinshasa.',
    features: [
      'Positionnement prioritaire en tête de liste pour les pannes urgentes',
      'Équipe mobile de dépannage mise en avant sur la carte interactive',
      'Bannière partenaire native dans l’onglet SOS Dépannage',
      'Gestion de plusieurs véhicules d’assistance et remorqueuses',
      'Rapports mensuels des interventions générées',
      'Assistance technique et support prioritaire 7j/7'
    ]
  }
];

const AD_PLACEMENTS = [
  {
    id: 'placement_leaderboard',
    format: 'banner_leaderboard',
    nom: 'Bannière Grand Format Header (728x90 / Mobile Responsive)',
    dimensions: '728 x 90 px ou 320 x 100 px mobile',
    emplacement: 'En haut de toutes les pages sous la barre de navigation',
    tarif_mensuel_usd: 150,
    tarif_mensuel_fc: 427500,
    description: 'Impact maximal avec 100% de visibilité dès l’arrivée de chaque visiteur sur la plateforme.',
    impressions_estimees: '45 000 / mois',
    disponible: true
  },
  {
    id: 'placement_infeed',
    format: 'banner_inline',
    nom: 'Bannière Native Intégrée (In-Feed 970x250)',
    dimensions: '970 x 250 px / Grille catalogue responsive',
    emplacement: 'Intercalée harmonieusement tous les 6 véhicules dans le catalogue',
    tarif_mensuel_usd: 120,
    tarif_mensuel_fc: 342000,
    description: 'Format natif parfaitement intégré au flux de recherche, idéal pour banques, assureurs et accessoires.',
    impressions_estimees: '65 000 / mois',
    disponible: true
  },
  {
    id: 'placement_sidebar',
    format: 'sidebar_box',
    nom: 'Pavé Carré Fiche Véhicule (300x250)',
    dimensions: '300 x 250 px',
    emplacement: 'Colonne latérale des fiches détaillées de véhicules',
    tarif_mensuel_usd: 80,
    tarif_mensuel_fc: 228000,
    description: 'Cible les acheteurs hautement qualifiés au moment exact où ils consultent un véhicule.',
    impressions_estimees: '30 000 / mois',
    disponible: true
  },
  {
    id: 'placement_sos',
    format: 'banner_sos',
    nom: 'Encart Exclusif Espace SOS & Garages',
    dimensions: 'Plein format horizontal',
    emplacement: 'Section SOS Dépannage & Annuaire Garages',
    tarif_mensuel_usd: 95,
    tarif_mensuel_fc: 270750,
    description: 'Cible spécifiquement les automobilistes en recherche de pièces, batteries, pneus et entretien.',
    impressions_estimees: '25 000 / mois',
    disponible: true
  }
];

const INITIAL_AD_CAMPAIGNS = [
  {
    id: 'camp-rawbank-credit-auto',
    titre: 'Crédit Auto Rawbank : Roulez l’esprit tranquille',
    annonceur: 'Rawbank RDC',
    tag: 'Partenaire Financement Officiel',
    format: 'banner_inline',
    emplacement: 'catalogue_inline',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    description: 'Financez jusqu’à 80% du véhicule de vos rêves à taux préférentiel. Accord de principe en 48h à Kinshasa.',
    cta_text: 'Simuler mon Financement',
    cta_url: '#financement',
    badge_color: 'bg-emerald-600 text-white',
    impressions: 24500,
    clics: 1280,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: true
  },
  {
    id: 'camp-sonas-assurance',
    titre: 'Assurance Automobile SONAS : Votre sécurité garantie en RDC',
    annonceur: 'Société Nationale d’Assurances (SONAS)',
    tag: 'Assurance Obligatoire & Tous Risques',
    format: 'sidebar_box',
    emplacement: 'fiche_vehicule',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    description: 'Souscrivez votre police d’assurance auto responsabilité civile et tous risques avec attestation instantanée.',
    cta_text: 'Obtenir une Attestation',
    cta_url: '#assurance',
    badge_color: 'bg-blue-600 text-white',
    impressions: 18200,
    clics: 890,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: true
  },
  {
    id: 'camp-total-lubrifiants',
    titre: 'Huile Moteur Quartz TotalEnergies : Performance par forte chaleur',
    annonceur: 'TotalEnergies Marketing RDC',
    tag: 'Partenaire Entretien Moteur',
    format: 'banner_inline',
    emplacement: 'annuaire_garages',
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200',
    description: 'Optimisée pour les conditions routières et le climat de Kinshasa. Disponible dans toutes les stations-services.',
    cta_text: 'Localiser une Station',
    cta_url: '#garages',
    badge_color: 'bg-rose-600 text-white',
    impressions: 14100,
    clics: 620,
    date_debut: '2025-01-01',
    date_fin: '2026-12-31',
    is_active: true
  }
];

const INITIAL_MONETIZATION_ORDERS = [
  {
    id: 'ORD-2026-001',
    type: 'listing_tier',
    item_id: 'featured',
    item_nom: 'Passage Annonce À la Une (Toyota Land Cruiser 300)',
    target_vehicle_id: 1,
    client_nom: 'Auto Prestige Kinshasa',
    client_phone: '+243 81 555 0101',
    montant_usd: 29,
    devise: 'USD',
    payment_method: 'mpesa',
    payment_reference: 'MP-89241044',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 48)
  },
  {
    id: 'ORD-2026-002',
    type: 'visibility_boost',
    item_id: 'boost_urgent',
    item_nom: 'Badge Urgent (Toyota Hilux Revo)',
    target_vehicle_id: 3,
    client_nom: 'M. Jean-Luc Kalonji',
    client_phone: '+243 99 888 1234',
    montant_usd: 3,
    devise: 'USD',
    payment_method: 'orange_money',
    payment_reference: 'OM-34982103',
    status: 'completed',
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
    payment_reference: 'VIR-RAW-9921',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 240)
  }
];

// In-Memory state holder
const monetizationStore = {
  listing_tiers: [...LISTING_TIERS],
  visibility_options: [...VISIBILITY_OPTIONS],
  dealership_plans: [...DEALERSHIP_SUBSCRIPTION_PLANS],
  garage_plans: [...GARAGE_SUBSCRIPTION_PLANS],
  ad_placements: [...AD_PLACEMENTS],
  ad_campaigns: [...INITIAL_AD_CAMPAIGNS],
  orders: [...INITIAL_MONETIZATION_ORDERS],
  inquiries: []
};

module.exports = {
  monetizationStore,
  LISTING_TIERS,
  VISIBILITY_OPTIONS,
  DEALERSHIP_SUBSCRIPTION_PLANS,
  GARAGE_SUBSCRIPTION_PLANS,
  AD_PLACEMENTS,
  INITIAL_AD_CAMPAIGNS,
  INITIAL_MONETIZATION_ORDERS
};
