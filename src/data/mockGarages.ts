import { GarageProfile, KinshasaCommune, GarageSpecialty } from '../types';

export const KINSHASA_COMMUNES: KinshasaCommune[] = [
  'Gombe',
  'Limete',
  'Ngaliema',
  'Kintambo',
  'Bandalungwa',
  'Lemba',
  'Matete',
  'Lingwala',
  'Barumbu',
  'Kalamu',
  'Kasavubu',
  'Ngiri-Ngiri',
  'Mont-Ngafula',
  'Selembao',
  'Bumbu',
  'Makala',
  'Nsele',
  'Masina',
  'Ndjili',
  'Kimbanseke',
  'Kisenso',
  'Maluku'
];

export const GARAGE_SPECIALTY_LABELS: Record<GarageSpecialty, { label: string; icon: string; description: string }> = {
  'Mecanique_Generale': {
    label: 'Mécanique Générale',
    icon: 'Wrench',
    description: 'Moteur, culasse, courroie de distribution, embrayage, boîte manuelle'
  },
  'Diagnostic_Electronique': {
    label: 'Diagnostic Scanner OBD2',
    icon: 'Cpu',
    description: 'Lecture codes défauts, réinitialisation voyants tableau de bord, calculateurs'
  },
  'Depannage_Urgence_24h': {
    label: 'SOS Dépannage 24h/24',
    icon: 'Truck',
    description: 'Intervention d\'urgence sur place ou remorquage rapide partout à Kinshasa'
  },
  'Electricite_Auto': {
    label: 'Électricité Automobile',
    icon: 'Zap',
    description: 'Alternateur, démarreur, batterie, faisceaux, phares, fusibles'
  },
  'Climatisation': {
    label: 'Climatisation Auto',
    icon: 'Wind',
    description: 'Recharge gaz R134a/R1234yf, compresseur, détection de fuite, condenseur'
  },
  'Tolerie_Peinture': {
    label: 'Tôlerie & Peinture au Four',
    icon: 'Shield',
    description: 'Débosselage, redressage châssis, peinture cabine haute brillance'
  },
  'Vulcanisateur_Pneus': {
    label: 'Pneumatiques & Vulcanisation',
    icon: 'Disc',
    description: 'Réparation crevaison, montage, équilibrage et géométrie des trains'
  },
  'Freinage_Suspension': {
    label: 'Freinage & Suspension',
    icon: 'SlidersHorizontal',
    description: 'Plaquettes, disques, amortisseurs, silentblocs, rotules, crémaillère'
  },
  'Vidange_Entretien_Rapide': {
    label: 'Vidange & Entretien Rapide',
    icon: 'Droplet',
    description: 'Changement huile synthétique, filtres à huile/air/carburant, bougies'
  },
  'Boite_Automatique': {
    label: 'Spécialiste Boîte Automatique',
    icon: 'Layers',
    description: 'Vidange boîte auto ATF, convertisseur, électrovannes, révision CVT/DSG'
  },
  'Pieces_Rechange': {
    label: 'Pièces de Rechange Originales',
    icon: 'Package',
    description: 'Fourniture de pièces détachées neuves et d\'origine certifiées'
  }
};

export const INITIAL_GARAGES: GarageProfile[] = [
  {
    id: 'garage-kin-01',
    nom: 'Auto-Tech Pro Kinshasa (Gombe Centre)',
    responsable: 'Maître Éric Mbala',
    titreResponsable: 'Chef d\'Atelier & Ingénieur Diagnostic Électronique',
    commune: 'Gombe',
    adresse: 'Avenue du Port & Croisement Boulevard du 30 Juin',
    repere: 'Réf: À 150m de la Gare Centrale, en face de l\'Hôtel Memling',
    telephonePrincipal: '+243 829 450 112',
    telephoneUrgence: '+243 815 900 888',
    whatsapp: '243829450112',
    email: 'contact@autotechkinshasa.cd',
    horaires: 'Lun - Sam: 07h30 - 18h30 • Service SOS 24/7 sur appel',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.9,
    nombreAvis: 142,
    specialites: [
      'Diagnostic_Electronique',
      'Mecanique_Generale',
      'Depannage_Urgence_24h',
      'Boite_Automatique',
      'Climatisation',
      'Electricite_Auto'
    ],
    marquesExpertise: ['Toyota', 'Mercedes-Benz', 'Hyundai', 'Nissan', 'BMW', 'Lexus', 'Land Rover', 'Peugeot'],
    photos: [
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Centre automobile haut de gamme situé au cœur de la Gombe. Équipé des derniers scanners multimarques Launch et Autel, ponts élévateurs hydrauliques et bancs de géométrie laser. Équipe mobile d\'intervention rapide prête à intervenir en moins de 30 minutes sur Gombe, Barumbu, Lingwala et Ngaliema.',
    servicesInclus: [
      'Scanner complet multimarques avec rapport imprimé ou PDF WhatsApp',
      'Dépannage mobile avec véhicule d\'intervention rapide',
      'Recharge et assainissement climatisation R134a',
      'Vidange complète avec huiles homologuées TotalEnergies 5W30/10W40'
    ],
    tarifsIndicatifs: [
      { prestation: 'Diagnostic Scanner Complet OBD2', prixEstime: '50.000 FC (20 $)', description: 'Rapport complet des calculateurs et effacement voyants' },
      { prestation: 'Intervention Dépannage Mobile Gombe/Ngaliema', prixEstime: '75.000 FC (30 $)', description: 'Déplacement du technicien + matériel sur le lieu de panne' },
      { prestation: 'Recharge Complète Climatisation Gaz R134a', prixEstime: '100.000 FC (40 $)', description: 'Tirage au vide, test d\'étanchéité et recharge avec huile compresseur' },
      { prestation: 'Vidange Moteur + Filtre à Huile Original', prixEstime: '90.000 FC (35 $)', description: 'Huile de synthèse TotalEnergies 5W30/10W40 4L' }
    ],
    avisClients: [
      {
        id: 'rev-01',
        auteur: 'Gaston Kalala',
        commune: 'Gombe',
        note: 5,
        commentaire: 'En panne de batterie en pleine nuit devant l\'immeuble Crown Tower, ils sont arrivés en 20 minutes avec un booster professionnel. Service irréprochable.',
        date: 'Il y a 3 jours',
        vehicule: 'Toyota Prado TXL'
      },
      {
        id: 'rev-02',
        auteur: 'Bibiche Mwamba',
        commune: 'Ngaliema',
        note: 5,
        commentaire: 'Problème de boîte automatique résolu avec succès alors que 2 autres garages voulaient tout remplacer. Maître Éric est très honnête et compétent.',
        date: 'Il y a 1 semaine',
        vehicule: 'Mercedes-Benz ML 350'
      }
    ],
    latitude: -4.3031,
    longitude: 15.3125,
    dateCreation: '2025-01-10',
    planId: 'garage_pro',
    statutAbonnement: 'actif',
    dateInscription: '2026-05-10',
    finEssaiGratuit: '2026-05-24',
    prochaineFacturation: '2026-09-10',
    prixFactureMensuel: 350000,
    estMasque: false,
    invoices: [
      {
        id: 'INV-GAR-001',
        garageId: 'garage-kin-01',
        garageNom: 'Auto-Tech Pro Kinshasa (Gombe Centre)',
        typeEntite: 'garage',
        montantHT: 301724.14,
        tva: 48275.86,
        montantTTC: 350000.00,
        dateEmission: '2026-08-10',
        dateEcheance: '2026-08-25',
        statut: 'payee',
        periode: 'Août - Septembre 2026',
        description: 'Abonnement Atelier SaaS - Formule Expert & Dépannage SOS 24/7'
      }
    ]
  },
  {
    id: 'garage-kin-02',
    nom: 'Garage SOS Panne Limete Express',
    responsable: 'Patrice Ngandu (Doyen)',
    titreResponsable: 'Maître Mécanicien & Spécialiste Moteurs 4x4 / Diesel',
    commune: 'Limete',
    adresse: 'Boulevard Lumumba, 7ème Rue Résidentiel',
    repere: 'Réf: En face du Grand Rond-Point Limete, côté Petit Boulevard',
    telephonePrincipal: '+243 898 220 345',
    telephoneUrgence: '+243 821 777 999',
    whatsapp: '243898220345',
    email: 'sos.limete@autoconcession.cd',
    horaires: 'Ouvert 24h/24 et 7j/7 sans interruption (Équipe de garde nuit)',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.8,
    nombreAvis: 198,
    specialites: [
      'Depannage_Urgence_24h',
      'Mecanique_Generale',
      'Freinage_Suspension',
      'Vulcanisateur_Pneus',
      'Electricite_Auto'
    ],
    marquesExpertise: ['Toyota', 'Nissan', 'Mitsubishi', 'Hyundai', 'Kia', 'Ford', 'Renault', 'Suzuki'],
    photos: [
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Le spécialiste incontournable du dépannage d\'urgence sur tout l\'axe Boulevard Lumumba (Limete, Matete, Masina, N\'djili, Lemba). Dispose de 2 dépanneuses plateaux et d\'ateliers mobiles avec compresseur d\'air, booster haute capacité et pièces courantes.',
    servicesInclus: [
      'Remorquage plateau sur toute la ville de Kinshasa et vers l\'Aéroport de N\'djili',
      'Démarrage booster 12V/24V et remplacement batterie neuve sur place',
      'Changement et vulcanisation pneu crevé sur lieu de panne',
      'Réparation surchauffe moteur, durite et radiateur'
    ],
    tarifsIndicatifs: [
      { prestation: 'Remorquage Dépanneuse Plateau Axe Limete/Gombe', prixEstime: '120.000 FC (50 $)', description: 'Prise en charge rapide avec fixation sécurisée' },
      { prestation: 'Démarrage Booster d\'Urgence sur Place', prixEstime: '40.000 FC (15 $)', description: 'Test de tension alternateur inclus' },
      { prestation: 'Vulcanisation & Remplacement Roue de Secours', prixEstime: '25.000 FC (10 $)', description: 'Pneumatique sur le lieu de panne' },
      { prestation: 'Remplacement Plaquettes de Frein (Main d\'œuvre)', prixEstime: '35.000 FC (15 $)', description: 'Par essieu avant ou arrière' }
    ],
    avisClients: [
      {
        id: 'rev-03',
        auteur: 'Dieudonné Tshisekedi',
        commune: 'Limete',
        note: 5,
        commentaire: 'En rentrant de N\'djili à 23h, durite de radiateur éclatée. Patrice et son équipe sont arrivés avec la pièce de rechange et du liquide de refroidissement. Sauvé en pleine nuit !',
        date: 'Il y a 5 jours',
        vehicule: 'Toyota Hilux D4D'
      }
    ],
    latitude: -4.3541,
    longitude: 15.3421,
    dateCreation: '2025-01-05',
    planId: 'garage_enterprise',
    statutAbonnement: 'actif',
    dateInscription: '2026-04-20',
    finEssaiGratuit: '2026-05-04',
    prochaineFacturation: '2026-09-20',
    prixFactureMensuel: 750000,
    estMasque: false,
    invoices: [
      {
        id: 'INV-GAR-002',
        garageId: 'garage-kin-02',
        garageNom: 'Garage SOS Panne Limete Express',
        typeEntite: 'garage',
        montantHT: 646551.72,
        tva: 103448.28,
        montantTTC: 750000.00,
        dateEmission: '2026-08-20',
        dateEcheance: '2026-09-04',
        statut: 'en_attente',
        periode: 'Août - Septembre 2026',
        description: 'Abonnement Atelier SaaS - Formule Réseau Multisite & Flottes Pro'
      }
    ]
  },
  {
    id: 'garage-kin-03',
    nom: 'Clinique Auto Ngaliema & UPN',
    responsable: 'Ing. Serge Lukusa',
    titreResponsable: 'Électricien Auto & Diagnostic Haute Fréquence',
    commune: 'Ngaliema',
    adresse: 'Avenue de la Montagne, Rond-Point UPN vers Ozone',
    repere: 'Réf: À 200m de l\'Université Pédagogique Nationale (UPN), station Cobil',
    telephonePrincipal: '+243 812 334 455',
    telephoneUrgence: '+243 897 110 022',
    whatsapp: '243812334455',
    email: 'clinique.ngaliema@autoconcession.cd',
    horaires: 'Lun - Sam: 07h00 - 19h00 • Dimanche sur astreinte',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.9,
    nombreAvis: 116,
    specialites: [
      'Diagnostic_Electronique',
      'Electricite_Auto',
      'Climatisation',
      'Mecanique_Generale',
      'Pieces_Rechange'
    ],
    marquesExpertise: ['Toyota', 'Mercedes-Benz', 'Nissan', 'Hyundai', 'Honda', 'Audi', 'Volkswagen'],
    photos: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Atelier de référence dans la zone Ouest de Kinshasa (Ngaliema, Mont-Ngafula, Binza Ozone, Kintambo, Delvaux, UPN). Spécialiste de la résolution des pannes électroniques complexes, injection directe, calculateurs et climatisation renforcée climat tropical.',
    servicesInclus: [
      'Diagnostic électronique complet avec scanner de dernière génération',
      'Réparation alternateurs, démarreurs et calculateurs moteur',
      'Nettoyage injecteurs aux ultrasons et contrôle débit',
      'Stock permanent de pièces de rechange d\'origine'
    ],
    tarifsIndicatifs: [
      { prestation: 'Diagnostic et Reset Calculateurs', prixEstime: '45.000 FC (18 $)', description: 'Bilan complet électronique' },
      { prestation: 'Révision Alternateur / Démarreur', prixEstime: '60.000 FC (25 $)', description: 'Remplacement charbons et régulateur' },
      { prestation: 'Nettoyage Injecteurs aux Ultrasons', prixEstime: '75.000 FC (30 $)', description: 'Pour moteur 4 cylindres' }
    ],
    avisClients: [
      {
        id: 'rev-04',
        auteur: 'Pr. Christine Mukendi',
        commune: 'Ngaliema',
        note: 5,
        commentaire: 'Travail très soigné. Ils ont trouvé une panne de court-circuit sur ma Mercedes que personne n\'arrivait à isoler. Je recommande les yeux fermés.',
        date: 'Il y a 2 semaines',
        vehicule: 'Mercedes Classe C'
      }
    ],
    latitude: -4.3852,
    longitude: 15.2536,
    dateCreation: '2025-01-15',
    planId: 'garage_pro',
    statutAbonnement: 'essai_gratuit',
    dateInscription: '2026-08-18',
    finEssaiGratuit: '2026-09-01',
    prochaineFacturation: '2026-09-02',
    prixFactureMensuel: 350000,
    estMasque: false,
    invoices: []
  },
  {
    id: 'garage-kin-04',
    nom: 'Atelier Maître Bavon Bandal & Kintambo',
    responsable: 'Maître Bavon Yoka',
    titreResponsable: 'Maître Mécanicien Tôlier & Spécialiste Châssis',
    commune: 'Bandalungwa',
    adresse: 'Avenue Kasa-Vubu vers Rond-Point Moulaert',
    repere: 'Réf: En face du terrain municipal de Bandalungwa, à côté de la station Engen',
    telephonePrincipal: '+243 850 789 123',
    telephoneUrgence: '+243 820 445 667',
    whatsapp: '243850789123',
    email: 'bavon.bandal@autoconcession.cd',
    horaires: 'Lun - Sam: 07h30 - 18h00 • Dimanche: 08h30 - 14h00',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.7,
    nombreAvis: 89,
    specialites: [
      'Mecanique_Generale',
      'Tolerie_Peinture',
      'Freinage_Suspension',
      'Vidange_Entretien_Rapide',
      'Depannage_Urgence_24h'
    ],
    marquesExpertise: ['Toyota', 'Nissan', 'Suzuki', 'Hyundai', 'Mazda', 'Renault', 'Daihatsu'],
    photos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Atelier populaire réputé pour sa rapidité et ses tarifs très accessibles. Idéal pour tous vos entretiens courants, révision mécanique, tôlerie-peinture, suspension renforcée pour les routes de Kinshasa et dépannage sur Bandalungwa, Kintambo, Selembao et Kasavubu.',
    servicesInclus: [
      'Réparation trains roulants, amortisseurs et bras de suspension',
      'Peinture carrosserie au four et redressage marbre',
      'Dépannage mobile rapide par motard outillé pour les pannes légères',
      'Vidange complète express en moins de 30 minutes'
    ],
    tarifsIndicatifs: [
      { prestation: 'Vidange Express Huile 15W40 + Filtre', prixEstime: '60.000 FC (24 $)', description: 'Idéal pour moteurs essence et diesel' },
      { prestation: 'Remplacement Kit Amortisseurs Avant', prixEstime: '50.000 FC (20 $)', description: 'Main d\'œuvre montage paire avant' },
      { prestation: 'Peinture Élément Carrosserie (Aile/Porte)', prixEstime: '85.000 FC (35 $)', description: 'Apprêt + peinture métallisée au four' }
    ],
    latitude: -4.3367,
    longitude: 15.2854,
    dateCreation: '2025-01-20',
    planId: 'garage_starter',
    statutAbonnement: 'actif',
    dateInscription: '2026-03-01',
    finEssaiGratuit: '2026-03-15',
    prochaineFacturation: '2026-09-01',
    prixFactureMensuel: 150000,
    estMasque: false,
    invoices: []
  },
  {
    id: 'garage-kin-05',
    nom: 'Lemba Super Service & Électro-Mécanique',
    responsable: 'Jean-Claude Tshimanga',
    titreResponsable: 'Chef d\'Atelier Électromécanique & Freinage',
    commune: 'Lemba',
    adresse: 'Avenue By-Pass, Croisement Rond-Point Super Lemba',
    repere: 'Réf: À 100m du Rond-Point Super Lemba, direction Université de Kinshasa (UNIKIN)',
    telephonePrincipal: '+243 824 556 789',
    telephoneUrgence: '+243 810 998 877',
    whatsapp: '243824556789',
    email: 'lemba.auto@autoconcession.cd',
    horaires: 'Lun - Sam: 07h00 - 19h00 • Dimanche: 08h00 - 15h00',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.8,
    nombreAvis: 104,
    specialites: [
      'Mecanique_Generale',
      'Electricite_Auto',
      'Diagnostic_Electronique',
      'Freinage_Suspension',
      'Vulcanisateur_Pneus',
      'Depannage_Urgence_24h'
    ],
    marquesExpertise: ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'Peugeot', 'Mitsubishi'],
    photos: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Implanté sur l\'axe stratégique de l\'Avenue By-Pass, cet atelier dessert efficacement Lemba, Matete, Ngaba, Mont-Ngafula et le campus UNIKIN. Équipe d\'intervention rapide pour les pannes sur By-Pass, Triangle Campus et Route de Matadi.',
    servicesInclus: [
      'Diagnostic scanner et effacement codes erreurs',
      'Réfection complète freins et remplacement liquide DOT4',
      'Dépannage d\'urgence pour véhicules en panne de montée vers UNIKIN/Mont-Ngafula',
      'Réparation faisceau électrique et coupe-circuit antivol'
    ],
    tarifsIndicatifs: [
      { prestation: 'Diagnostic Électronique et Contrôle Charge', prixEstime: '40.000 FC (16 $)', description: 'Lecture mémoire calculateurs' },
      { prestation: 'Purge et Changement Liquide de Frein', prixEstime: '30.000 FC (12 $)', description: 'Liquide DOT4 inclus' },
      { prestation: 'Dépannage Déplacement Axe By-Pass/Lemba', prixEstime: '50.000 FC (20 $)', description: 'Arrivée sur site en 20 min' }
    ],
    latitude: -4.3987,
    longitude: 15.3245,
    dateCreation: '2025-02-01',
    planId: 'garage_pro',
    statutAbonnement: 'actif',
    dateInscription: '2026-04-01',
    finEssaiGratuit: '2026-04-15',
    prochaineFacturation: '2026-09-01',
    prixFactureMensuel: 350000,
    estMasque: false,
    invoices: []
  },
  {
    id: 'garage-kin-06',
    nom: 'Atelier Kintambo Magasin & Climatisation',
    responsable: 'Fiston Bompere',
    titreResponsable: 'Frigoriste Automobile & Électricien Spécialisé',
    commune: 'Kintambo',
    adresse: 'Avenue Kasa-Vubu vers Kintambo Magasin',
    repere: 'Réf: Derrière la station Total Kintambo Magasin, en face de l\'arrêt des bus',
    telephonePrincipal: '+243 891 112 233',
    telephoneUrgence: '+243 827 889 900',
    whatsapp: '243891112233',
    email: 'kintambo.clim@autoconcession.cd',
    horaires: 'Lun - Sam: 08h00 - 18h30 • Permanence Dimanche matin',
    ouvertDimanche: true,
    estDepannageMobile24h: false,
    estCertifie: true,
    noteGlobale: 4.9,
    nombreAvis: 76,
    specialites: [
      'Climatisation',
      'Electricite_Auto',
      'Diagnostic_Electronique',
      'Vidange_Entretien_Rapide'
    ],
    marquesExpertise: ['Toyota', 'Mercedes-Benz', 'BMW', 'Audi', 'Hyundai', 'Nissan', 'Ford'],
    photos: [
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Le maître de la climatisation automobile à Kintambo Magasin. Matériel d\'injection d\'azote pour détection ultra-précise des micro-fuites, nettoyage antibactérien de l\'évaporateur et stock de compresseurs d\'origine Denso/Sanden.',
    servicesInclus: [
      'Test d\'étanchéité sous pression d\'azote',
      'Recharge gaz R134a avec balance électronique',
      'Remplacement détendeur, filtre déshydratant et condenseur',
      'Réparation pulseur d\'air et commandes de climatisation'
    ],
    tarifsIndicatifs: [
      { prestation: 'Diagnostic Fuite Climatisation à l\'Azote', prixEstime: '35.000 FC (14 $)', description: 'Test sous haute pression avec traceur UV' },
      { prestation: 'Recharge Gaz R134a Véhicule Citadine / Berline', prixEstime: '90.000 FC (36 $)', description: 'Gaz certifié pur 100%' },
      { prestation: 'Recharge Gaz R134a Gros SUV / Double Évaporateur (Prado/Land Cruiser)', prixEstime: '130.000 FC (50 $)', description: 'Charge complète avant + arrière' }
    ],
    latitude: -4.3214,
    longitude: 15.2712,
    dateCreation: '2025-02-05',
    planId: 'garage_starter',
    statutAbonnement: 'actif',
    dateInscription: '2026-05-15',
    finEssaiGratuit: '2026-05-29',
    prochaineFacturation: '2026-09-15',
    prixFactureMensuel: 150000,
    estMasque: false,
    invoices: []
  },
  {
    id: 'garage-kin-07',
    nom: 'Garage Central Matete & Masina',
    responsable: 'Alain Makiese',
    titreResponsable: 'Maître Mécanicien Injection & Boîtes de Vitesse',
    commune: 'Matete',
    adresse: 'Quartier Banunu, Croisement Boulevard Lumumba & Pont Matete',
    repere: 'Réf: À 150m du Marché de Matete, côté entrée Banunu',
    telephonePrincipal: '+243 819 665 432',
    telephoneUrgence: '+243 855 001 122',
    whatsapp: '243819665432',
    email: 'matete.auto@autoconcession.cd',
    horaires: 'Ouvert 7j/7 de 07h00 à 20h00 • Dépannage nuit sur appel',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.7,
    nombreAvis: 130,
    specialites: [
      'Mecanique_Generale',
      'Depannage_Urgence_24h',
      'Freinage_Suspension',
      'Vulcanisateur_Pneus',
      'Pieces_Rechange'
    ],
    marquesExpertise: ['Toyota', 'Nissan', 'Mitsubishi', 'Hyundai', 'Isuzu', 'Kia'],
    photos: [
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Atelier de mécanique lourde et dépannage rapide couvrant Matete, Lemba, Masina, Kisenso et N\'djili. Spécialiste des utilitaires, pick-up 4x4, minibus Hiace et véhicules particuliers.',
    servicesInclus: [
      'Révision complète moteur diesel et essence',
      'Remplacement kit embrayage et volant moteur',
      'Dépannage mobile avec compresseur et booster',
      'Restauration suspension avant (rotules, silentblocs, crémaillères)'
    ],
    tarifsIndicatifs: [
      { prestation: 'Remplacement Disque d\'Embrayage (Main d\'œuvre)', prixEstime: '90.000 FC (35 $)', description: 'Dépose et repose boîte manuelle' },
      { prestation: 'Dépannage Rapide Secteur Matete/Masina', prixEstime: '45.000 FC (18 $)', description: 'Arrivée du mécanicien avec caisse à outils' }
    ],
    latitude: -4.3812,
    longitude: 15.3654,
    dateCreation: '2025-02-10',
    planId: 'garage_pro',
    statutAbonnement: 'actif',
    dateInscription: '2026-06-01',
    finEssaiGratuit: '2026-06-15',
    prochaineFacturation: '2026-09-01',
    prixFactureMensuel: 350000,
    estMasque: false,
    invoices: []
  },
  {
    id: 'garage-kin-08',
    nom: 'SOS Dépannage N\'djili Aéroport & Bitshakutshaku',
    responsable: 'Capitaine Mbuyi',
    titreResponsable: 'Chef Dépanneur Remorqueur Routier',
    commune: 'Ndjili',
    adresse: 'Boulevard Lumumba, Quartier 1 vers Sainte Thérèse',
    repere: 'Réf: À 200m de la Place Sainte Thérèse, en direction de l\'Aéroport International de N\'djili',
    telephonePrincipal: '+243 828 900 111',
    telephoneUrgence: '+243 899 000 999',
    whatsapp: '243828900111',
    email: 'sos.ndjili@autoconcession.cd',
    horaires: 'Service Continu 24h/24 et 7j/7 • Jour et Nuit',
    ouvertDimanche: true,
    estDepannageMobile24h: true,
    estCertifie: true,
    noteGlobale: 4.8,
    nombreAvis: 165,
    specialites: [
      'Depannage_Urgence_24h',
      'Vulcanisateur_Pneus',
      'Mecanique_Generale',
      'Electricite_Auto'
    ],
    marquesExpertise: ['Toutes marques', 'Toyota', 'Mercedes', 'Nissan', 'Hyundai', 'Kia', 'Ford'],
    photos: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Poste stratégique de secours automobile sur la route de l\'Aéroport International de N\'djili. Ne ratez plus votre vol à cause d\'une crevaison ou d\'une panne subite : notre équipe intervient en 15 minutes chrono le long du Boulevard Lumumba et dans tout le district de la Tshangu.',
    servicesInclus: [
      'Assistance d\'urgence aéroport 24/7 (crevaison, batterie, surchauffe)',
      'Remorquage camion plateau sécurisé',
      'Transfert express de vos passagers vers l\'aéroport en cas d\'immobilisation',
      'Diagnostic express et réparation de fortune pour vous permettre de rouler'
    ],
    tarifsIndicatifs: [
      { prestation: 'Assistance Express Axe Aéroport N\'djili', prixEstime: '60.000 FC (24 $)', description: 'Booster, gonflage, déblocage' },
      { prestation: 'Remorquage Plateau N\'djili vers Gombe/Limete', prixEstime: '150.000 FC (60 $)', description: 'Camion plateau avec treuil électrique' }
    ],
    latitude: -4.4123,
    longitude: 15.3987,
    dateCreation: '2025-02-12',
    planId: 'garage_enterprise',
    statutAbonnement: 'facture_en_attente',
    dateInscription: '2026-07-01',
    finEssaiGratuit: '2026-07-15',
    prochaineFacturation: '2026-08-01',
    prixFactureMensuel: 750000,
    estMasque: false,
    invoices: [
      {
        id: 'INV-GAR-003',
        garageId: 'garage-kin-08',
        garageNom: 'SOS Dépannage N\'djili Aéroport & Bitshakutshaku',
        typeEntite: 'garage',
        montantHT: 646551.72,
        tva: 103448.28,
        montantTTC: 750000.00,
        dateEmission: '2026-08-01',
        dateEcheance: '2026-08-16',
        statut: 'en_retard',
        periode: 'Août 2026',
        description: 'Abonnement Atelier SaaS - Formule Réseau Multisite & Flottes Pro'
      }
    ]
  }
];
