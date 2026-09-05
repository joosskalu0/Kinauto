import { Lead, DealershipInfo } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    vehicleId: 'car-1',
    vehicleTitle: 'BMW Série 3 - 320i M Sport xDrive',
    vehiclePrice: 44900,
    nomClient: 'Jean-Marc Dupont',
    email: 'jm.dupont@email.fr',
    telephone: '06 12 34 56 78',
    typeDemande: 'essai',
    dateSouhaitee: '2026-08-10',
    horaireSouhaite: '14:30',
    message: 'Bonjour, je souhaite essayer ce véhicule ce samedi. Pouvez-vous aussi faire une estimation de reprise pour ma BMW 118i de 2019 ?',
    dateDemande: '2026-08-05 10:15',
    statut: 'nouveau'
  },
  {
    id: 'lead-2',
    vehicleId: 'car-2',
    vehicleTitle: 'Audi Q5 - 40 TDI 204ch S Line Quattro',
    vehiclePrice: 58900,
    nomClient: 'Sophie Laurent',
    email: 'sophie.laurent@entreprise.com',
    telephone: '06 98 76 54 32',
    typeDemande: 'financement',
    message: 'Je cherche une offre de LOA sur 36 mois avec 15 000 km/an et un apport de 8000 €.',
    dateDemande: '2026-08-04 16:45',
    statut: 'contacte',
    notesAdmin: 'Offre LOA simulée et envoyée par email le 05/08. En attente de confirmation.'
  },
  {
    id: 'lead-3',
    vehicleId: 'car-3',
    vehicleTitle: 'Porsche Taycan - 4S Battery Performance Plus',
    vehiclePrice: 89500,
    nomClient: 'Alexandre Moreau',
    email: 'a.moreau@cabinet-avocats.fr',
    telephone: '07 45 12 89 00',
    typeDemande: 'essai',
    dateSouhaitee: '2026-08-08',
    horaireSouhaite: '10:00',
    message: 'Très intéressé par la Taycan. Merci de me réserver un créneau d’essai.',
    dateDemande: '2026-08-03 09:20',
    statut: 'rdv_fixe',
    notesAdmin: 'RDV confirmé pour le samedi 8 août à 10h. Clés et batterie chargée à 100%.'
  }
];

export const DEFAULT_DEALERSHIP_INFO: DealershipInfo = {
  nom: 'Alliance Auto Premium',
  slogan: 'L\'Excellence Automobile & Véhicules d\'Exception',
  adresse: '145 Avenue de la Grande Armée',
  ville: 'Paris',
  codePostal: '75016',
  telephone: '01 42 68 90 00',
  email: 'contact@alliance-auto-premium.fr',
  horaires: 'Lundi - Samedi : 09h00 - 19h00 (Fermé le Dimanche)',
  siteWeb: 'https://alliance-auto-premium.fr',
  logoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=200',
  bannerUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1600',
  sippCode: 'FR892301982',
  siret: '892 301 982 00014',
  googleAnalyticsId: 'G-AAP782190',
  googleAnalyticsEnabled: true
};
