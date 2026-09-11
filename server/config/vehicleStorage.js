/**
 * Moteur de stockage résilient en mémoire pour les Véhicules, Images et Favoris
 * Exécute et interprète les requêtes SQL en mémoire lorsque MySQL n'est pas actif.
 */

/**
 * Filtre une liste de véhicules en mémoire selon les critères SQL extraits
 */
const filterVehiclesInMemory = (vehicles, normalizedSql, rawSql, params) => {
  let list = [...vehicles];
  let paramIdx = 0;

  // Extraction propre de la clause WHERE principale (en ignorant les sous-requêtes dans SELECT)
  const lastWhereIdx = rawSql.toUpperCase().lastIndexOf(' WHERE ');
  if (lastWhereIdx !== -1) {
    let whereSection = rawSql.slice(lastWhereIdx + 7);
    const orderByIdx = whereSection.toUpperCase().indexOf(' ORDER BY ');
    if (orderByIdx !== -1) {
      whereSection = whereSection.slice(0, orderByIdx);
    } else {
      const limitIdx = whereSection.toUpperCase().indexOf(' LIMIT ');
      if (limitIdx !== -1) {
        whereSection = whereSection.slice(0, limitIdx);
      }
    }
    const clauses = whereSection.split(/\s+AND\s+/i).map(c => c.trim()).filter(Boolean);

    for (const clause of clauses) {
      const cUpper = clause.toUpperCase();

      if (cUpper === '1=1') continue;

      // 1. Recherche textuelle multi-colonnes
      if (cUpper.startsWith('(V.MARQUE LIKE ?') || cUpper.includes('OR V.MODELE LIKE ?')) {
        const rawSearch = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase().trim();
        paramIdx += 7; // Consomme les 7 paramètres de recherche
        if (rawSearch) {
          list = list.filter(v => 
            (v.marque && v.marque.toLowerCase().includes(rawSearch)) ||
            (v.modele && v.modele.toLowerCase().includes(rawSearch)) ||
            (v.finition && v.finition.toLowerCase().includes(rawSearch)) ||
            (v.description && v.description.toLowerCase().includes(rawSearch)) ||
            (v.ville && v.ville.toLowerCase().includes(rawSearch)) ||
            (v.categorie && v.categorie.toLowerCase().includes(rawSearch)) ||
            (v.vin && v.vin.toLowerCase().includes(rawSearch))
          );
        }
      } else if (cUpper.includes('V.STATUS = ?')) {
        const targetStatus = String(params[paramIdx] || 'approved').toLowerCase();
        paramIdx += 1;
        list = list.filter(v => String(v.status || '').toLowerCase() === targetStatus);
      } else if (cUpper.includes('V.DEALERSHIP_ID = ?')) {
        const dealerId = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.dealership_id) === dealerId);
      } else if (cUpper.includes('V.MARQUE LIKE ?')) {
        const marqueTerm = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase().trim();
        paramIdx += 1;
        list = list.filter(v => v.marque && v.marque.toLowerCase().includes(marqueTerm));
      } else if (cUpper.includes('V.MODELE LIKE ?')) {
        const modelTerm = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase().trim();
        paramIdx += 1;
        list = list.filter(v => v.modele && v.modele.toLowerCase().includes(modelTerm));
      } else if (cUpper.includes('V.CATEGORIE = ?')) {
        const cat = String(params[paramIdx] || '').toLowerCase();
        paramIdx += 1;
        list = list.filter(v => v.categorie && v.categorie.toLowerCase() === cat);
      } else if (cUpper.includes('V.CARBURANT = ?')) {
        const fuel = String(params[paramIdx] || '').toLowerCase();
        paramIdx += 1;
        list = list.filter(v => v.carburant && v.carburant.toLowerCase() === fuel);
      } else if (cUpper.includes('V.TRANSMISSION = ?')) {
        const trans = String(params[paramIdx] || '').toLowerCase();
        paramIdx += 1;
        list = list.filter(v => v.transmission && v.transmission.toLowerCase() === trans);
      } else if (cUpper.includes('V.ETAT = ?')) {
        const st = String(params[paramIdx] || '').toLowerCase();
        paramIdx += 1;
        list = list.filter(v => v.etat && v.etat.toLowerCase() === st);
      } else if (cUpper.includes('V.PRIX >= ?')) {
        const minP = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.prix) >= minP);
      } else if (cUpper.includes('V.PRIX <= ?')) {
        const maxP = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.prix) <= maxP);
      } else if (cUpper.includes('V.ANNEE >= ?')) {
        const minY = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.annee) >= minY);
      } else if (cUpper.includes('V.ANNEE <= ?')) {
        const maxY = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.annee) <= maxY);
      } else if (cUpper.includes('V.KILOMETRAGE >= ?')) {
        const minKm = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.kilometrage) >= minKm);
      } else if (cUpper.includes('V.KILOMETRAGE <= ?')) {
        const maxKm = Number(params[paramIdx]);
        paramIdx += 1;
        list = list.filter(v => Number(v.kilometrage) <= maxKm);
      } else if (cUpper.includes('V.VILLE LIKE ?') || cUpper.includes('D.VILLE LIKE ?')) {
        const cityTerm = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase().trim();
        paramIdx += 2;
        list = list.filter(v => v.ville && v.ville.toLowerCase().includes(cityTerm));
      } else if (cUpper.includes('V.EN_PROMO = 1')) {
        list = list.filter(v => v.en_promo === 1 || v.en_promo === true);
      } else if (cUpper.includes('V.EN_VEDETTE = 1')) {
        list = list.filter(v => v.en_vedette === 1 || v.en_vedette === true);
      }
    }
  }

  // 15. TRI
  if (normalizedSql.includes('ORDER BY V.PRIX ASC')) {
    list.sort((a, b) => Number(a.prix) - Number(b.prix));
  } else if (normalizedSql.includes('ORDER BY V.PRIX DESC')) {
    list.sort((a, b) => Number(b.prix) - Number(a.prix));
  } else if (normalizedSql.includes('ORDER BY V.ANNEE DESC')) {
    list.sort((a, b) => Number(b.annee) - Number(a.annee));
  } else if (normalizedSql.includes('ORDER BY V.ANNEE ASC')) {
    list.sort((a, b) => Number(a.annee) - Number(b.annee));
  } else if (normalizedSql.includes('ORDER BY V.KILOMETRAGE ASC')) {
    list.sort((a, b) => Number(a.kilometrage) - Number(b.kilometrage));
  } else if (normalizedSql.includes('ORDER BY V.KILOMETRAGE DESC')) {
    list.sort((a, b) => Number(b.kilometrage) - Number(a.kilometrage));
  } else if (normalizedSql.includes('ORDER BY V.VIEWS_COUNT DESC')) {
    list.sort((a, b) => Number(b.views_count || 0) - Number(a.views_count || 0));
  } else if (normalizedSql.includes('ORDER BY V.MARQUE ASC')) {
    list.sort((a, b) => `${a.marque} ${a.modele}`.localeCompare(`${b.marque} ${b.modele}`));
  } else {
    // Par défaut : créés plus récemment
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  return list;
};

/**
 * Traite les requêtes SQL liées aux véhicules, images et favoris
 */
const handleVehiclesQuery = (normalizedSql, rawSql, params, memoryStore) => {
  // =========================================================================
  // 1. VEHICLE_IMAGES
  // =========================================================================
  if (normalizedSql.includes('VEHICLE_IMAGES')) {
    // SELECT images for vehicle
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE VEHICLE_ID = ?')) {
      const vId = Number(params[0]);
      return memoryStore.vehicle_images
        .filter(img => img.vehicle_id === vId)
        .sort((a, b) => (b.is_primary || 0) - (a.is_primary || 0) || (a.display_order || 0) - (b.display_order || 0));
    }

    // INSERT INTO vehicle_images
    if (normalizedSql.startsWith('INSERT INTO VEHICLE_IMAGES')) {
      const newImg = {
        id: memoryStore.vehicle_images.length > 0 ? Math.max(...memoryStore.vehicle_images.map(i => i.id)) + 1 : 1,
        vehicle_id: Number(params[0]),
        image_url: params[1],
        is_primary: Number(params[2] || 0),
        display_order: Number(params[3] || 0)
      };
      memoryStore.vehicle_images.push(newImg);
      return { insertId: newImg.id, affectedRows: 1 };
    }

    // DELETE FROM vehicle_images WHERE vehicle_id = ?
    if (normalizedSql.startsWith('DELETE FROM VEHICLE_IMAGES')) {
      const vId = Number(params[0]);
      const initialLen = memoryStore.vehicle_images.length;
      memoryStore.vehicle_images = memoryStore.vehicle_images.filter(img => img.vehicle_id !== vId);
      return { affectedRows: initialLen - memoryStore.vehicle_images.length };
    }
  }

  // =========================================================================
  // 2. VEHICLE_FAVORITES (FAVORIS)
  // =========================================================================
  if (normalizedSql.includes('VEHICLE_FAVORITES') || normalizedSql.includes('FAVORITES')) {
    // SELECT favorites of user
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE F.USER_ID = ?') || normalizedSql.includes('WHERE USER_ID = ?'))) {
      const userId = Number(params[0]);
      const userFavs = memoryStore.vehicle_favorites.filter(f => f.user_id === userId);

      // Simple list of vehicle_id (pour injection rapide dans le catalogue)
      if (normalizedSql.includes('SELECT VEHICLE_ID FROM VEHICLE_FAVORITES')) {
        return userFavs.map(f => ({ vehicle_id: f.vehicle_id }));
      }
      
      const results = userFavs.map(fav => {
        const veh = memoryStore.vehicles.find(v => v.id === fav.vehicle_id);
        if (!veh) return null;
        
        const deal = memoryStore.dealerships.find(d => d.id === veh.dealership_id) || {};
        const primaryImg = memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id && img.is_primary) 
          || memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id);

        return {
          favorite_id: fav.id,
          favorited_at: fav.created_at,
          ...veh,
          dealership_nom: deal.nom || 'Auto Prestige Kinshasa',
          dealership_ville: deal.ville || veh.ville || 'Kinshasa',
          primary_image: primaryImg ? primaryImg.image_url : null,
          is_favorite: true
        };
      }).filter(Boolean);

      return results;
    }

    // CHECK if favorite
    if (normalizedSql.startsWith('SELECT') && normalizedSql.includes('WHERE USER_ID = ? AND VEHICLE_ID = ?')) {
      const userId = Number(params[0]);
      const vehicleId = Number(params[1]);
      return memoryStore.vehicle_favorites.filter(f => f.user_id === userId && f.vehicle_id === vehicleId);
    }

    // INSERT INTO vehicle_favorites
    if (normalizedSql.startsWith('INSERT')) {
      const userId = Number(params[0]);
      const vehicleId = Number(params[1]);
      const exists = memoryStore.vehicle_favorites.some(f => f.user_id === userId && f.vehicle_id === vehicleId);
      
      if (!exists) {
        const newFav = {
          id: memoryStore.vehicle_favorites.length > 0 ? Math.max(...memoryStore.vehicle_favorites.map(f => f.id)) + 1 : 1,
          user_id: userId,
          vehicle_id: vehicleId,
          created_at: new Date()
        };
        memoryStore.vehicle_favorites.push(newFav);

        // Update favorites count on vehicle
        const v = memoryStore.vehicles.find(item => item.id === vehicleId);
        if (v) v.favorites_count = (v.favorites_count || 0) + 1;

        return { insertId: newFav.id, affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // DELETE FROM vehicle_favorites
    if (normalizedSql.startsWith('DELETE FROM VEHICLE_FAVORITES') || normalizedSql.startsWith('DELETE FROM FAVORITES')) {
      const userId = Number(params[0]);
      const vehicleId = Number(params[1]);
      const beforeLen = memoryStore.vehicle_favorites.length;
      memoryStore.vehicle_favorites = memoryStore.vehicle_favorites.filter(
        f => !(f.user_id === userId && f.vehicle_id === vehicleId)
      );

      if (beforeLen > memoryStore.vehicle_favorites.length) {
        const v = memoryStore.vehicles.find(item => item.id === vehicleId);
        if (v && v.favorites_count > 0) v.favorites_count -= 1;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // =========================================================================
  // 3. VEHICLES (CATALOGUE, DÉTAIL, SIMILAIRES, CRÉATION, MISE À JOUR, SUPPRESSION)
  // =========================================================================
  if (normalizedSql.includes('VEHICLES')) {
    // 3.1 UPDATE views_count
    if (normalizedSql.includes('UPDATE VEHICLES SET VIEWS_COUNT = VIEWS_COUNT + 1')) {
      const vId = Number(params[0]);
      const v = memoryStore.vehicles.find(item => item.id === vId);
      if (v) {
        v.views_count = (v.views_count || 0) + 1;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 3.2 VÉHICULES SIMILAIRES : WHERE V.ID != ? AND V.STATUS = 'APPROVED'
    if (normalizedSql.includes('WHERE V.ID != ?') && normalizedSql.includes("V.STATUS = 'APPROVED'")) {
      const currentId = Number(params[0]);
      const targetCat = String(params[1] || '').toLowerCase();
      const targetMarque = String(params[2] || '').toLowerCase();
      const minP = Number(params[3] || 0);
      const maxP = Number(params[4] || 9999999);
      const limit = Number(params[params.length - 1] || 4);

      const approvedOthers = memoryStore.vehicles.filter(
        v => v.id !== currentId && String(v.status || '').toLowerCase() === 'approved'
      );

      // Calculer un score de similarité
      const scored = approvedOthers.map(veh => {
        let score = 0;
        const vCat = String(veh.categorie || '').toLowerCase();
        const vMarque = String(veh.marque || '').toLowerCase();
        const vPrix = Number(veh.prix || 0);

        if (vCat === targetCat && vMarque === targetMarque) score += 30;
        else if (vCat === targetCat) score += 20;
        else if (vMarque === targetMarque) score += 10;

        if (vPrix >= minP && vPrix <= maxP) score += 5;

        const deal = memoryStore.dealerships.find(d => d.id === veh.dealership_id) || {};
        const primaryImg = memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id && img.is_primary)
          || memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id);

        return {
          vehicle: {
            ...veh,
            dealership_nom: deal.nom || 'Auto Prestige Kinshasa',
            dealership_ville: deal.ville || veh.ville || 'Kinshasa',
            primary_image: primaryImg ? primaryImg.image_url : null
          },
          score
        };
      });

      // Garder les scores > 0 et trier
      const matching = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.vehicle);

      return matching;
    }

    // 3.3 SELECT SINGLE VEHICLE BY ID (or with dealership join)
    if (normalizedSql.startsWith('SELECT') && (normalizedSql.includes('WHERE V.ID = ?') || normalizedSql.includes('WHERE ID = ?'))) {
      const vId = Number(params[0]);
      const veh = memoryStore.vehicles.find(item => item.id === vId);
      if (!veh) return [];

      const deal = memoryStore.dealerships.find(d => d.id === veh.dealership_id) || {
        nom: 'Auto Prestige Kinshasa',
        slogan: 'L\'Excellence Automobile en RDC',
        adresse: 'Boulevard du 30 Juin, Gombe',
        ville: 'Kinshasa',
        telephone: '+243 89 555 0101',
        email: 'contact@autoprestige-paris.fr',
        horaires: 'Lun - Sam : 08h00 - 18h00',
        site_web: 'https://autoprestige.cd',
        logo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        user_id: veh.user_id || 2
      };

      const primaryImg = memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id && img.is_primary)
        || memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id);

      return [{
        ...veh,
        dealership_nom: deal.nom,
        dealership_slogan: deal.slogan,
        dealership_adresse: deal.adresse,
        dealership_ville: deal.ville,
        dealership_telephone: deal.telephone,
        dealership_email: deal.email,
        dealership_horaires: deal.horaires,
        dealership_site_web: deal.site_web,
        dealership_logo: deal.logo_url,
        dealership_owner: deal.user_id,
        primary_image: primaryImg ? primaryImg.image_url : null
      }];
    }

    // 3.4 SELECT COUNT(*) AS TOTAL
    if (normalizedSql.startsWith('SELECT COUNT(*)')) {
      const filtered = filterVehiclesInMemory(memoryStore.vehicles, normalizedSql, rawSql, params);
      return [{ total: filtered.length }];
    }

    // 3.5 SELECT LISTING OF VEHICLES (avec pagination et filtres)
    if (normalizedSql.startsWith('SELECT')) {
      const filtered = filterVehiclesInMemory(memoryStore.vehicles, normalizedSql, rawSql, params);

      // Pagination : LIMIT ? OFFSET ? sont les 2 derniers paramètres
      let paginated = filtered;
      if (normalizedSql.includes('LIMIT ? OFFSET ?')) {
        const limit = Number(params[params.length - 2]);
        const offset = Number(params[params.length - 1]);
        paginated = filtered.slice(offset, offset + limit);
      }

      const enriched = paginated.map(veh => {
        const deal = memoryStore.dealerships.find(d => d.id === veh.dealership_id) || {};
        const primaryImg = memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id && img.is_primary)
          || memoryStore.vehicle_images.find(img => img.vehicle_id === veh.id);

        return {
          ...veh,
          dealership_nom: deal.nom || 'Auto Prestige Kinshasa',
          dealership_ville: deal.ville || veh.ville || 'Kinshasa',
          dealership_telephone: deal.telephone || '+243 89 555 0101',
          dealership_logo: deal.logo_url || null,
          primary_image: primaryImg ? primaryImg.image_url : null
        };
      });

      return enriched;
    }

    // 3.6 INSERT INTO VEHICLES
    if (normalizedSql.startsWith('INSERT INTO VEHICLES')) {
      const newId = memoryStore.vehicles.length > 0 ? Math.max(...memoryStore.vehicles.map(v => v.id)) + 1 : 1;
      
      const newVehicle = {
        id: newId,
        dealership_id: 1,
        user_id: 1,
        marque: 'Toyota',
        modele: 'Land Cruiser',
        finition: '',
        annee: new Date().getFullYear(),
        prix: 50000,
        msrp: null,
        remise_instantanee: 0,
        ancien_prix: null,
        en_promo: 0,
        kilometrage: 0,
        carburant: 'Essence',
        transmission: 'Automatique',
        categorie: 'SUV',
        etat: 'Occasion',
        status: 'approved',
        puissance_ch: 0,
        puissance_fiscale: 0,
        couleur: 'Noir',
        couleur_interieure: null,
        moteur: null,
        motrice: '4x4',
        portes: 5,
        places: 5,
        co2_gkm: 0,
        garantie_mois: 12,
        vin: null,
        description: '',
        equipements: [],
        en_vedette: 0,
        views_count: 0,
        vues_count: 0,
        favorites_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      const colMatch = rawSql.match(/INSERT\s+INTO\s+vehicles\s*\(([^)]+)\)/i);
      if (colMatch && colMatch[1]) {
        const columns = colMatch[1].split(',').map(c => c.trim().toLowerCase());
        columns.forEach((col, idx) => {
          let val = params[idx];
          if (['dealership_id', 'user_id', 'annee', 'kilometrage', 'portes', 'places', 'puissance_ch', 'puissance_fiscale'].includes(col)) {
            val = val !== null && val !== undefined ? Number(val) : null;
          } else if (['prix', 'prix_promo', 'msrp', 'ancien_prix'].includes(col)) {
            val = val !== null && val !== undefined ? parseFloat(val) : null;
          } else if (['en_promo', 'en_vedette'].includes(col)) {
            val = val ? 1 : 0;
          }
          newVehicle[col] = val;
        });
      } else {
        newVehicle.dealership_id = Number(params[0] || 1);
        newVehicle.user_id = Number(params[1] || 1);
        newVehicle.marque = params[2];
        newVehicle.modele = params[3];
        newVehicle.finition = params[4] || '';
        newVehicle.annee = Number(params[5]);
        newVehicle.prix = Number(params[6]);
        newVehicle.status = params[16] || 'approved';
      }

      memoryStore.vehicles.unshift(newVehicle);
      return { insertId: newId, affectedRows: 1 };
    }

    // 3.7 UPDATE VEHICLES
    if (normalizedSql.startsWith('UPDATE VEHICLES')) {
      const vId = Number(params[params.length - 1]);
      const vIdx = memoryStore.vehicles.findIndex(item => item.id === vId);

      if (vIdx !== -1) {
        // Changement de statut dédié : UPDATE vehicles SET status = ? WHERE id = ?
        if (normalizedSql.includes('SET STATUS = ?')) {
          memoryStore.vehicles[vIdx].status = params[0];
          memoryStore.vehicles[vIdx].updated_at = new Date();
          return { affectedRows: 1 };
        }

        memoryStore.vehicles[vIdx].updated_at = new Date();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // 3.8 DELETE FROM VEHICLES
    if (normalizedSql.startsWith('DELETE FROM VEHICLES')) {
      const vId = Number(params[0]);
      const initialLen = memoryStore.vehicles.length;
      memoryStore.vehicles = memoryStore.vehicles.filter(item => item.id !== vId);
      memoryStore.vehicle_images = memoryStore.vehicle_images.filter(img => img.vehicle_id !== vId);
      memoryStore.vehicle_favorites = memoryStore.vehicle_favorites.filter(fav => fav.vehicle_id !== vId);
      return { affectedRows: initialLen - memoryStore.vehicles.length };
    }
  }

  return null;
};

module.exports = {
  handleVehiclesQuery
};
