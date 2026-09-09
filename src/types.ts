export type VehicleStatus = 'disponible' | 'reserve' | 'vendu';
export type CarCondition = 'neuf' | 'occasion';
export type FuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique' | 'GPL';
export type TransmissionType = 'Automatique' | 'Manuelle';
export type BodyType = 'SUV' | 'Berline' | 'Citadine' | 'Coupé' | 'Cabriolet' | 'Break' | 'Utilitaire';

export interface Vehicle {
  id: string;
  dealershipId?: string;
  marque: string;
  modele: string;
  finition: string;
  annee: number;
  prix: number;
  msrp?: number;
  remiseInstantanee?: number;
  ancienPrix?: number;
  enPromo?: boolean;
  kilometrage: number;
  carburant: FuelType;
  transmission: TransmissionType;
  categorie: BodyType;
  etat: CarCondition;
  status: VehicleStatus;
  puissanceCh: number;
  puissanceFiscale: number;
  couleur: string;
  couleurInterieure?: string;
  moteur?: string;
  motrice?: string;
  portes: number;
  places: number;
  co2Gkm: number;
  garantieMois: number;
  vin: string;
  images: string[];
  description: string;
  equipements: string[];
  dateAjout: string;
  enVedette?: boolean;
  version?: string;
  boite?: TransmissionType;
  boiteVitesse?: TransmissionType;
  consommation?: string;
}

export interface VehicleFilterState {
  searchQuery: string;
  marque: string;
  modele: string;
  categorie: string;
  carburant: string;
  transmission: string;
  etat: string;
  status: string;
  prixMax: number;
  anneeMin: number;
  kmMax: number;
  sortBy: 'prix-asc' | 'prix-desc' | 'recent' | 'km-asc' | 'annee-desc';
}

export interface Lead {
  id: string;
  dealershipId?: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  nomClient: string;
  email: string;
  telephone: string;
  typeDemande: 'essai' | 'information' | 'offre_reprise' | 'financement' | 'offre_prix';
  dateSouhaitee?: string;
  horaireSouhaite?: string;
  message?: string;
  offrePrixProposee?: number;
  vehiculeRepriseInfo?: string;
  dateDemande: string;
  statut: 'nouveau' | 'contacte' | 'rdv_fixe' | 'conclu' | 'annule';
  notesAdmin?: string;
}

export interface DealershipInfo {
  id?: string;
  nom: string;
  slogan: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  horaires: string;
  siteWeb: string;
  logoUrl: string;
  logo?: string;
  bannerUrl: string;
  sippCode: string;
  siret: string;
  googleTagManagerId?: string;
  googleTagManagerEnabled?: boolean;
  googleAnalyticsId?: string;
  googleAnalyticsEnabled?: boolean;
  metaPixelId?: string;
  metaPixelEnabled?: boolean;
  tikTokPixelId?: string;
  tikTokPixelEnabled?: boolean;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  googleAdsEnabled?: boolean;
}

export type SubscriptionStatus = 'essai_gratuit' | 'actif' | 'facture_en_attente' | 'suspendu' | 'expire';
export type SubscriptionPlanId = 'starter' | 'pro' | 'enterprise';
export type GaragePlanId = 'garage_starter' | 'garage_pro' | 'garage_enterprise';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  nom: string;
  prixMensuel: number;
  maxVehicles: number;
  description: string;
  features: string[];
}

export interface GarageSubscriptionPlan {
  id: GaragePlanId;
  nom: string;
  prixMensuel: number;
  description: string;
  features: string[];
  maxServices?: number;
  inclutSos24h?: boolean;
}

export interface Invoice {
  id: string;
  dealershipId?: string;
  dealershipNom?: string;
  garageId?: string;
  garageNom?: string;
  typeEntite?: 'concession' | 'garage';
  montantTTC: number;
  montantHT: number;
  tva: number;
  dateEmission: string;
  dateEcheance: string;
  statut: 'payee' | 'en_attente' | 'en_retard' | 'annulee';
  periode: string;
  description: string;
  moyenPaiement?: string;
}

export interface DealershipAccount {
  id: string;
  info: DealershipInfo;
  responsableNom: string;
  emailLogin: string;
  motDePasse: string;
  planId: SubscriptionPlanId;
  dateInscription: string;
  finEssaiGratuit: string; // ISO date string
  statutAbonnement: SubscriptionStatus;
  prochaineFacturation: string;
  prixFactureMensuel: number;
  nbVehiculesActifs: number;
  estMasque?: boolean;
  invoices: Invoice[];
  vehicles?: Vehicle[];
}

export interface FinancingParams {
  prixVehicule: number;
  apport: number;
  dureeMois: number;
  tauxAnnuel: number;
}

export interface SiteAdminInfo {
  nomPlateforme: string;
  nomAdministrateur: string;
  titre: string;
  slogan: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  telephoneSupport: string;
  email: string;
  emailSupport: string;
  horaires: string;
  siteWeb: string;
  siret: string;
  rcs: string;
  tvaIntra: string;
  description: string;
  googleTagManagerId?: string;
  googleTagManagerEnabled?: boolean;
  googleAnalyticsId?: string;
  googleAnalyticsEnabled?: boolean;
  metaPixelId?: string;
  metaPixelEnabled?: boolean;
  tikTokPixelId?: string;
  tikTokPixelEnabled?: boolean;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  googleAdsEnabled?: boolean;
}

export interface GTMDataLayerEvent {
  id: string;
  timestamp: string;
  event: string;
  category?: 'traffic' | 'lead' | 'engagement' | 'conversion' | 'system';
  page_location?: string;
  page_path?: string;
  page_title?: string;
  dealership_id?: string;
  dealership_name?: string;
  vehicle_id?: string;
  vehicle_name?: string;
  vehicle_brand?: string;
  vehicle_price?: number;
  lead_type?: string;
  rawPayload: Record<string, any>;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventName: string;
  dealershipId?: string;
  dealershipName?: string;
  vehicleId?: string;
  vehicleName?: string;
  pagePath: string;
  category: 'traffic' | 'lead' | 'engagement' | 'conversion';
  details?: Record<string, any>;
}

export interface AnalyticsReport {
  totalPageViews: number;
  totalUniqueVisitors: number;
  vehicleViews: number;
  leadsGenerated: number;
  testDriveBookings: number;
  offersSubmitted: number;
  tradeInRequests: number;
  conversionRate: number;
  topVehicles: { id: string; title: string; views: number; leads: number }[];
  trafficBySource: { source: string; visitors: number; percentage: number }[];
  trafficByDevice: { device: string; count: number; percentage: number }[];
  recentEvents: AnalyticsEvent[];
}

// ------------------------------------------------------------------
// KINSHASA GARAGES & AUTO BREAKDOWN ASSISTANCE TYPES
// ------------------------------------------------------------------
export type KinshasaCommune = 
  | 'Gombe' 
  | 'Limete' 
  | 'Ngaliema' 
  | 'Kintambo' 
  | 'Bandalungwa' 
  | 'Lemba' 
  | 'Matete' 
  | 'Lingwala' 
  | 'Barumbu' 
  | 'Kalamu' 
  | 'Kasavubu' 
  | 'Ngiri-Ngiri' 
  | 'Mont-Ngafula' 
  | 'Selembao' 
  | 'Bumbu' 
  | 'Makala' 
  | 'Nsele' 
  | 'Masina' 
  | 'Ndjili' 
  | 'Kimbanseke' 
  | 'Kisenso' 
  | 'Maluku';

export type GarageSpecialty = 
  | 'Mecanique_Generale' 
  | 'Diagnostic_Electronique' 
  | 'Depannage_Urgence_24h' 
  | 'Electricite_Auto' 
  | 'Climatisation' 
  | 'Tolerie_Peinture' 
  | 'Vulcanisateur_Pneus' 
  | 'Freinage_Suspension' 
  | 'Vidange_Entretien_Rapide' 
  | 'Boite_Automatique' 
  | 'Pieces_Rechange';

export interface GarageTarifIndicatif {
  prestation: string;
  prixEstime: string;
  description?: string;
}

export interface GarageReview {
  id: string;
  auteur: string;
  commune: string;
  note: number;
  commentaire: string;
  date: string;
  vehicule?: string;
}

export interface GarageProfile {
  id: string;
  nom: string;
  responsable: string;
  titreResponsable?: string;
  commune: KinshasaCommune;
  adresse: string;
  repere: string;
  telephonePrincipal: string;
  telephoneUrgence?: string;
  whatsapp: string;
  email?: string;
  horaires: string;
  ouvertDimanche?: boolean;
  estDepannageMobile24h: boolean;
  estCertifie: boolean;
  noteGlobale: number;
  nombreAvis: number;
  specialites: GarageSpecialty[];
  marquesExpertise: string[];
  photos: string[];
  description: string;
  servicesInclus: string[];
  tarifsIndicatifs?: GarageTarifIndicatif[];
  avisClients?: GarageReview[];
  latitude?: number;
  longitude?: number;
  dateCreation: string;
  // SaaS Subscription & Billing (identical to Dealership / Concessionnaire)
  planId?: GaragePlanId | SubscriptionPlanId;
  statutAbonnement?: SubscriptionStatus;
  dateInscription?: string;
  finEssaiGratuit?: string; // ISO date string
  prochaineFacturation?: string;
  prixFactureMensuel?: number;
  estMasque?: boolean;
  invoices?: Invoice[];
}

export interface BreakdownRequest {
  id: string;
  garageId?: string;
  garageNom?: string;
  clientNom: string;
  telephone: string;
  communePanne: KinshasaCommune;
  adresseLieuPanne: string;
  marqueVehicule: string;
  modeleVehicule: string;
  typePanne: 'demarrage' | 'crevaison' | 'moteur_chauffe' | 'freins' | 'batterie_electricite' | 'accident_remorquage' | 'autre';
  descriptionPanne: string;
  besoinRemorquage: boolean;
  photosPanne?: string[];
  statut: 'en_attente' | 'pris_en_charge' | 'depanneur_en_route' | 'resolu' | 'annule';
  dateDemande: string;
}
