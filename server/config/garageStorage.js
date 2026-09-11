/**
 * Moteur de stockage résilient en mémoire pour les GARAGES, SERVICES, PHOTOS et SOS DÉPANNAGE
 * Permet au backend Node.js de fonctionner avec une fidélité SQL complète en l'absence de MySQL actif.
 */

const INITIAL_GARAGES = [
  {
    id: 1,
    user_id: 4,
    nom: 'SOS Dépannage Kin Mécanique',
    slug: 'sos-depannage-kin-mecanique',
    description: 'Centre d\'assistance automobile rapide et atelier mécanique de pointe à Kinshasa. Dépannage d\'urgence 24h/24, remorquage sécurisé et réparation multi-marques.',
    commune: 'Kasa-Vubu',
    adresse: '142 Avenue Kasa-Vubu, Rond-point Kimpwanza',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243 99 888 0303',
    telephone_urgence: '+243 81 999 0303',
    whatsapp: '+243 99 888 0303',
    email: 'sos@kin-mecanique.cd',
    latitude: -4.3315,
    longitude: 15.3094,
    horaires: '24h/24 & 7j/7 (Urgences)',
    is_open_24h: 1,
    has_towing_truck: 1,
    has_mobile_mechanic: 1,
    specialties: [
      'Dépannage 24/7',
      'Remorquage Express',
      'Mécanique d\'urgence',
      'Électricité & Batterie',
      'Diagnostic Valise OBD-II'
    ],
    photo_url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    total_reviews: 48,
    verified: 1,
    statut_validation: 'valide',
    motif_rejet: null,
    statut_abonnement: 'actif',
    created_at: new Date('2025-02-01T09:00:00Z'),
    updated_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 2,
    user_id: 1,
    nom: 'Centre Auto Gombe Performance',
    slug: 'centre-auto-gombe-performance',
    description: 'Atelier mécanique de référence au cœur de la Gombe. Spécialisé dans l\'entretien et la maintenance électronique des véhicules récents, 4x4 et berlines haut de gamme.',
    commune: 'Gombe',
    adresse: '48 Avenue de la Justice, face Ministère des Finances',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243 89 222 1100',
    telephone_urgence: '+243 85 222 1100',
    whatsapp: '+243 89 222 1100',
    email: 'contact@gombe-performance.cd',
    latitude: -4.3032,
    longitude: 15.3025,
    horaires: 'Lun - Sam : 07h30 - 18h30',
    is_open_24h: 0,
    has_towing_truck: 1,
    has_mobile_mechanic: 0,
    specialties: [
      'Diagnostic Électronique',
      'Mécanique Allemande & Japonaise',
      'Climatisation Auto',
      'Parallélisme & Géométrie 3D',
      'Vidange de précision'
    ],
    photo_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    total_reviews: 34,
    verified: 1,
    statut_validation: 'valide',
    motif_rejet: null,
    statut_abonnement: 'actif',
    created_at: new Date('2025-02-05T10:00:00Z'),
    updated_at: new Date('2025-02-05T10:00:00Z')
  },
  {
    id: 3,
    user_id: null,
    nom: 'Atelier Limete Poids Lourds & 4x4',
    slug: 'atelier-limete-poids-lourds-4x4',
    description: 'Expert en remise en état, tôlerie-peinture et mécanique lourde pour 4x4 tout-terrain (Toyota Land Cruiser, Hilux) et utilitaires légers.',
    commune: 'Limete',
    adresse: '7ème Rue Industrielle, Quartier Résidentiel',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243 82 777 4455',
    telephone_urgence: '+243 82 777 4455',
    whatsapp: '+243 82 777 4455',
    email: 'limete.meca@congocar.cd',
    latitude: -4.3541,
    longitude: 15.3412,
    horaires: 'Lun - Sam : 08h00 - 17h30',
    is_open_24h: 0,
    has_towing_truck: 1,
    has_mobile_mechanic: 1,
    specialties: [
      'Spécialiste Toyota Land Cruiser',
      'Tôlerie & Peinture au four',
      'Suspensions & Amortisseurs 4x4',
      'Système de Freinage'
    ],
    photo_url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    total_reviews: 21,
    verified: 1,
    statut_validation: 'valide',
    motif_rejet: null,
    statut_abonnement: 'actif',
    created_at: new Date('2025-02-12T11:00:00Z'),
    updated_at: new Date('2025-02-12T11:00:00Z')
  },
  {
    id: 4,
    user_id: null,
    nom: 'Express Mécanique Ngaliema',
    slug: 'express-mecanique-ngaliema',
    description: 'Atelier de quartier moderne offrant des services de diagnostic rapide, révision périodique et pneumatiques pour particuliers.',
    commune: 'Ngaliema',
    adresse: 'Avenue Macampagne n°12',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243 84 111 2233',
    telephone_urgence: '+243 84 111 2233',
    whatsapp: '+243 84 111 2233',
    email: 'ngaliema@express-meca.cd',
    latitude: -4.3392,
    longitude: 15.2654,
    horaires: 'Lun - Sam : 08h00 - 18h00',
    is_open_24h: 0,
    has_towing_truck: 0,
    has_mobile_mechanic: 1,
    specialties: [
      'Vidange express',
      'Plaquettes de freins',
      'Pneumatiques & Équilibrage',
      'Batteries automobiles'
    ],
    photo_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    rating: 4.5,
    total_reviews: 6,
    verified: 0,
    statut_validation: 'en_attente',
    motif_rejet: null,
    statut_abonnement: 'essai_gratuit',
    created_at: new Date('2025-03-01T14:30:00Z'),
    updated_at: new Date('2025-03-01T14:30:00Z')
  }
];

const INITIAL_GARAGE_SERVICES = [
  // Services pour Garage 1 (SOS Dépannage Kin Mécanique)
  {
    id: 1,
    garage_id: 1,
    nom: 'Dépannage & Remorquage d\'Urgence Kinshasa',
    description: 'Intervention sur site en moins de 45 minutes partout à Kinshasa pour remorquage sécurisé vers notre atelier ou votre domicile.',
    prix_indicatif: 80,
    duree_estimee: '30-45 min',
    is_disponible: 1,
    icone: 'truck',
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 2,
    garage_id: 1,
    nom: 'Diagnostic Valise Électronique OBD-II',
    description: 'Lecture et effacement des codes défauts, test capteurs injection, ABS, Airbag et système d\'alimentation électrique.',
    prix_indicatif: 35,
    duree_estimee: '30 min',
    is_disponible: 1,
    icone: 'activity',
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 3,
    garage_id: 1,
    nom: 'Vidange Complète & Remplacement Filtres',
    description: 'Vidange avec huile certifiée de synthèse (5W30, 5W40 ou 10W40), remplacement filtre à huile et filtre à air, 25 points de contrôle.',
    prix_indicatif: 45,
    duree_estimee: '45 min',
    is_disponible: 1,
    icone: 'droplet',
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 4,
    garage_id: 1,
    nom: 'Recharge & Diagnostic Climatisation Gaz R134a',
    description: 'Détection de fuite sous vide, injection de traceur UV et recharge complète de gaz frigorigène pour un froid polaire garanti.',
    prix_indicatif: 60,
    duree_estimee: '1 heure',
    is_disponible: 1,
    icone: 'wind',
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 5,
    garage_id: 1,
    nom: 'Remplacement Plaquettes & Disques de Freins',
    description: 'Montage de plaquettes de freins d\'origine ou haute endurance adaptées aux routes exigeantes de Kinshasa et purge liquide de frein.',
    prix_indicatif: 50,
    duree_estimee: '1 heure',
    is_disponible: 1,
    icone: 'shield',
    created_at: new Date('2025-02-01T09:00:00Z')
  },

  // Services pour Garage 2 (Centre Auto Gombe Performance)
  {
    id: 6,
    garage_id: 2,
    nom: 'Diagnostic Électronique Constructeur Allemand / Japonais',
    description: 'Analyse approfondie des calculateurs moteurs pour marques premium (Mercedes-Benz, BMW, Toyota, Porsche, Audi, Lexus).',
    prix_indicatif: 65,
    duree_estimee: '45 min',
    is_disponible: 1,
    icone: 'cpu',
    created_at: new Date('2025-02-05T10:00:00Z')
  },
  {
    id: 7,
    garage_id: 2,
    nom: 'Géométrie & Parallélisme 3D Laser Haute Précision',
    description: 'Alignement au millimètre des trains avant et arrière pour éliminer l\'usure irrégulière des pneus et fiabiliser la tenue de route.',
    prix_indicatif: 40,
    duree_estimee: '45 min',
    is_disponible: 1,
    icone: 'compass',
    created_at: new Date('2025-02-05T10:00:00Z')
  },
  {
    id: 8,
    garage_id: 2,
    nom: 'Tôlerie & Peinture Haute Brillance au Four',
    description: 'Redressage marbre, ponçage haute précision et peinture avec teinte constructeur exacte en cabine chauffée étanche.',
    prix_indicatif: 150,
    duree_estimee: '48-72h',
    is_disponible: 1,
    icone: 'brush',
    created_at: new Date('2025-02-05T10:00:00Z')
  }
];

const INITIAL_GARAGE_IMAGES = [
  {
    id: 1,
    garage_id: 1,
    image_url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
    titre: 'Atelier principal et ponts élévateurs',
    is_primary: 1,
    display_order: 1,
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 2,
    garage_id: 1,
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    titre: 'Flotte de camions de dépannage 24/7',
    is_primary: 0,
    display_order: 2,
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 3,
    garage_id: 1,
    image_url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80',
    titre: 'Banc de diagnostic valise OBD électronique',
    is_primary: 0,
    display_order: 3,
    created_at: new Date('2025-02-01T09:00:00Z')
  },
  {
    id: 4,
    garage_id: 2,
    image_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    titre: 'Showroom technique et cabine de réglage',
    is_primary: 1,
    display_order: 1,
    created_at: new Date('2025-02-05T10:00:00Z')
  },
  {
    id: 5,
    garage_id: 2,
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    titre: 'Zone de maintenance véhicules de luxe',
    is_primary: 0,
    display_order: 2,
    created_at: new Date('2025-02-05T10:00:00Z')
  }
];

const INITIAL_BREAKDOWNS = [
  {
    id: 1,
    user_id: 5,
    garage_id: 1,
    client_name: 'Patient Mwamba',
    client_phone: '+243 85 777 0404',
    commune: 'Gombe',
    car_model: 'Toyota Prado TXL 2020',
    issue_description: 'Batterie à plat suite à oubli des feux au parking du Grand Hôtel. Besoin de booster ou remplacement batterie.',
    status: 'termine',
    emergency_level: 'urgent',
    created_at: new Date('2025-02-15T10:30:00Z'),
    updated_at: new Date('2025-02-15T11:15:00Z')
  },
  {
    id: 2,
    user_id: null,
    garage_id: 1,
    client_name: 'Alain Kanyinda',
    client_phone: '+243 81 222 3344',
    commune: 'Limete',
    car_model: 'Nissan Patrol V8',
    issue_description: 'Surchauffe moteur sur le Boulevard Lumumba. Fumée blanche sous le capot, arrêt immédiat sur le bas-côté.',
    status: 'en_attente',
    emergency_level: 'critique',
    created_at: new Date('2025-03-02T16:00:00Z'),
    updated_at: new Date('2025-03-02T16:00:00Z')
  }
];

/**
 * Traite les requêtes SQL liées aux garages, services, photos et SOS dépannage
 */
const handleGarageQuery = (normalizedSql, rawSql, params, memoryStore) => {
  // S'assurer que les structures sont initialisées dans memoryStore
  if (!memoryStore.garages) {
    memoryStore.garages = [...INITIAL_GARAGES];
  }
  if (!memoryStore.garage_services) {
    memoryStore.garage_services = [...INITIAL_GARAGE_SERVICES];
  }
  if (!memoryStore.garage_images) {
    memoryStore.garage_images = [...INITIAL_GARAGE_IMAGES];
  }
  if (!memoryStore.breakdown_requests) {
    memoryStore.breakdown_requests = [...INITIAL_BREAKDOWNS];
  }

  // =========================================================================
  // 1. TABLE GARAGE_SERVICES
  // =========================================================================
  if (normalizedSql.includes('GARAGE_SERVICES')) {
    // 1.1 SELECT SERVICES FOR GARAGE
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE GARAGE_ID = ?') || normalizedSql.includes('WHERE G.GARAGE_ID = ?'))) {
      const gId = Number(params[0]);
      return memoryStore.garage_services.filter(s => Number(s.garage_id) === gId);
    }

    // 1.2 SELECT SINGLE SERVICE BY ID
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE ID = ?')) {
      const sId = Number(params[0]);
      return memoryStore.garage_services.filter(s => Number(s.id) === sId);
    }

    // 1.3 INSERT INTO GARAGE_SERVICES
    if (normalizedSql.startsWith('INSERT INTO GARAGE_SERVICES')) {
      const newId = memoryStore.garage_services.length > 0
        ? Math.max(...memoryStore.garage_services.map(s => Number(s.id))) + 1
        : 1;

      const newService = {
        id: newId,
        garage_id: Number(params[0]),
        nom: params[1] || 'Service Mécanique',
        description: params[2] || '',
        prix_indicatif: params[3] !== undefined && params[3] !== null ? parseFloat(params[3]) : 0,
        duree_estimee: params[4] || '1 heure',
        is_disponible: params[5] !== undefined ? (params[5] ? 1 : 0) : 1,
        icone: params[6] || 'tool',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Si colonnes explicites
      const colMatch = rawSql.match(/INSERT\s+INTO\s+garage_services\s*\(([^)]+)\)/i);
      if (colMatch && colMatch[1]) {
        const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());
        columns.forEach((col, idx) => {
          let val = params[idx];
          if (col === 'garage_id') val = Number(val);
          if (col === 'prix_indicatif') val = parseFloat(val) || 0;
          if (col === 'is_disponible') val = val ? 1 : 0;
          newService[col] = val;
        });
      }

      memoryStore.garage_services.push(newService);
      return { insertId: newId, affectedRows: 1 };
    }

    // 1.4 UPDATE GARAGE_SERVICES
    if (normalizedSql.startsWith('UPDATE GARAGE_SERVICES')) {
      const sId = Number(params[params.length - 1]);
      const sIdx = memoryStore.garage_services.findIndex(s => Number(s.id) === sId);
      if (sIdx !== -1) {
        const serv = memoryStore.garage_services[sIdx];
        if (normalizedSql.includes('NOM = ?')) {
          const idx = normalizedSql.indexOf('NOM = ?');
          serv.nom = params[0];
        }
        if (rawSql.includes('prix_indicatif')) {
          // generic update detection
          serv.updated_at = new Date();
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 1.5 DELETE FROM GARAGE_SERVICES
    if (normalizedSql.startsWith('DELETE FROM GARAGE_SERVICES')) {
      const sId = Number(params[0]);
      const initialLen = memoryStore.garage_services.length;
      memoryStore.garage_services = memoryStore.garage_services.filter(s => Number(s.id) !== sId);
      return { affectedRows: initialLen - memoryStore.garage_services.length };
    }
  }

  // =========================================================================
  // 2. TABLE GARAGE_IMAGES (PHOTOS ATELIER)
  // =========================================================================
  if (normalizedSql.includes('GARAGE_IMAGES')) {
    // 2.1 SELECT PHOTOS FOR GARAGE
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE GARAGE_ID = ?')) {
      const gId = Number(params[0]);
      return memoryStore.garage_images
        .filter(img => Number(img.garage_id) === gId)
        .sort((a, b) => (b.is_primary || 0) - (a.is_primary || 0) || (a.display_order || 0) - (b.display_order || 0));
    }

    // 2.2 INSERT INTO GARAGE_IMAGES
    if (normalizedSql.startsWith('INSERT INTO GARAGE_IMAGES')) {
      const newId = memoryStore.garage_images.length > 0
        ? Math.max(...memoryStore.garage_images.map(i => Number(i.id))) + 1
        : 1;

      const newImg = {
        id: newId,
        garage_id: Number(params[0]),
        image_url: params[1],
        titre: params[2] || '',
        is_primary: params[3] ? 1 : 0,
        display_order: Number(params[4] || 1),
        created_at: new Date()
      };

      memoryStore.garage_images.push(newImg);
      return { insertId: newId, affectedRows: 1 };
    }

    // 2.3 DELETE FROM GARAGE_IMAGES
    if (normalizedSql.startsWith('DELETE FROM GARAGE_IMAGES')) {
      const imgId = Number(params[0]);
      const initialLen = memoryStore.garage_images.length;
      memoryStore.garage_images = memoryStore.garage_images.filter(i => Number(i.id) !== imgId);
      return { affectedRows: initialLen - memoryStore.garage_images.length };
    }
  }

  // =========================================================================
  // 3. TABLE BREAKDOWN_REQUESTS (DEMANDES SOS DÉPANNAGE)
  // =========================================================================
  if (normalizedSql.includes('BREAKDOWN_REQUESTS')) {
    // 3.1 SELECT BREAKDOWN REQUESTS
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...memoryStore.breakdown_requests];
      if (normalizedSql.includes('WHERE GARAGE_ID = ?')) {
        const gId = Number(params[0]);
        list = list.filter(b => Number(b.garage_id) === gId);
      }
      return list.map(b => {
        const g = memoryStore.garages.find(g => Number(g.id) === Number(b.garage_id)) || {};
        return {
          ...b,
          garage_nom: g.nom || 'SOS Kin Mécanique',
          garage_phone: g.telephone || '+243 99 888 0303'
        };
      });
    }

    // 3.2 INSERT INTO BREAKDOWN_REQUESTS
    if (normalizedSql.startsWith('INSERT INTO BREAKDOWN_REQUESTS')) {
      const newId = memoryStore.breakdown_requests.length > 0
        ? Math.max(...memoryStore.breakdown_requests.map(b => Number(b.id))) + 1
        : 1;

      const newB = {
        id: newId,
        user_id: params[0] ? Number(params[0]) : null,
        garage_id: params[1] ? Number(params[1]) : 1,
        client_name: params[2] || 'Client',
        client_phone: params[3] || '+243',
        commune: params[4] || 'Gombe',
        car_model: params[5] || 'Véhicule',
        issue_description: params[6] || 'Panne',
        status: 'en_attente',
        emergency_level: params[7] || 'urgent',
        created_at: new Date(),
        updated_at: new Date()
      };

      memoryStore.breakdown_requests.unshift(newB);
      return { insertId: newId, affectedRows: 1 };
    }

    // 3.3 UPDATE BREAKDOWN_REQUESTS STATUS
    if (normalizedSql.startsWith('UPDATE BREAKDOWN_REQUESTS')) {
      const bId = Number(params[params.length - 1]);
      const status = params[0];
      const target = memoryStore.breakdown_requests.find(b => Number(b.id) === bId);
      if (target) {
        target.status = status;
        target.updated_at = new Date();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // =========================================================================
  // 4. TABLE GARAGES
  // =========================================================================
  if (normalizedSql.includes('GARAGES')) {
    // 4.1 SELECT SINGLE GARAGE BY ID (avec détails, services et photos)
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE G.ID = ?') || normalizedSql.includes('WHERE ID = ?'))) {
      const gId = Number(params[0]);
      const garage = memoryStore.garages.find(g => Number(g.id) === gId);
      if (!garage) return [];

      const owner = memoryStore.users.find(u => Number(u.id) === Number(garage.user_id)) || {};
      const services = memoryStore.garage_services.filter(s => Number(s.garage_id) === gId);
      const photos = memoryStore.garage_images.filter(i => Number(i.garage_id) === gId);

      return [{
        ...garage,
        owner_name: owner.name || null,
        owner_email: owner.email || garage.email,
        services_count: services.length,
        photos_count: photos.length
      }];
    }

    // 4.2 SELECT GARAGE BY USER_ID
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE G.USER_ID = ?') || normalizedSql.includes('WHERE USER_ID = ?'))) {
      const uId = Number(params[0]);
      const garages = memoryStore.garages.filter(g => Number(g.user_id) === uId);
      return garages.map(g => {
        const services = memoryStore.garage_services.filter(s => Number(s.garage_id) === g.id);
        const photos = memoryStore.garage_images.filter(i => Number(i.garage_id) === g.id);
        return {
          ...g,
          services_count: services.length,
          photos_count: photos.length
        };
      });
    }

    // 4.3 SELECT COUNT(*) FROM GARAGES
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      let filtered = [...memoryStore.garages];
      if (normalizedSql.includes('COMMUNE = ?') || normalizedSql.includes('LOWER(COMMUNE)')) {
        const cParam = String(params[0] || '').toLowerCase().trim();
        filtered = filtered.filter(g => (g.commune || '').toLowerCase() === cParam);
      }
      if (normalizedSql.includes('IS_OPEN_24H = 1')) {
        filtered = filtered.filter(g => g.is_open_24h === 1);
      }
      if (normalizedSql.includes('STATUT_VALIDATION = ?')) {
        const st = String(params[params.length - 1] || 'valide');
        filtered = filtered.filter(g => (g.statut_validation || 'valide') === st);
      }
      return [{ total: filtered.length }];
    }

    // 4.4 SELECT LISTING OF GARAGES (avec filtres de recherche, commune, validation, 24h, etc.)
    if (normalizedSql.startsWith('SELECT')) {
      let list = [...memoryStore.garages];

      const whereClause = normalizedSql.includes('WHERE') ? normalizedSql.split('WHERE')[1] : '';
      const parts = whereClause.split('AND').map(p => p.trim()).filter(Boolean);

      let pIdx = 0;
      let filterStatutApplied = false;

      parts.forEach(part => {
        if (part.includes('STATUT_VALIDATION = ?')) {
          const val = params[pIdx++];
          filterStatutApplied = true;
          if (val && val !== 'all') {
            list = list.filter(g => (g.statut_validation || (g.verified ? 'valide' : 'en_attente')) === val);
          }
        } else if (part.includes('COMMUNE') && part.includes('LOWER(?)')) {
          const val = params[pIdx++];
          if (val && val !== 'all') {
            list = list.filter(g => (g.commune || '').toLowerCase() === String(val).toLowerCase().trim());
          }
        } else if (part.includes('VILLE') && part.includes('LOWER(?)')) {
          const val = params[pIdx++];
          if (val && val !== 'all') {
            list = list.filter(g => (g.ville || '').toLowerCase() === String(val).toLowerCase().trim());
          }
        } else if (part.includes('IS_OPEN_24H = 1')) {
          list = list.filter(g => g.is_open_24h === 1);
        } else if (part.includes('LIKE ?')) {
          const countLikes = (part.match(/LIKE \?/g) || []).length;
          const searchKeyword = (params[pIdx] || '').replace(/%/g, '').toLowerCase().trim();
          pIdx += countLikes;
          if (searchKeyword) {
            list = list.filter(g => {
              const inNom = g.nom && g.nom.toLowerCase().includes(searchKeyword);
              const inCommune = g.commune && g.commune.toLowerCase().includes(searchKeyword);
              const inAdresse = g.adresse && g.adresse.toLowerCase().includes(searchKeyword);
              const inVille = g.ville && g.ville.toLowerCase().includes(searchKeyword);
              const inSpec = Array.isArray(g.specialties)
                ? g.specialties.some(s => s.toLowerCase().includes(searchKeyword))
                : (typeof g.specialties === 'string' && g.specialties.toLowerCase().includes(searchKeyword));
              return inNom || inCommune || inAdresse || inVille || inSpec;
            });
          }
        }
      });

      // Si aucun filtre de statut de validation n'a été spécifié et que ce n'est pas une requête admin
      if (!filterStatutApplied && !rawSql.includes('admin_view')) {
        list = list.filter(g => g.statut_validation === 'valide' || g.verified === 1);
      }

      // Enrichir chaque garage avec son nombre de services, nombre de photos, et lien WhatsApp formaté
      return list.map(g => {
        const services = memoryStore.garage_services.filter(s => Number(s.garage_id) === g.id);
        const photos = memoryStore.garage_images.filter(i => Number(i.garage_id) === g.id);
        const cleanWa = (g.whatsapp || g.telephone || '').replace(/[^0-9]/g, '');
        const waUrl = cleanWa ? `https://wa.me/${cleanWa}?text=Bonjour%20${encodeURIComponent(g.nom)},%20je%20vous%20contacte%20via%20CONGOCAR` : null;

        return {
          ...g,
          services_count: services.length,
          photos_count: photos.length,
          whatsapp_url: waUrl
        };
      });
    }

    // 4.5 INSERT INTO GARAGES
    if (normalizedSql.startsWith('INSERT INTO GARAGES')) {
      const newId = memoryStore.garages.length > 0
        ? Math.max(...memoryStore.garages.map(g => Number(g.id))) + 1
        : 1;

      const newGarage = {
        id: newId,
        user_id: null,
        nom: 'Nouveau Garage Auto',
        slug: `garage-${newId}`,
        description: 'Atelier mécanique et entretien automobile.',
        commune: 'Gombe',
        adresse: 'Avenue de la Paix',
        ville: 'Kinshasa',
        province: 'Kinshasa',
        telephone: '+243 89 000 0000',
        telephone_urgence: '+243 89 000 0000',
        whatsapp: '+243 89 000 0000',
        email: null,
        latitude: -4.32,
        longitude: 15.31,
        horaires: 'Lun - Sam : 08h00 - 18h00',
        is_open_24h: 0,
        has_towing_truck: 0,
        has_mobile_mechanic: 0,
        specialties: ['Mécanique générale', 'Entretien courant'],
        photo_url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
        banner_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
        rating: 5.0,
        total_reviews: 0,
        verified: 0,
        statut_validation: 'en_attente',
        motif_rejet: null,
        statut_abonnement: 'essai_gratuit',
        created_at: new Date(),
        updated_at: new Date()
      };

      const colMatch = rawSql.match(/INSERT\s+INTO\s+garages\s*\(([^)]+)\)/i);
      if (colMatch && colMatch[1]) {
        const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());
        columns.forEach((col, idx) => {
          let val = params[idx];
          if (col === 'user_id') val = val ? Number(val) : null;
          if (col === 'is_open_24h' || col === 'has_towing_truck' || col === 'has_mobile_mechanic' || col === 'verified') {
            val = val ? 1 : 0;
          }
          if (col === 'specialties' && typeof val === 'string') {
            try { val = JSON.parse(val); } catch (e) { val = [val]; }
          }
          newGarage[col] = val;
        });
      } else {
        newGarage.user_id = params[0] ? Number(params[0]) : null;
        newGarage.nom = params[1] || 'Nouveau Garage';
        newGarage.commune = params[2] || 'Gombe';
        newGarage.telephone = params[3] || '+243';
        newGarage.email = params[4] || null;
      }

      // Générer slug
      newGarage.slug = (newGarage.nom || 'garage')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + `-${newId}`;

      memoryStore.garages.push(newGarage);

      // Mettre à jour le rôle de l'utilisateur s'il est associé
      if (newGarage.user_id) {
        const u = memoryStore.users.find(user => Number(user.id) === Number(newGarage.user_id));
        if (u && u.role !== 'admin') {
          u.role = 'garage';
        }
      }

      return { insertId: newId, affectedRows: 1 };
    }

    // 4.6 UPDATE GARAGES (Mise à jour profil ou Validation par Admin)
    if (normalizedSql.startsWith('UPDATE GARAGES')) {
      const gId = Number(params[params.length - 1]);
      const gIdx = memoryStore.garages.findIndex(g => Number(g.id) === gId);
      if (gIdx !== -1) {
        const target = memoryStore.garages[gIdx];

        // Détection de validation/rejet admin
        if (normalizedSql.includes('STATUT_VALIDATION = ?')) {
          const stIdx = params.findIndex(p => ['valide', 'en_attente', 'rejete'].includes(p));
          if (stIdx !== -1) {
            target.statut_validation = params[stIdx];
            target.verified = params[stIdx] === 'valide' ? 1 : 0;
          }
        }
        if (normalizedSql.includes('VERIFIED = ?')) {
          const vVal = params.find(p => p === 0 || p === 1 || p === true || p === false);
          if (vVal !== undefined) {
            target.verified = vVal ? 1 : 0;
          }
        }
        if (normalizedSql.includes('MOTIF_REJET = ?')) {
          target.motif_rejet = params[params.length - 2] || null;
        }

        // Mettre à jour les champs dynamiques de profil transmis
        const dynamicFields = [
          'nom', 'description', 'commune', 'adresse', 'ville', 'province',
          'telephone', 'telephone_urgence', 'whatsapp', 'email', 'latitude', 'longitude',
          'horaires', 'is_open_24h', 'has_towing_truck', 'has_mobile_mechanic',
          'photo_url', 'banner_url'
        ];

        dynamicFields.forEach(f => {
          if (normalizedSql.includes(`${f.toUpperCase()} = ?`)) {
            // Rechercher la position dans la requête
            const matchIndex = normalizedSql.split(',').findIndex(chunk => chunk.includes(`${f.toUpperCase()} = ?`));
            if (matchIndex !== -1 && params[matchIndex] !== undefined) {
              target[f] = params[matchIndex];
            }
          }
        });

        target.updated_at = new Date();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 4.7 DELETE FROM GARAGES
    if (normalizedSql.startsWith('DELETE FROM GARAGES')) {
      const gId = Number(params[0]);
      const initialLen = memoryStore.garages.length;
      memoryStore.garages = memoryStore.garages.filter(g => Number(g.id) !== gId);
      return { affectedRows: initialLen - memoryStore.garages.length };
    }
  }

  return null;
};

module.exports = {
  INITIAL_GARAGES,
  INITIAL_GARAGE_SERVICES,
  INITIAL_GARAGE_IMAGES,
  INITIAL_BREAKDOWNS,
  handleGarageQuery
};
