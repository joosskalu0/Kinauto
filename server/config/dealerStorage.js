/**
 * Moteur de requêtes en mémoire pour les Concessionnaires (Dealerships / Dealers) et Demandes Clients (Leads / Inquiries)
 * Permet l'exécution fluide de l'ensemble des opérations REST lorsque MySQL n'est pas actif.
 */

const INITIAL_LEADS = [
  {
    id: 1,
    dealership_id: 1,
    vehicle_id: 1,
    user_id: 4,
    vehicle_title: 'Toyota Land Cruiser Prado TX-L 2024',
    vehicle_price: 95000,
    nom_client: 'Patrick Mwamba',
    email: 'client@congocar.cd',
    telephone: '+243 81 222 3344',
    type_demande: 'essai',
    date_souhaitee: '2026-09-15',
    horaire_souhaite: '14h30',
    message: 'Bonjour, je souhaiterais réserver un essai routier pour ce Prado TX-L ce samedi après-midi.',
    offre_prix_proposee: null,
    vehicule_reprise_info: null,
    notes_internes: 'Client sérieux, intéressé par un achat au comptant.',
    statut: 'nouveau',
    created_at: new Date(Date.now() - 3600000 * 5),
    updated_at: new Date(Date.now() - 3600000 * 5)
  },
  {
    id: 2,
    dealership_id: 1,
    vehicle_id: 4,
    user_id: null,
    vehicle_title: 'Land Rover Range Rover Sport D350 Dynamic HSE 2023',
    vehicle_price: 135000,
    nom_client: 'Gisèle Kabongo',
    email: 'gisele.kabongo@entreprise.cd',
    telephone: '+243 99 888 7766',
    type_demande: 'devis',
    date_souhaitee: null,
    horaire_souhaite: null,
    message: 'Demande de devis officiel proforma pour l\'acquisition par notre direction générale avec modalités de paiement échelonné.',
    offre_prix_proposee: 128000,
    vehicule_reprise_info: null,
    notes_internes: 'Dossier transmis au service commercial pour établissement de la proforma.',
    statut: 'en_cours',
    created_at: new Date(Date.now() - 3600000 * 24),
    updated_at: new Date(Date.now() - 3600000 * 12)
  },
  {
    id: 3,
    dealership_id: 1,
    vehicle_id: 5,
    user_id: null,
    vehicle_title: 'Toyota RAV4 Hybrid Limited AWD 2023',
    vehicle_price: 46000,
    nom_client: 'David Lukusa',
    email: 'david.lukusa@gmail.com',
    telephone: '+243 82 444 5566',
    type_demande: 'achat',
    date_souhaitee: '2026-09-12',
    horaire_souhaite: '10h00',
    message: 'Le véhicule est-il immédiatement disponible en showroom avec la carte rose en règle ? Je peux venir avec un acompte.',
    offre_prix_proposee: 45000,
    vehicule_reprise_info: null,
    notes_internes: 'Acompte reçu, livraison planifiée.',
    statut: 'traite',
    created_at: new Date(Date.now() - 3600000 * 48),
    updated_at: new Date(Date.now() - 3600000 * 20)
  },
  {
    id: 4,
    dealership_id: 2,
    vehicle_id: 3,
    user_id: null,
    vehicle_title: 'Nissan Patrol Nismo 5.6L V8 2023',
    vehicle_price: 110000,
    nom_client: 'Alain Tshisekedi',
    email: 'alain.t@mining-group.cd',
    telephone: '+243 97 111 2233',
    type_demande: 'information',
    date_souhaitee: null,
    horaire_souhaite: null,
    message: 'Bonjour, faites-vous la livraison sécurisée vers Kolwezi ?',
    offre_prix_proposee: null,
    vehicule_reprise_info: null,
    notes_internes: null,
    statut: 'nouveau',
    created_at: new Date(Date.now() - 3600000 * 8),
    updated_at: new Date(Date.now() - 3600000 * 8)
  }
];

/**
 * Traite les requêtes SQL liées aux concessionnaires (dealerships, dealers) et aux demandes clients (leads)
 */
function handleDealerQuery(normalizedSql, rawSql, params, memoryStore) {
  if (!memoryStore.leads) {
    memoryStore.leads = [...INITIAL_LEADS];
  }
  if (!memoryStore.dealerships) {
    memoryStore.dealerships = [];
  }

  // =========================================================================
  // 1. REQUÊTES SUR LES CONCESSIONNAIRES (DEALERSHIPS / DEALERS)
  // =========================================================================
  const isDealerTable = normalizedSql.includes('DEALERSHIPS') || normalizedSql.includes('DEALERS');

  if (isDealerTable) {
    // 1.1 SELECT SINGLE DEALERSHIP BY ID: WHERE D.ID = ? OR WHERE ID = ?
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE D.ID = ?') || normalizedSql.includes('WHERE ID = ?'))) {
      const targetId = Number(params[0]);
      const found = memoryStore.dealerships.find(d => Number(d.id) === targetId);
      if (!found) return [];

      const owner = memoryStore.users.find(u => Number(u.id) === Number(found.user_id)) || {};
      return [{
        ...found,
        owner_name: owner.name || 'Concessionnaire Partenaire',
        owner_email: owner.email || found.email || 'dealer@congocar.cd'
      }];
    }

    // 1.2 SELECT DEALERSHIP BY USER_ID: WHERE D.USER_ID = ? OR WHERE USER_ID = ?
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE D.USER_ID = ?') || normalizedSql.includes('WHERE USER_ID = ?'))) {
      const targetUserId = Number(params[0]);
      const foundList = memoryStore.dealerships.filter(d => Number(d.user_id) === targetUserId);
      if (foundList.length === 0) return [];

      return foundList.map(d => {
        const owner = memoryStore.users.find(u => Number(u.id) === Number(d.user_id)) || {};
        return {
          ...d,
          owner_name: owner.name || 'Concessionnaire',
          owner_email: owner.email || d.email
        };
      });
    }

    // 1.3 SELECT COUNT(*) AS TOTAL FROM DEALERSHIPS
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      let filtered = [...memoryStore.dealerships];

      if (params.length > 0) {
        if (normalizedSql.includes('D.VILLE = ?')) {
          const v = String(params[0] || '').toLowerCase().trim();
          filtered = filtered.filter(d => (d.ville || '').toLowerCase() === v);
        } else if (normalizedSql.includes('LIKE ?')) {
          const term = String(params[0] || '').replace(/%/g, '').toLowerCase().trim();
          filtered = filtered.filter(d => 
            (d.nom && d.nom.toLowerCase().includes(term)) ||
            (d.slogan && d.slogan.toLowerCase().includes(term)) ||
            (d.adresse && d.adresse.toLowerCase().includes(term)) ||
            (d.ville && d.ville.toLowerCase().includes(term))
          );
        }
      }

      return [{ total: filtered.length }];
    }

    // 1.4 SELECT LISTING OF DEALERSHIPS (avec compteurs de véhicules et filtres)
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('FROM DEALERSHIPS') || normalizedSql.includes('FROM DEALERS'))) {
      let list = [...memoryStore.dealerships];

      // Filtre de recherche textuelle
      if (normalizedSql.includes('D.NOM LIKE ?') || normalizedSql.includes('LIKE ?')) {
        const rawSearch = String(params[0] || '').replace(/%/g, '').toLowerCase().trim();
        if (rawSearch) {
          list = list.filter(d =>
            (d.nom && d.nom.toLowerCase().includes(rawSearch)) ||
            (d.slogan && d.slogan.toLowerCase().includes(rawSearch)) ||
            (d.adresse && d.adresse.toLowerCase().includes(rawSearch)) ||
            (d.ville && d.ville.toLowerCase().includes(rawSearch))
          );
        }
      }

      // Filtre par ville
      if (normalizedSql.includes('D.VILLE = ?')) {
        const cityParam = String(params[params.length - 3] || params[0] || '').toLowerCase().trim();
        if (cityParam && !cityParam.includes('%')) {
          list = list.filter(d => (d.ville || '').toLowerCase() === cityParam);
        }
      }

      // Calculer les métriques en direct pour chaque concessionnaire
      const enriched = list.map(d => {
        const dealerVehicles = (memoryStore.vehicles || []).filter(v => Number(v.dealership_id) === Number(d.id));
        const availableVehicles = dealerVehicles.filter(v => String(v.status || '').toLowerCase() === 'approved');
        const soldVehicles = dealerVehicles.filter(v => String(v.status || '').toLowerCase() === 'sold');
        const owner = (memoryStore.users || []).find(u => Number(u.id) === Number(d.user_id)) || {};

        return {
          ...d,
          total_vehicles: dealerVehicles.length,
          available_vehicles: availableVehicles.length,
          sold_vehicles: soldVehicles.length,
          owner_name: owner.name || null,
          owner_email: owner.email || d.email || null
        };
      });

      // Pagination
      if (normalizedSql.includes('LIMIT ? OFFSET ?')) {
        const limit = Number(params[params.length - 2]);
        const offset = Number(params[params.length - 1]);
        return enriched.slice(offset, offset + limit);
      }

      return enriched;
    }

    // 1.5 INSERT INTO DEALERSHIPS
    if (normalizedSql.startsWith('INSERT INTO DEALERSHIPS') || normalizedSql.startsWith('INSERT INTO DEALERS')) {
      const newId = memoryStore.dealerships.length > 0
        ? Math.max(...memoryStore.dealerships.map(d => Number(d.id))) + 1
        : 1;

      const newDealership = {
        id: newId,
        user_id: 1,
        nom: 'Concession Automobile',
        slogan: 'L\'Excellence Automobile',
        description: 'Vente et reprise de véhicules certifiés en RDC.',
        adresse: 'Boulevard du 30 Juin',
        commune: 'Gombe',
        ville: 'Kinshasa',
        province: 'Kinshasa',
        code_postal: null,
        telephone: '+243 89 000 0000',
        email: null,
        horaires: 'Lun - Sam : 08h00 - 18h00',
        site_web: null,
        logo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        banner_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        siret: null,
        plan_id: 'starter',
        statut_abonnement: 'essai_gratuit',
        rating: 5.0,
        reviews_count: 0,
        verified: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      const colMatch = rawSql.match(/INSERT\s+INTO\s+dealerships\s*\(([^)]+)\)/i) || rawSql.match(/INSERT\s+INTO\s+dealers\s*\(([^)]+)\)/i);
      if (colMatch && colMatch[1]) {
        const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());
        columns.forEach((col, idx) => {
          let val = params[idx];
          if (col === 'user_id') val = Number(val);
          newDealership[col] = val;
        });
      } else {
        newDealership.user_id = Number(params[0]);
        newDealership.nom = String(params[1] || 'Concession Automobile');
        newDealership.telephone = String(params[2] || '+243 89 000 0000');
        newDealership.email = params[3] || null;
      }

      memoryStore.dealerships.push(newDealership);

      // Si l'utilisateur avait le rôle 'user' ou 'seller', le passer en 'dealer'
      const user = (memoryStore.users || []).find(u => Number(u.id) === userId);
      if (user && user.role !== 'admin') {
        user.role = 'dealer';
      }

      return { insertId: newId, affectedRows: 1 };
    }

    // 1.6 UPDATE DEALERSHIPS SET ... WHERE ID = ?
    if (normalizedSql.startsWith('UPDATE DEALERSHIPS') || normalizedSql.startsWith('UPDATE DEALERS')) {
      const idToUpdate = Number(params[params.length - 1]);
      const dealerIdx = memoryStore.dealerships.findIndex(d => Number(d.id) === idToUpdate);

      if (dealerIdx !== -1) {
        // Appliquer les champs fournis dans params
        // Les champs de SET sont dans le corps SQL
        const setMatch = rawSql.match(/SET\s+([\s\S]*?)\s+WHERE/i);
        if (setMatch && setMatch[1]) {
          const fieldAssignments = setMatch[1].split(',').map(s => s.trim());
          let pIdx = 0;
          for (const fa of fieldAssignments) {
            if (fa.includes('=')) {
              const fieldName = fa.split('=')[0].trim();
              if (fa.includes('NOW()')) {
                memoryStore.dealerships[dealerIdx]['updated_at'] = new Date();
              } else if (pIdx < params.length - 1) {
                memoryStore.dealerships[dealerIdx][fieldName] = params[pIdx];
                pIdx++;
              }
            }
          }
        }
        memoryStore.dealerships[dealerIdx].updated_at = new Date();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 1.7 DELETE FROM DEALERSHIPS WHERE ID = ?
    if (normalizedSql.startsWith('DELETE FROM DEALERSHIPS') || normalizedSql.startsWith('DELETE FROM DEALERS')) {
      const idToDelete = Number(params[0]);
      const initialCount = memoryStore.dealerships.length;
      memoryStore.dealerships = memoryStore.dealerships.filter(d => Number(d.id) !== idToDelete);
      // Supprimer aussi ses véhicules associés
      if (memoryStore.vehicles) {
        memoryStore.vehicles = memoryStore.vehicles.filter(v => Number(v.dealership_id) !== idToDelete);
      }
      return { affectedRows: initialCount - memoryStore.dealerships.length };
    }
  }

  // =========================================================================
  // 2. REQUÊTES SUR LES DEMANDES CLIENTS / LEADS / INQUIRIES
  // =========================================================================
  const isLeadsTable = normalizedSql.includes('FROM LEADS') || normalizedSql.includes('INTO LEADS') || normalizedSql.includes('UPDATE LEADS') || normalizedSql.includes('DELETE FROM LEADS');

  if (isLeadsTable) {
    // 2.1 SELECT LEADS WITH FILTERS (Dealership_id, statut, etc.)
    if (normalizedSql.startsWith('SELECT')) {
      // Cas SELECT SINGLE LEAD: WHERE ID = ?
      if (normalizedSql.includes('WHERE ID = ?') || normalizedSql.includes('WHERE L.ID = ?')) {
        const leadId = Number(params[0]);
        const found = memoryStore.leads.find(l => Number(l.id) === leadId);
        return found ? [found] : [];
      }

      // Cas SELECT COUNT(*) FROM LEADS
      if (normalizedSql.startsWith('SELECT COUNT(*)')) {
        let countList = [...memoryStore.leads];
        if (normalizedSql.includes('DEALERSHIP_ID = ?') || normalizedSql.includes('L.DEALERSHIP_ID = ?')) {
          const dId = Number(params[0]);
          countList = countList.filter(l => Number(l.dealership_id) === dId);
        }
        return [{ total: countList.length }];
      }

      // Cas SELECT ALL / LISTING
      let list = [...memoryStore.leads];

      if (normalizedSql.includes('DEALERSHIP_ID = ?') || normalizedSql.includes('L.DEALERSHIP_ID = ?')) {
        const dId = Number(params[0]);
        list = list.filter(l => Number(l.dealership_id) === dId);
      }

      if (normalizedSql.includes('STATUT = ?') || normalizedSql.includes('L.STATUT = ?')) {
        const targetStatut = String(params[1] || params[0] || '').toLowerCase().trim();
        if (targetStatut && targetStatut !== 'all') {
          list = list.filter(l => String(l.statut || '').toLowerCase() === targetStatut);
        }
      }

      // Tri décroissant par date de création
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Pagination
      if (normalizedSql.includes('LIMIT ? OFFSET ?')) {
        const limit = Number(params[params.length - 2]);
        const offset = Number(params[params.length - 1]);
        return list.slice(offset, offset + limit);
      }

      return list;
    }

    // 2.2 INSERT INTO LEADS
    if (normalizedSql.startsWith('INSERT INTO LEADS')) {
      const newId = memoryStore.leads.length > 0
        ? Math.max(...memoryStore.leads.map(l => Number(l.id))) + 1
        : 1;

      const newLead = {
        id: newId,
        dealership_id: Number(params[0]),
        vehicle_id: params[1] ? Number(params[1]) : null,
        user_id: params[2] ? Number(params[2]) : null,
        vehicle_title: params[3] || 'Véhicule en concession',
        vehicle_price: params[4] ? Number(params[4]) : 0,
        nom_client: String(params[5] || 'Client'),
        email: String(params[6] || ''),
        telephone: String(params[7] || ''),
        type_demande: params[8] || 'information',
        date_souhaitee: params[9] || null,
        horaire_souhaite: params[10] || null,
        message: params[11] || null,
        offre_prix_proposee: params[12] ? Number(params[12]) : null,
        vehicule_reprise_info: params[13] || null,
        notes_internes: null,
        statut: 'nouveau',
        created_at: new Date(),
        updated_at: new Date()
      };

      memoryStore.leads.push(newLead);
      return { insertId: newId, affectedRows: 1 };
    }

    // 2.3 UPDATE LEADS (Statut ou notes)
    if (normalizedSql.startsWith('UPDATE LEADS')) {
      const lastParam = Number(params[params.length - 1]);
      const leadIdx = memoryStore.leads.findIndex(l => Number(l.id) === lastParam);

      if (leadIdx !== -1) {
        if (params.length === 2) {
          // UPDATE leads SET statut = ?, updated_at = NOW() WHERE id = ?
          memoryStore.leads[leadIdx].statut = params[0];
          memoryStore.leads[leadIdx].updated_at = new Date();
        } else if (params.length === 3) {
          // UPDATE leads SET statut = ?, notes_internes = ?, updated_at = NOW() WHERE id = ?
          memoryStore.leads[leadIdx].statut = params[0];
          memoryStore.leads[leadIdx].notes_internes = params[1];
          memoryStore.leads[leadIdx].updated_at = new Date();
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 2.4 DELETE FROM LEADS
    if (normalizedSql.startsWith('DELETE FROM LEADS')) {
      const leadId = Number(params[0]);
      const initial = memoryStore.leads.length;
      memoryStore.leads = memoryStore.leads.filter(l => Number(l.id) !== leadId);
      return { affectedRows: initial - memoryStore.leads.length };
    }
  }

  // Requête non traitée par ce gestionnaire
  return null;
}

module.exports = {
  handleDealerQuery,
  INITIAL_LEADS
};
