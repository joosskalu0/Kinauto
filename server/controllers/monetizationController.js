const { query, memoryStore } = require('../config/database');
const { monetizationStore } = require('../config/monetizationStorage');

/**
 * 1. Obtenir tous les forfaits et grilles tarifaires de la plateforme
 */
exports.getAllPlans = async (req, res) => {
  try {
    // Si la table subscription_plans existe dans la DB, on peut aussi l'enrichir
    let dbPlans = [];
    try {
      dbPlans = await query('SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY display_order ASC');
    } catch (e) {
      // Ignoré si table non initialisée
    }

    res.json({
      success: true,
      data: {
        listing_tiers: monetizationStore.listing_tiers,
        visibility_options: monetizationStore.visibility_options,
        dealership_plans: dbPlans.length > 0 ? dbPlans : monetizationStore.dealership_plans,
        garage_plans: monetizationStore.garage_plans,
        ad_placements: monetizationStore.ad_placements
      }
    });
  } catch (error) {
    console.error('Erreur getAllPlans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tarifs' });
  }
};

/**
 * 2. Obtenir les campagnes publicitaires actives pour affichage sur le site
 */
exports.getActiveAds = async (req, res) => {
  try {
    const { emplacement } = req.query;
    let ads = [];

    try {
      if (emplacement) {
        ads = await query(
          'SELECT * FROM ad_campaigns WHERE is_active = 1 AND (emplacement = ? OR format = ?)',
          [emplacement, emplacement]
        );
      } else {
        ads = await query('SELECT * FROM ad_campaigns WHERE is_active = 1');
      }
    } catch (dbErr) {
      console.warn('Fallback mémoire pour getActiveAds:', dbErr.message);
    }

    // Fallback si la requête n'a rien retourné
    if (!ads || ads.length === 0) {
      ads = monetizationStore.ad_campaigns.filter(a => a.is_active);
      if (emplacement) {
        ads = ads.filter(a => a.emplacement === emplacement || a.format === emplacement);
      }
    }

    // Incrémenter les impressions en tâche de fond dans la base de données
    if (ads && ads.length > 0) {
      ads.forEach(ad => {
        ad.impressions = (ad.impressions || 0) + 1;
        query('UPDATE ad_campaigns SET impressions = impressions + 1 WHERE id = ?', [ad.id]).catch(() => {});
      });
    }

    res.json({
      success: true,
      ads
    });
  } catch (error) {
    console.error('Erreur getActiveAds:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des bannières' });
  }
};

/**
 * 3. Enregistrer un clic sur une bannière publicitaire
 */
exports.recordAdClick = async (req, res) => {
  try {
    const { id } = req.params;

    // Mise à jour en base de données MySQL
    try {
      await query('UPDATE ad_campaigns SET clics = clics + 1 WHERE id = ?', [id]);
    } catch (dbErr) {
      console.warn('Erreur SQL recordAdClick:', dbErr.message);
    }

    // Mise à jour dans le store mémoire
    const ad = monetizationStore.ad_campaigns.find(a => a.id === id);
    if (ad) {
      ad.clics = (ad.clics || 0) + 1;
      return res.json({ success: true, clics: ad.clics });
    }

    res.json({ success: true, message: 'Clic enregistré' });
  } catch (error) {
    console.error('Erreur recordAdClick:', error);
    res.status(500).json({ success: false, message: 'Erreur enregistrement clic' });
  }
};

/**
 * 4. Soumettre une demande d'espace publicitaire / Devenir Annonceur
 */
exports.submitAdInquiry = async (req, res) => {
  try {
    const {
      nom_entreprise,
      contact_nom,
      email,
      telephone,
      format_souhaite,
      duree_mois,
      budget_estime,
      message
    } = req.body;

    if (!nom_entreprise || !contact_nom || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner le nom de votre entreprise, le contact et un numéro de téléphone.'
      });
    }

    const inquiryId = `INQ-${Date.now().toString().slice(-6)}`;
    const inquiry = {
      id: inquiryId,
      nom_entreprise,
      contact_nom,
      email: email || '',
      telephone,
      format_souhaite: format_souhaite || 'banner_inline',
      duree_mois: Number(duree_mois || 1),
      budget_estime: budget_estime ? Number(budget_estime) : null,
      message: message || '',
      statut: 'nouvelle',
      created_at: new Date()
    };

    // Insertion en base de données MySQL
    try {
      await query(
        `INSERT INTO ad_inquiries 
         (id, nom_entreprise, contact_nom, email, telephone, format_souhaite, duree_mois, budget_estime, message, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inquiry.id,
          inquiry.nom_entreprise,
          inquiry.contact_nom,
          inquiry.email,
          inquiry.telephone,
          inquiry.format_souhaite,
          inquiry.duree_mois,
          inquiry.budget_estime,
          inquiry.message,
          inquiry.statut
        ]
      );
    } catch (dbErr) {
      console.warn('Insertion mémoire ad_inquiries:', dbErr.message);
    }

    // Sauvegarde en mémoire
    monetizationStore.inquiries.unshift(inquiry);

    res.status(201).json({
      success: true,
      message: 'Votre demande d’espace publicitaire a été transmise à notre régie commerciale. Un conseiller vous contactera sous 24h.',
      inquiry
    });
  } catch (error) {
    console.error('Erreur submitAdInquiry:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l’envoi de votre demande' });
  }
};

/**
 * 5. Architecture de Commande & Passerelle de Paiement Extensible
 * Crée une intention de commande ou effectue un règlement
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      type, // 'listing_tier' | 'visibility_boost' | 'dealership_subscription' | 'garage_subscription' | 'ad_campaign'
      item_id,
      item_nom,
      target_vehicle_id,
      dealership_id,
      garage_id,
      client_nom,
      client_phone,
      client_email,
      montant_usd,
      devise = 'USD',
      payment_method = 'mpesa',
      payment_reference,
      simulate_instant_approval = true // Permet une activation immédiate pour la fluidité sans bloquer l'utilisateur
    } = req.body;

    if (!type || !item_id || montant_usd === undefined) {
      return res.status(400).json({ success: false, message: 'Paramètres de commande incomplets' });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      type,
      item_id,
      item_nom: item_nom || `${type} : ${item_id}`,
      target_vehicle_id: target_vehicle_id ? Number(target_vehicle_id) : null,
      dealership_id: dealership_id ? Number(dealership_id) : null,
      garage_id: garage_id ? Number(garage_id) : null,
      client_nom: client_nom || (req.user ? req.user.nom_complet || req.user.nom : 'Client AutoConcession'),
      client_phone: client_phone || (req.user ? req.user.telephone : '+243'),
      client_email: client_email || (req.user ? req.user.email : ''),
      montant_usd: Number(montant_usd),
      devise,
      payment_method,
      payment_reference: payment_reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: simulate_instant_approval ? 'completed' : 'pending',
      created_at: new Date()
    };

    // 1. Sauvegarde en table MySQL monetization_orders
    try {
      await query(
        `INSERT INTO monetization_orders 
         (id, type, item_id, item_nom, target_vehicle_id, dealership_id, garage_id, client_nom, client_phone, client_email, montant_usd, devise, payment_method, payment_reference, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id,
          newOrder.type,
          newOrder.item_id,
          newOrder.item_nom,
          newOrder.target_vehicle_id,
          newOrder.dealership_id,
          newOrder.garage_id,
          newOrder.client_nom,
          newOrder.client_phone,
          newOrder.client_email,
          newOrder.montant_usd,
          newOrder.devise,
          newOrder.payment_method,
          newOrder.payment_reference,
          newOrder.status
        ]
      );
    } catch (dbErr) {
      console.warn('Erreur SQL insertion monetization_orders:', dbErr.message);
    }

    // Sauvegarde mémoire
    monetizationStore.orders.unshift(newOrder);

    // 2. Si la commande est validée et cible un véhicule, appliquer immédiatement le boost sur le véhicule
    if (newOrder.status === 'completed' && newOrder.target_vehicle_id) {
      let listing_tier = null;
      let en_vedette = null;
      let is_premium = null;
      let visibility_badge = null;
      let boost_top_search = null;

      if (type === 'listing_tier') {
        if (item_id === 'featured') {
          en_vedette = 1;
          listing_tier = 'featured';
        } else if (item_id === 'premium') {
          listing_tier = 'premium';
          is_premium = 1;
        }
      } else if (type === 'visibility_boost') {
        if (item_id === 'boost_urgent') {
          visibility_badge = 'urgent';
        } else if (item_id === 'boost_certifie') {
          visibility_badge = 'certifie';
        } else if (item_id === 'boost_top_search') {
          boost_top_search = 1;
        } else if (item_id === 'boost_carrousel_home') {
          en_vedette = 1;
        }
      }

      // Mise à jour MySQL
      try {
        await query(
          `UPDATE vehicles 
           SET listing_tier = COALESCE(?, listing_tier),
               en_vedette = COALESCE(?, en_vedette),
               visibility_badge = COALESCE(?, visibility_badge),
               boost_top_search = COALESCE(?, boost_top_search),
               updated_at = NOW()
           WHERE id = ?`,
          [listing_tier, en_vedette, visibility_badge, boost_top_search, newOrder.target_vehicle_id]
        );

        // Insertion dans vehicle_boosts
        if (type === 'visibility_boost') {
          await query(
            `INSERT INTO vehicle_boosts (vehicle_id, boost_type, date_debut, date_fin, order_id, is_active)
             VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), ?, 1)`,
            [newOrder.target_vehicle_id, item_id, newOrder.id]
          );
        }
      } catch (vehSqlErr) {
        console.warn('Erreur mise à jour véhicule MySQL lors du boost:', vehSqlErr.message);
      }

      // Mise à jour dans le memoryStore (pour le mode hors-ligne/aperçu)
      const vehList = memoryStore && memoryStore.vehicles ? memoryStore.vehicles : [];
      const veh = vehList.find(v => v.id === newOrder.target_vehicle_id);
      if (veh) {
        if (listing_tier) {
          veh.listing_tier = listing_tier;
          if (listing_tier === 'featured') veh.en_vedette = 1;
          if (listing_tier === 'premium') veh.is_premium = 1;
        }
        if (visibility_badge) veh.visibility_badge = visibility_badge;
        if (boost_top_search) veh.boost_top_search = 1;
        if (en_vedette !== null) veh.en_vedette = en_vedette;
      }
    }

    // 3. Si la commande est un abonnement concessionnaire
    if (newOrder.status === 'completed' && newOrder.dealership_id && type === 'dealership_subscription') {
      try {
        await query(
          `UPDATE dealers SET statut_abonnement = 'actif', plan_id = ?, updated_at = NOW() WHERE id = ?`,
          [item_id, newOrder.dealership_id]
        );
      } catch (dealerSqlErr) {
        console.warn('Erreur mise à jour abonnement concessionnaire:', dealerSqlErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: newOrder.status === 'completed' 
        ? 'Commande validée et activée avec succès !'
        : 'Commande enregistrée en attente de validation du paiement.',
      order: newOrder
    });
  } catch (error) {
    console.error('Erreur createOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
  }
};

/**
 * 6. Appliquer directement un boost / surclassement sur un véhicule
 */
exports.applyBoostToVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { boost_type, listing_tier, badge } = req.body;
    const numericVehicleId = Number(vehicleId);

    let en_vedette = null;
    let visibility_badge = badge || null;
    let boost_top_search = null;

    if (listing_tier === 'featured') en_vedette = 1;
    if (boost_type === 'boost_urgent') visibility_badge = 'urgent';
    if (boost_type === 'boost_certifie') visibility_badge = 'certifie';
    if (boost_type === 'boost_top_search') boost_top_search = 1;
    if (boost_type === 'boost_carrousel_home') en_vedette = 1;

    // Mise à jour MySQL
    try {
      await query(
        `UPDATE vehicles 
         SET listing_tier = COALESCE(?, listing_tier),
             en_vedette = COALESCE(?, en_vedette),
             visibility_badge = COALESCE(?, visibility_badge),
             boost_top_search = COALESCE(?, boost_top_search),
             updated_at = NOW()
         WHERE id = ?`,
        [listing_tier || null, en_vedette, visibility_badge, boost_top_search, numericVehicleId]
      );
    } catch (dbErr) {
      console.warn('Erreur SQL applyBoostToVehicle:', dbErr.message);
    }

    // Mise à jour mémoire
    const vehList = memoryStore && memoryStore.vehicles ? memoryStore.vehicles : [];
    const veh = vehList.find(v => v.id === numericVehicleId);
    if (veh) {
      if (listing_tier) {
        veh.listing_tier = listing_tier;
        if (listing_tier === 'featured') veh.en_vedette = 1;
        if (listing_tier === 'premium') veh.is_premium = 1;
      }
      if (visibility_badge) veh.visibility_badge = visibility_badge;
      if (boost_top_search) veh.boost_top_search = 1;
      if (en_vedette) veh.en_vedette = 1;
    }

    res.json({
      success: true,
      message: 'Options de visibilité appliquées au véhicule.',
      vehicle: veh || { id: numericVehicleId, listing_tier, visibility_badge, en_vedette }
    });
  } catch (error) {
    console.error('Erreur applyBoostToVehicle:', error);
    res.status(500).json({ success: false, message: 'Erreur application du boost' });
  }
};

/**
 * 7. Obtenir l'historique des commandes de monétisation (Admin & Super Admin)
 */
exports.getOrders = async (req, res) => {
  try {
    const { status, type } = req.query;
    let list = [];

    try {
      let sql = 'SELECT * FROM monetization_orders WHERE 1=1';
      const params = [];
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      sql += ' ORDER BY created_at DESC';
      list = await query(sql, params);
    } catch (dbErr) {
      console.warn('Fallback mémoire pour getOrders:', dbErr.message);
    }

    if (!list || list.length === 0) {
      list = [...monetizationStore.orders];
      if (status) list = list.filter(o => o.status === status);
      if (type) list = list.filter(o => o.type === type);
    }

    const total_revenue_usd = list
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (Number(o.montant_usd) || 0), 0);

    res.json({
      success: true,
      orders: list,
      total_revenue_usd
    });
  } catch (error) {
    console.error('Erreur getOrders:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération des commandes' });
  }
};

/**
 * 8. Obtenir toutes les campagnes pour l'administration
 */
exports.getAdminAdCampaigns = async (req, res) => {
  try {
    let campaigns = [];
    let inquiries = [];

    try {
      campaigns = await query('SELECT * FROM ad_campaigns ORDER BY created_at DESC');
      inquiries = await query('SELECT * FROM ad_inquiries ORDER BY created_at DESC');
    } catch (dbErr) {
      console.warn('Fallback mémoire admin ads:', dbErr.message);
    }

    if (!campaigns || campaigns.length === 0) {
      campaigns = monetizationStore.ad_campaigns;
    }
    if (!inquiries || inquiries.length === 0) {
      inquiries = monetizationStore.inquiries;
    }

    res.json({
      success: true,
      campaigns,
      inquiries,
      placements: monetizationStore.ad_placements
    });
  } catch (error) {
    console.error('Erreur getAdminAdCampaigns:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération des campagnes' });
  }
};

/**
 * 9. Créer une nouvelle campagne publicitaire (Admin)
 */
exports.createAdCampaign = async (req, res) => {
  try {
    const {
      titre,
      annonceur,
      tag,
      format,
      emplacement,
      image_url,
      description,
      cta_text,
      cta_url,
      badge_color
    } = req.body;

    if (!titre || !annonceur || !image_url) {
      return res.status(400).json({ success: false, message: 'Titre, annonceur et image sont requis' });
    }

    const newCampaign = {
      id: `camp-${Date.now().toString().slice(-6)}`,
      titre,
      annonceur,
      tag: tag || 'Partenaire Officiel',
      format: format || 'banner_inline',
      emplacement: emplacement || 'catalogue_inline',
      image_url,
      description: description || '',
      cta_text: cta_text || 'En savoir plus',
      cta_url: cta_url || '#',
      badge_color: badge_color || 'bg-amber-600 text-white',
      impressions: 0,
      clics: 0,
      date_debut: new Date().toISOString().slice(0, 10),
      date_fin: new Date(Date.now() + 3600000 * 24 * 30).toISOString().slice(0, 10),
      is_active: 1
    };

    // Insertion MySQL
    try {
      await query(
        `INSERT INTO ad_campaigns 
         (id, titre, annonceur, tag, format, emplacement, image_url, description, cta_text, cta_url, badge_color, impressions, clics, date_debut, date_fin, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 1)`,
        [
          newCampaign.id,
          newCampaign.titre,
          newCampaign.annonceur,
          newCampaign.tag,
          newCampaign.format,
          newCampaign.emplacement,
          newCampaign.image_url,
          newCampaign.description,
          newCampaign.cta_text,
          newCampaign.cta_url,
          newCampaign.badge_color,
          newCampaign.date_debut,
          newCampaign.date_fin
        ]
      );
    } catch (dbErr) {
      console.warn('Erreur SQL insertion ad_campaigns:', dbErr.message);
    }

    monetizationStore.ad_campaigns.unshift(newCampaign);

    res.status(201).json({
      success: true,
      message: 'Campagne publicitaire créée avec succès !',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('Erreur createAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur création de campagne' });
  }
};

/**
 * 10. Modifier ou basculer le statut d'une campagne
 */
exports.updateAdCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, annonceur, tag, format, emplacement, image_url, description, cta_text, cta_url, badge_color, is_active } = req.body;

    // Mise à jour MySQL
    try {
      await query(
        `UPDATE ad_campaigns 
         SET titre = COALESCE(?, titre),
             annonceur = COALESCE(?, annonceur),
             tag = COALESCE(?, tag),
             format = COALESCE(?, format),
             emplacement = COALESCE(?, emplacement),
             image_url = COALESCE(?, image_url),
             description = COALESCE(?, description),
             cta_text = COALESCE(?, cta_text),
             cta_url = COALESCE(?, cta_url),
             badge_color = COALESCE(?, badge_color),
             is_active = COALESCE(?, is_active),
             updated_at = NOW()
         WHERE id = ?`,
        [titre, annonceur, tag, format, emplacement, image_url, description, cta_text, cta_url, badge_color, is_active, id]
      );
    } catch (dbErr) {
      console.warn('Erreur SQL updateAdCampaign:', dbErr.message);
    }

    const campaign = monetizationStore.ad_campaigns.find(c => c.id === id);
    if (campaign) {
      Object.assign(campaign, req.body);
    }

    res.json({
      success: true,
      message: 'Campagne mise à jour avec succès',
      campaign: campaign || { id, ...req.body }
    });
  } catch (error) {
    console.error('Erreur updateAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour campagne' });
  }
};

/**
 * 11. Supprimer une campagne publicitaire
 */
exports.deleteAdCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Suppression MySQL
    try {
      await query('DELETE FROM ad_campaigns WHERE id = ?', [id]);
    } catch (dbErr) {
      console.warn('Erreur SQL deleteAdCampaign:', dbErr.message);
    }

    const index = monetizationStore.ad_campaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      monetizationStore.ad_campaigns.splice(index, 1);
    }

    res.json({ success: true, message: 'Campagne publicitaire supprimée' });
  } catch (error) {
    console.error('Erreur deleteAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression campagne' });
  }
};
