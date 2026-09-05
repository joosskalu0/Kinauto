import { SubscriptionPlan, GarageSubscriptionPlan, DealershipAccount, Invoice, SiteAdminInfo } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    nom: 'Formule Découverte / Essentiel',
    prixMensuel: 250000,
    maxVehicles: 20,
    description: 'Idéal pour petits parcs automobiles et indépendants',
    features: [
      'Jusqu’à 20 véhicules en ligne',
      'Module de réservation d’essais',
      'Générateur d’annonces IA basique',
      'Support par email prioritaire'
    ]
  },
  {
    id: 'pro',
    nom: 'Formule Concession Pro',
    prixMensuel: 500000,
    maxVehicles: 100,
    description: 'Pour concessions indépendantes à fort volume de vente',
    features: [
      'Jusqu’à 100 véhicules en ligne',
      'IA Gemini intégrée (rédaction illimitée)',
      'Simulateur de financement & reprise',
      'Tableau de bord statistique avancé',
      'Mise en vedette illimitée',
      'Multi-utilisateurs & gestion des leads'
    ]
  },
  {
    id: 'enterprise',
    nom: 'Formule Groupe Concessionnaire',
    prixMensuel: 1000000,
    maxVehicles: 999,
    description: 'Pour réseaux de concessions, franchises et grands groupes',
    features: [
      'Véhicules illimités',
      'Multi-sites & concessions associées',
      'Export automatique vers LeBonCoin & LaCentrale',
      'Gestionnaire de compte dédié & API',
      'Personnalisation complète du nom de domaine',
      'SLA Garanti 99.9%'
    ]
  }
];

export const GARAGE_SUBSCRIPTION_PLANS: GarageSubscriptionPlan[] = [
  {
    id: 'garage_starter',
    nom: 'Formule Atelier Indépendant / Starter',
    prixMensuel: 150000, // 150.000 FC (~55 USD)
    description: 'Pour mécaniciens indépendants, dépanneurs et ateliers de quartier',
    features: [
      'Fiche d’atelier vérifiée dans l’Annuaire Kinshasa',
      'Affichage des spécialités & horaires d’ouverture',
      'Boutons d’appel direct & WhatsApp client sans intermédiaire',
      'Grille tarifaire indicative jusqu’à 5 prestations',
      'Support standard par email et WhatsApp'
    ]
  },
  {
    id: 'garage_pro',
    nom: 'Formule Garage Expert & Dépannage SOS 24/7',
    prixMensuel: 350000, // 350.000 FC (~130 USD)
    description: 'Pour ateliers professionnels avec équipe mobile d’intervention sur route',
    inclutSos24h: true,
    features: [
      'Réception prioritaire des alertes SOS Pannes en direct',
      'Badge de confiance « Atelier Certifié & Recommandé »',
      'Dépannage d’urgence mobile 24/7 activé',
      'Positionnement prioritaire dans les 24 communes',
      'Grille tarifaire & galerie photos illimitées',
      'Statistiques de consultation de la fiche atelier'
    ]
  },
  {
    id: 'garage_enterprise',
    nom: 'Formule Réseau Multisite & Flottes Pro',
    prixMensuel: 750000, // 750.000 FC (~280 USD)
    description: 'Pour grands centres autos, concessionnaires-réparateurs et réseaux multi-communes',
    inclutSos24h: true,
    features: [
      'Multi-adresses & franchises sur plusieurs communes',
      'Dispatching automatique des urgences vers le mécanicien le plus proche',
      'Mise en avant sponsorisée en tête des recherches',
      'Gestionnaire de compte dédié & conventions flottes entreprises',
      'Rapports d’interventions & facturation dématérialisée',
      'Assistance technique & SLA prioritaire'
    ]
  }
];

export const INITIAL_DEALERSHIP_ACCOUNTS: DealershipAccount[] = [
  {
    id: 'dealership-1',
    info: {
      nom: "Auto Prestige Concept",
      slogan: "Votre spécialiste véhicules de prestige & occasions récentes certifiées",
      adresse: "142 Avenue des Champs-Élysées",
      ville: "Paris",
      codePostal: "75008",
      telephone: "01 45 62 89 00",
      email: "contact@autoprestige-concept.fr",
      horaires: "Lun - Sam : 09h00 - 19h00",
      siteWeb: "www.autoprestige-concept.fr",
      logoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200",
      bannerUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
      sippCode: "FR78912345",
      siret: "892 341 512 00018"
    },
    responsableNom: "Jean-Marc Dupont",
    emailLogin: "directeur@autoprestige.fr",
    motDePasse: "password123",
    planId: "pro",
    dateInscription: "2026-07-28",
    finEssaiGratuit: "2026-08-11",
    statutAbonnement: "essai_gratuit",
    prochaineFacturation: "2026-08-12",
    prixFactureMensuel: 500000,
    nbVehiculesActifs: 8,
    invoices: []
  },
  {
    id: 'dealership-2',
    info: {
      nom: "Elite Motors Lyon",
      slogan: "Concessionnaire officiel occasions premium et sportives",
      adresse: "45 Boulevard Vivier Merle",
      ville: "Lyon",
      codePostal: "69003",
      telephone: "04 78 90 12 34",
      email: "commercial@elitemotors-lyon.fr",
      horaires: "Lun - Ven : 08h30 - 19h00, Sam : 09h00 - 18h00",
      siteWeb: "www.elitemotors-lyon.fr",
      logoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200",
      bannerUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
      sippCode: "FR45678901",
      siret: "512 890 341 00029"
    },
    responsableNom: "Sophie Laurent",
    emailLogin: "sophie@elitemotors.fr",
    motDePasse: "password123",
    planId: "enterprise",
    dateInscription: "2026-05-10",
    finEssaiGratuit: "2026-05-24",
    statutAbonnement: "actif",
    prochaineFacturation: "2026-09-01",
    prixFactureMensuel: 1000000,
    nbVehiculesActifs: 34,
    invoices: [
      {
        id: "INV-2026-001",
        dealershipId: "dealership-2",
        dealershipNom: "Elite Motors Lyon",
        montantHT: 862068.97,
        tva: 137931.03,
        montantTTC: 1000000.00,
        dateEmission: "2026-07-01",
        dateEcheance: "2026-07-15",
        statut: "payee",
        periode: "Juillet 2026",
        description: "Abonnement Mensuel - Formule Groupe Concessionnaire",
        moyenPaiement: "Virement Bancaire / Mobile Money"
      },
      {
        id: "INV-2026-004",
        dealershipId: "dealership-2",
        dealershipNom: "Elite Motors Lyon",
        montantHT: 862068.97,
        tva: 137931.03,
        montantTTC: 1000000.00,
        dateEmission: "2026-08-01",
        dateEcheance: "2026-08-15",
        statut: "payee",
        periode: "Août 2026",
        description: "Abonnement Mensuel - Formule Groupe Concessionnaire",
        moyenPaiement: "Prélèvement Bancaire"
      }
    ]
  },
  {
    id: 'dealership-3',
    info: {
      nom: "Riviera Supercars Nice",
      slogan: "Supercars & véhicules haut de gamme de la Côte d'Azur",
      adresse: "12 Promenade des Anglais",
      ville: "Nice",
      codePostal: "06000",
      telephone: "04 93 12 34 56",
      email: "contact@rivierasupercars.fr",
      horaires: "Lun - Sam : 09h30 - 19h30",
      siteWeb: "www.rivierasupercars.fr",
      logoUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=200",
      bannerUrl: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&q=80&w=1200",
      sippCode: "FR90123456",
      siret: "901 234 567 00012"
    },
    responsableNom: "Alexandre Benali",
    emailLogin: "alexandre@riviera.fr",
    motDePasse: "password123",
    planId: "pro",
    dateInscription: "2026-07-01",
    finEssaiGratuit: "2026-07-15",
    statutAbonnement: "facture_en_attente",
    prochaineFacturation: "2026-08-15",
    prixFactureMensuel: 500000,
    nbVehiculesActifs: 12,
    invoices: [
      {
        id: "INV-2026-002",
        dealershipId: "dealership-3",
        dealershipNom: "Riviera Supercars Nice",
        montantHT: 431034.48,
        tva: 68965.52,
        montantTTC: 500000.00,
        dateEmission: "2026-07-16",
        dateEcheance: "2026-07-30",
        statut: "en_attente",
        periode: "Période post-essai (Août 2026)",
        description: "Abonnement Mensuel - Formule Concession Pro (Fin d’essai gratuit)",
      }
    ]
  },
  {
    id: 'dealership-4',
    info: {
      nom: "Nord Auto Occasions Lille",
      slogan: "Grand choix de véhicules d'occasion garantis",
      adresse: "88 Rue Nationale",
      ville: "Lille",
      codePostal: "59000",
      telephone: "03 20 11 22 33",
      email: "contact@nordauto.fr",
      horaires: "Lun - Sam : 08h30 - 18h30",
      siteWeb: "www.nordauto.fr",
      logoUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=200",
      bannerUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200",
      sippCode: "FR12345678",
      siret: "432 109 876 00015"
    },
    responsableNom: "Marc Lefebvre",
    emailLogin: "marc@nordauto.fr",
    motDePasse: "password123",
    planId: "starter",
    dateInscription: "2026-06-01",
    finEssaiGratuit: "2026-06-15",
    statutAbonnement: "expire",
    prochaineFacturation: "2026-06-16",
    prixFactureMensuel: 250000,
    nbVehiculesActifs: 5,
    invoices: [
      {
        id: "INV-2026-003",
        dealershipId: "dealership-4",
        dealershipNom: "Nord Auto Occasions Lille",
        montantHT: 215517.24,
        tva: 34482.76,
        montantTTC: 250000.00,
        dateEmission: "2026-06-16",
        dateEcheance: "2026-06-30",
        statut: "en_retard",
        periode: "Juin - Juillet 2026",
        description: "Abonnement Mensuel - Formule Découverte",
      }
    ]
  }
];

export const DEFAULT_SITE_ADMIN_INFO: SiteAdminInfo = {
  nomPlateforme: "AutoConcession SaaS Cloud",
  nomAdministrateur: "Direction & Administration Centrale du Site",
  titre: "Éditeur & Administrateur de la Plateforme SaaS",
  slogan: "Solution SaaS de référence pour la multidiffusion et la gestion de parcs automobiles pour concessions indépendantes et réseaux de vente",
  adresse: "10 Place Vendôme",
  ville: "Paris",
  codePostal: "75001",
  telephone: "01 89 71 34 00",
  telephoneSupport: "01 89 71 34 01",
  email: "admin@autoconcession-cloud.com",
  emailSupport: "support@autoconcession-cloud.com",
  horaires: "Lundi - Samedi : 08h30 - 19h30 (Support d'urgence 24/7 pour les concessions)",
  siteWeb: "https://autoconcession-cloud.com",
  siret: "892 341 512 00018",
  rcs: "RCS Paris B 892 341 512",
  tvaIntra: "FR 45 892341512",
  description: "Plateforme cloud multi-concessions permettant aux professionnels automobiles d'exposer leur stock, gérer leurs demandes d'essais et automatisations commerciales.",
  googleAnalyticsId: "G-ADMIN99X7V2",
  googleAnalyticsEnabled: true,
  googleTagManagerId: "GTM-P8KLM22"
};
