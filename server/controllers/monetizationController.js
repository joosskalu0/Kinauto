const { monetizationStore } = require('../config/monetizationStorage');
const { memoryStore } = require('../config/vehicleStorage');

/**
 * 1. Obtenir tous les forfaits et grilles tarifaires de la plateforme
 */
exports.getAllPlans = (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        listing_tiers: monetizationStore.listing_tiers,
        visibility_options: monetizationStore.visibility_options,
        dealership_plans: monetizationStore.dealership_plans,
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
exports.getActiveAds = (req, res) => {
  try {
    const { emplacement } = req.query;
    let ads = monetizationStore.ad_campaigns.filter(a => a.is_active);

    if (emplacement) {
      ads = ads.filter(a => a.emplacement === emplacement || a.format === emplacement);
    }

    // Incrémenter les impressions
    ads.forEach(ad => {
      ad.impressions = (ad.impressions || 0) + 1;
    });

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
exports.recordAdClick = (req, res) => {
  try {
    const { id } = req.params;
    const ad = monetizationStore.ad_campaigns.find(a => a.id === id);

    if (ad) {
      ad.clics = (ad.clics || 0) + 1;
      return res.json({ success: true, clics: ad.clics });
    }

    res.status(404).json({ success: false, message: 'Campagne introuvable' });
  } catch (error) {
    console.error('Erreur recordAdClick:', error);
    res.status(500).json({ success: false, message: 'Erreur enregistrement clic' });
  }
};

/**
 * 4. Soumettre une demande d'espace publicitaire / Devenir Annonceur
 */
exports.submitAdInquiry = (req, res) => {
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

    const inquiry = {
      id: `INQ-${Date.now().toString().slice(-6)}`,
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

    monetizationStore.inquiries.push(inquiry);

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
exports.createOrder = (req, res) => {
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

    if (!type || !item_id || !montant_usd) {
      return res.status(400).json({ success: false, message: 'Paramètres de commande incomplets' });
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
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

    monetizationStore.orders.unshift(newOrder);

    // Si la commande est validée et cible un véhicule, appliquer immédiatement le boost sur le véhicule
    if (newOrder.status === 'completed' && newOrder.target_vehicle_id) {
      const veh = memoryStore.vehicles.find(v => v.id === newOrder.target_vehicle_id);
      if (veh) {
        if (type === 'listing_tier') {
          if (item_id === 'featured') {
            veh.en_vedette = 1;
            veh.listing_tier = 'featured';
          } else if (item_id === 'premium') {
            veh.listing_tier = 'premium';
            veh.is_premium = 1;
          }
        } else if (type === 'visibility_boost') {
          if (item_id === 'boost_urgent') {
            veh.visibility_badge = 'urgent';
          } else if (item_id === 'boost_certifie') {
            veh.visibility_badge = 'certifie';
          } else if (item_id === 'boost_top_search') {
            veh.boost_top_search = 1;
            veh.updated_at = new Date();
          } else if (item_id === 'boost_carrousel_home') {
            veh.en_vedette = 1;
          }
        }
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
exports.applyBoostToVehicle = (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { boost_type, listing_tier, badge } = req.body;

    const veh = memoryStore.vehicles.find(v => v.id === Number(vehicleId));
    if (!veh) {
      return res.status(404).json({ success: false, message: 'Véhicule non trouvé' });
    }

    if (listing_tier) {
      veh.listing_tier = listing_tier;
      if (listing_tier === 'featured') {
        veh.en_vedette = 1;
      }
      if (listing_tier === 'premium') {
        veh.is_premium = 1;
      }
    }

    if (boost_type === 'boost_urgent') veh.visibility_badge = 'urgent';
    if (boost_type === 'boost_certifie') veh.visibility_badge = 'certifie';
    if (boost_type === 'boost_top_search') {
      veh.boost_top_search = 1;
      veh.updated_at = new Date();
    }
    if (boost_type === 'boost_carrousel_home') veh.en_vedette = 1;
    if (badge) veh.visibility_badge = badge;

    res.json({
      success: true,
      message: 'Options de visibilité appliquées au véhicule.',
      vehicle: veh
    });
  } catch (error) {
    console.error('Erreur applyBoostToVehicle:', error);
    res.status(500).json({ success: false, message: 'Erreur application du boost' });
  }
};

/**
 * 7. Obtenir l'historique des commandes de monétisation (Admin & Super Admin)
 */
exports.getOrders = (req, res) => {
  try {
    const { status, type } = req.query;
    let list = [...monetizationStore.orders];

    if (status) list = list.filter(o => o.status === status);
    if (type) list = list.filter(o => o.type === type);

    res.json({
      success: true,
      orders: list,
      total_revenue_usd: list
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.montant_usd || 0), 0)
    });
  } catch (error) {
    console.error('Erreur getOrders:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération des commandes' });
  }
};

/**
 * 8. Obtenir toutes les campagnes pour l'administration
 */
exports.getAdminAdCampaigns = (req, res) => {
  try {
    res.json({
      success: true,
      campaigns: monetizationStore.ad_campaigns,
      inquiries: monetizationStore.inquiries,
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
exports.createAdCampaign = (req, res) => {
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
      is_active: true
    };

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
exports.updateAdCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const campaign = monetizationStore.ad_campaigns.find(c => c.id === id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvée' });
    }

    Object.assign(campaign, req.body);

    res.json({
      success: true,
      message: 'Campagne mise à jour avec succès',
      campaign
    });
  } catch (error) {
    console.error('Erreur updateAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour campagne' });
  }
};

/**
 * 11. Supprimer une campagne publicitaire
 */
exports.deleteAdCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const index = monetizationStore.ad_campaigns.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvée' });
    }

    monetizationStore.ad_campaigns.splice(index, 1);

    res.json({ success: true, message: 'Campagne publicitaire supprimée' });
  } catch (error) {
    console.error('Erreur deleteAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression campagne' });
  }
};
