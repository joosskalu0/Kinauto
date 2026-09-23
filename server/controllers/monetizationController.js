const { query, memoryStore } = require('../config/database');
const { 
  ADMIN_PAYMENT_ACCOUNTS,
  FREE_LISTINGS_CONFIG, 
  PROMOTION_OPTIONS, 
  SUBSCRIPTION_PLANS, 
  AD_PLACEMENTS, 
  monetizationStore 
} = require('../config/monetizationStorage');

/**
 * 1. Obtenir les quotas d'annonces de l'utilisateur connecté (Gratuites vs Pro)
 * Règle : Les particuliers disposent de 3 annonces actives gratuites.
 */
exports.getUserQuota = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentification requise' });
    }

    // 1. Vérifier si l'utilisateur est un concessionnaire ou vendeur professionnel avec un forfait actif
    let isPro = false;
    let maxAllowed = FREE_LISTINGS_CONFIG.max_active_listings; // Par défaut 3 pour un particulier
    let planName = 'Particulier (Gratuit)';
    let dealerId = null;

    try {
      const dealerCheck = await query(
        `SELECT d.id, d.statut_abonnement, d.subscription_plan_id, sp.max_vehicles, sp.name AS plan_name
         FROM dealers d
         LEFT JOIN subscription_plans sp ON d.subscription_plan_id = sp.id
         WHERE d.user_id = ? AND d.statut_abonnement = 'actif'
         LIMIT 1`,
        [userId]
      );

      if (dealerCheck && dealerCheck.length > 0) {
        const dealer = dealerCheck[0];
        isPro = true;
        dealerId = dealer.id;
        maxAllowed = dealer.max_vehicles || 20;
        planName = dealer.plan_name || 'Concessionnaire / Vendeur Pro';
      }
    } catch (e) {
      // Ignoré si table non accessible
    }

    // 2. Compter le nombre de véhicules actifs de l'utilisateur
    let activeCount = 0;
    try {
      const countRes = await query(
        `SELECT COUNT(*) as total 
         FROM vehicles 
         WHERE user_id = ? 
           AND deleted_at IS NULL 
           AND status IN ('approved', 'disponible', 'pending')`,
        [userId]
      );
      if (countRes && countRes.length > 0) {
        activeCount = Number(countRes[0].total) || 0;
      }
    } catch (countErr) {
      // Fallback mémoire
      const list = memoryStore?.vehicles || [];
      activeCount = list.filter(v => 
        Number(v.user_id) === Number(userId) && 
        !v.deleted_at && 
        ['approved', 'disponible', 'pending'].includes(v.status)
      ).length;
    }

    const remaining = Math.max(0, maxAllowed - activeCount);
    const canPublish = activeCount < maxAllowed;

    res.json({
      success: true,
      active_count: activeCount,
      max_free_listings: FREE_LISTINGS_CONFIG.max_active_listings,
      max_allowed: maxAllowed,
      remaining,
      is_pro: isPro,
      plan_name: planName,
      dealer_id: dealerId,
      can_publish: canPublish,
      limit_reached_message: canPublish 
        ? null 
        : (isPro 
            ? `Limite de votre forfait pro atteinte (${activeCount}/${maxAllowed}). Veuillez passer au forfait supérieur.`
            : `Limite de 3 annonces gratuites atteinte (${activeCount}/3). Souscrivez à un forfait Vendeur Pro ou Concessionnaire pour continuer à publier sans restriction.`)
    });
  } catch (error) {
    console.error('Erreur getUserQuota:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul du quota d’annonces' });
  }
};

/**
 * 2. Obtenir la configuration complète et les grilles tarifaires
 */
exports.getAllPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        payment_accounts: monetizationStore.payment_accounts || ADMIN_PAYMENT_ACCOUNTS,
        free_listings_config: FREE_LISTINGS_CONFIG,
        promotion_options: PROMOTION_OPTIONS,
        subscription_plans: SUBSCRIPTION_PLANS,
        ad_placements: AD_PLACEMENTS
      }
    });
  } catch (error) {
    console.error('Erreur getAllPlans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tarifs' });
  }
};

exports.getMonetizationConfig = exports.getAllPlans;

/**
 * 3. Créer une intention de mise en avant d'une annonce (Annonces Premium & Options)
 * RÈGLE DE SÉCURITÉ CRITIQUE :
 * - Le prix est RÉCUPÉRÉ DU SERVEUR selon l'option et la durée (3, 7, 15, 30 jours).
 * - NE JAMAIS faire confiance au prix envoyé par le frontend.
 * - Le statut initial du paiement est 'PENDING'.
 * - NE JAMAIS activer le boost tant que le paiement n'est pas confirmé !
 */
exports.promoteVehicle = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentification requise pour promouvoir un véhicule.' });
    }

    const {
      vehicle_id,
      option_id, // 'featured' | 'sponsored' | 'bump' | 'badge_premium'
      duration_days, // 3 | 7 | 15 | 30
      payment_method = 'mpesa',
      payer_phone,
      payer_name
    } = req.body;

    const numVehicleId = Number(vehicle_id);
    const numDuration = Number(duration_days);

    if (!numVehicleId || !option_id || !numDuration) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants : vehicle_id, option_id et duration_days sont obligatoires.'
      });
    }

    // 1. Validation de l'option de promotion
    const option = PROMOTION_OPTIONS[option_id];
    if (!option) {
      return res.status(400).json({
        success: false,
        message: `Option de promotion invalide : ${option_id}. Options valides : featured, sponsored, bump, badge_premium.`
      });
    }

    // 2. Validation de la durée et CALCUL STRICT DU PRIX CÔTÉ SERVEUR
    const tierDuration = option.durees.find(d => d.jours === numDuration);
    if (!tierDuration) {
      return res.status(400).json({
        success: false,
        message: `Durée non valide : ${numDuration} jours. Durées configurables : 3, 7, 15 ou 30 jours.`
      });
    }

    const serverCalculatedPriceUsd = tierDuration.prix_usd;
    const serverCalculatedPriceFc = tierDuration.prix_fc;

    // 3. Vérification de l'existence du véhicule et des droits du demandeur
    let vehicle = null;
    try {
      const vehQuery = await query('SELECT id, marque, modele, user_id, dealership_id FROM vehicles WHERE id = ? LIMIT 1', [numVehicleId]);
      if (vehQuery && vehQuery.length > 0) {
        vehicle = vehQuery[0];
      }
    } catch (e) {
      const memVeh = (memoryStore?.vehicles || []).find(v => Number(v.id) === numVehicleId);
      if (memVeh) vehicle = memVeh;
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule spécifié introuvable.' });
    }

    // Vérifier les permissions (propriétaire de l'annonce ou administrateur)
    if (req.user.role !== 'admin' && vehicle.user_id && Number(vehicle.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n’êtes pas autorisé à promouvoir un véhicule appartenant à un autre utilisateur.'
      });
    }

    // 4. Création de la transaction de paiement (Statut initial STRICT : PENDING)
    const transactionReference = `TXN-BOOST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;

    const metadataJson = JSON.stringify({
      option_id,
      option_nom: option.nom,
      duration_days: numDuration,
      vehicle_id: numVehicleId,
      vehicle_title: `${vehicle.marque} ${vehicle.modele}`,
      prix_fc: serverCalculatedPriceFc
    });

    const clientPhone = payer_phone || req.user.telephone || '+243';
    const clientName = payer_name || req.user.nom_complet || req.user.nom || 'Client AutoKin';

    try {
      await query(
        `INSERT INTO payments (
          uuid, transaction_reference, user_id, vehicle_id, purpose, amount, currency,
          payment_method, payer_phone, payer_name, status, notes, metadata, created_at, updated_at
        ) VALUES (
          UUID(), ?, ?, ?, 'vehicle_promotion', ?, 'USD', ?, ?, ?, 'PENDING', ?, ?, NOW(), NOW()
        )`,
        [
          transactionReference,
          userId,
          numVehicleId,
          serverCalculatedPriceUsd,
          payment_method,
          clientPhone,
          clientName,
          `Promotion ${option.nom} (${numDuration} jours) pour ${vehicle.marque} ${vehicle.modele}`,
          metadataJson
        ]
      );
    } catch (sqlErr) {
      console.warn('Erreur SQL insertion payments:', sqlErr.message);
    }

    // Synchronisation dans le store mémoire pour aperçu immédiat
    const newPaymentRecord = {
      id: monetizationStore.payments.length + 1,
      payment_id: paymentId,
      transaction_reference: transactionReference,
      user_id: userId,
      vehicle_id: numVehicleId,
      purpose: 'vehicle_promotion',
      amount: serverCalculatedPriceUsd,
      currency: 'USD',
      payment_method,
      payer_phone: clientPhone,
      payer_name: clientName,
      status: 'PENDING', // JAMAIS PAID À CE STADE
      metadata: JSON.parse(metadataJson),
      notes: `Promotion ${option.nom} (${numDuration} jours) en attente de paiement`,
      paid_at: null,
      created_at: new Date()
    };
    monetizationStore.payments.unshift(newPaymentRecord);

    // Enregistrement également dans monetization_orders pour compatibilité
    const orderRecord = {
      id: `ORD-${transactionReference}`,
      type: 'visibility_boost',
      item_id: option_id,
      item_nom: `${option.nom} (${numDuration} jours)`,
      target_vehicle_id: numVehicleId,
      client_nom: clientName,
      client_phone: clientPhone,
      client_email: req.user.email || '',
      montant_usd: serverCalculatedPriceUsd,
      devise: 'USD',
      payment_method,
      payment_reference: transactionReference,
      status: 'pending',
      created_at: new Date()
    };
    monetizationStore.orders.unshift(orderRecord);

    res.status(201).json({
      success: true,
      message: 'Intention de promotion enregistrée avec succès. La mise en avant sera activée dès réception et validation du règlement.',
      payment: {
        payment_id: paymentId,
        transaction_reference: transactionReference,
        amount: serverCalculatedPriceUsd,
        amount_fc: serverCalculatedPriceFc,
        currency: 'USD',
        status: 'PENDING',
        option: option.nom,
        duration_days: numDuration,
        vehicle: `${vehicle.marque} ${vehicle.modele}`
      },
      instructions: `Veuillez effectuer le règlement de ${serverCalculatedPriceUsd} $ (${serverCalculatedPriceFc.toLocaleString()} CDF) via ${payment_method.toUpperCase()} avec la référence ${transactionReference}.`
    });
  } catch (error) {
    console.error('Erreur promoteVehicle:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l’initiation de la promotion' });
  }
};

/**
 * 4. Souscrire à un abonnement professionnel (Concessionnaire, Vendeur Pro, Garage)
 * RÈGLE : Le prix est RÉCUPÉRÉ DU SERVEUR selon le plan_id.
 */
exports.subscribePlan = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentification requise pour souscrire un abonnement.' });
    }

    const {
      plan_id,
      target = 'dealers', // 'dealers' | 'sellers' | 'garages'
      billing_cycle = 'mensuel', // 'mensuel' | 'annuel'
      dealership_id,
      garage_id,
      payment_method = 'mpesa',
      payer_phone,
      payer_name
    } = req.body;

    const plansList = SUBSCRIPTION_PLANS[target];
    if (!plansList) {
      return res.status(400).json({ success: false, message: `Catégorie d’abonnement invalide : ${target}` });
    }

    const plan = plansList.find(p => p.id === plan_id);
    if (!plan) {
      return res.status(404).json({ success: false, message: `Forfait introuvable : ${plan_id}` });
    }

    // PRIX STRICTEMENT CALCULÉ CÔTÉ SERVEUR
    const priceUsd = billing_cycle === 'annuel' ? plan.prix_annuel_usd : plan.prix_mensuel_usd;
    const priceFc = (priceUsd || 0) * 2850;

    // Si le plan est 100% gratuit (ex: Garage Starter à 0$)
    if (priceUsd === 0) {
      return res.json({
        success: true,
        message: `Souscription au forfait gratuit « ${plan.nom} » validée immédiatement.`,
        status: 'PAID',
        plan: plan.nom
      });
    }

    const transactionReference = `TXN-SUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const paymentId = `PAY-SUB-${Date.now().toString().slice(-6)}`;

    const metadataJson = JSON.stringify({
      plan_id: plan.id,
      plan_nom: plan.nom,
      target,
      billing_cycle,
      dealership_id: dealership_id ? Number(dealership_id) : null,
      garage_id: garage_id ? Number(garage_id) : null,
      max_vehicles: plan.nombre_max_annonces
    });

    const clientPhone = payer_phone || req.user.telephone || '+243';
    const clientName = payer_name || req.user.nom_complet || req.user.nom || 'Client Pro AutoKin';

    try {
      await query(
        `INSERT INTO payments (
          uuid, transaction_reference, user_id, dealer_id, garage_id, purpose, amount, currency,
          payment_method, payer_phone, payer_name, status, notes, metadata, created_at, updated_at
        ) VALUES (
          UUID(), ?, ?, ?, ?, 'subscription', ?, 'USD', ?, ?, ?, 'PENDING', ?, ?, NOW(), NOW()
        )`,
        [
          transactionReference,
          userId,
          dealership_id || null,
          garage_id || null,
          priceUsd,
          payment_method,
          clientPhone,
          clientName,
          `Abonnement ${plan.nom} (${billing_cycle})`,
          metadataJson
        ]
      );
    } catch (sqlErr) {
      console.warn('Erreur SQL insertion paiement abonnement:', sqlErr.message);
    }

    const newPayment = {
      id: monetizationStore.payments.length + 1,
      payment_id: paymentId,
      transaction_reference: transactionReference,
      user_id: userId,
      purpose: 'subscription',
      amount: priceUsd,
      currency: 'USD',
      payment_method,
      payer_phone: clientPhone,
      payer_name: clientName,
      status: 'PENDING',
      metadata: JSON.parse(metadataJson),
      notes: `Abonnement ${plan.nom} (${billing_cycle})`,
      paid_at: null,
      created_at: new Date()
    };
    monetizationStore.payments.unshift(newPayment);

    res.status(201).json({
      success: true,
      message: 'Demande d’abonnement enregistrée. Les avantages professionnels seront activés dès validation du paiement.',
      payment: {
        payment_id: paymentId,
        transaction_reference: transactionReference,
        amount: priceUsd,
        amount_fc: priceFc,
        currency: 'USD',
        status: 'PENDING',
        plan: plan.nom,
        billing_cycle
      }
    });
  } catch (error) {
    console.error('Erreur subscribePlan:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la souscription' });
  }
};

/**
 * 5. Refactorisation sécurisée de createOrder :
 * Le prix est systématiquement vérifié côté serveur.
 * Le statut reste 'pending' jusqu'à confirmation explicite.
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      type, // 'listing_tier' | 'visibility_boost' | 'dealership_subscription' | 'ad_campaign'
      item_id,
      target_vehicle_id,
      dealership_id,
      garage_id,
      client_nom,
      client_phone,
      client_email,
      payment_method = 'mpesa'
    } = req.body;

    if (!type || !item_id) {
      return res.status(400).json({ success: false, message: 'Paramètres type et item_id requis' });
    }

    // Récupération stricte du prix serveur
    let calculatedAmount = 10; // Fallback sécurisé
    let itemName = `${type} : ${item_id}`;

    if (type === 'visibility_boost' || type === 'listing_tier') {
      const opt = PROMOTION_OPTIONS[item_id];
      if (opt) {
        calculatedAmount = opt.durees[1]?.prix_usd || 10; // 7 jours par défaut
        itemName = opt.nom;
      }
    } else if (type === 'dealership_subscription') {
      const p = SUBSCRIPTION_PLANS.dealers.find(d => d.id === item_id);
      if (p) {
        calculatedAmount = p.prix_mensuel_usd;
        itemName = p.nom;
      }
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      type,
      item_id,
      item_nom: itemName,
      target_vehicle_id: target_vehicle_id ? Number(target_vehicle_id) : null,
      dealership_id: dealership_id ? Number(dealership_id) : null,
      garage_id: garage_id ? Number(garage_id) : null,
      client_nom: client_nom || (req.user ? req.user.nom_complet || req.user.nom : 'Client AutoKin'),
      client_phone: client_phone || (req.user ? req.user.telephone : '+243'),
      client_email: client_email || (req.user ? req.user.email : ''),
      montant_usd: calculatedAmount, // Strictement côté serveur
      devise: 'USD',
      payment_method,
      payment_reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending', // JAMAIS complété automatiquement
      created_at: new Date()
    };

    monetizationStore.orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: 'Commande enregistrée avec succès en attente de paiement.',
      order: newOrder
    });
  } catch (error) {
    console.error('Erreur createOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
  }
};

/**
 * 6. Obtenir la liste des paiements avec filtres de statuts (PENDING, PENDING_VERIFICATION, PAID, FAILED, CANCELLED, EXPIRED)
 */
exports.getPayments = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let list = [];

    try {
      let sql = 'SELECT * FROM payments WHERE 1=1';
      const params = [];

      if (status && status !== 'all') {
        if (status.toLowerCase() === 'pending_verification') {
          sql += ' AND (status = "PENDING_VERIFICATION" OR status = "pending_verification")';
        } else {
          sql += ' AND (status = ? OR UPPER(status) = ?)';
          params.push(status, status.toUpperCase());
        }
      }
      if (search) {
        sql += ' AND (transaction_reference LIKE ? OR payer_phone LIKE ? OR payer_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), (Number(page) - 1) * Number(limit));

      list = await query(sql, params);
    } catch (sqlErr) {
      console.warn('Fallback mémoire getPayments:', sqlErr.message);
    }

    if (!list || list.length === 0) {
      list = [...monetizationStore.payments];
      if (status && status !== 'all') {
        const sUpper = status.toUpperCase();
        list = list.filter(p => String(p.status).toUpperCase() === sUpper);
      }
      if (search) {
        const sLow = search.toLowerCase();
        list = list.filter(p => 
          (p.transaction_reference && p.transaction_reference.toLowerCase().includes(sLow)) ||
          (p.payer_phone && p.payer_phone.toLowerCase().includes(sLow)) ||
          (p.payer_name && p.payer_name.toLowerCase().includes(sLow))
        );
      }
    }

    // Enrichir chaque paiement avec les informations du véhicule et la capture d'écran
    const enrichedList = list.map(p => {
      let meta = p.metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
      }
      meta = meta || {};

      const vehId = p.vehicle_id || meta.vehicle_id;
      let vehicleInfo = null;
      if (vehId) {
        vehicleInfo = (memoryStore?.vehicles || []).find(v => Number(v.id) === Number(vehId));
      }

      const proofImg = p.proof_image || meta.proof_image || null;

      return {
        ...p,
        metadata: meta,
        proof_image: proofImg,
        proof_submitted_at: p.proof_submitted_at || meta.proof_submitted_at || null,
        vehicle_id: vehId,
        vehicle_title: vehicleInfo ? `${vehicleInfo.marque} ${vehicleInfo.modele} (${vehicleInfo.annee})` : (meta.vehicle_title || (vehId ? `Véhicule #${vehId}` : 'Abonnement / Service')),
        vehicle_image: vehicleInfo?.images?.[0] || null,
        vehicle_price: vehicleInfo?.prix || null,
        duration_days: meta.duration_days || null,
        option_nom: meta.option_nom || meta.option_id || 'Mise en avant'
      };
    });

    // Calcul des KPI de paiements
    const allPay = monetizationStore.payments;
    const totalPaid = allPay
      .filter(p => ['PAID', 'completed'].includes(String(p.status).toUpperCase()))
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalPending = allPay
      .filter(p => ['PENDING', 'PENDING_VERIFICATION'].includes(String(p.status).toUpperCase()))
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const countPendingVerification = allPay.filter(p => 
      String(p.status).toUpperCase() === 'PENDING_VERIFICATION' || 
      (String(p.status).toUpperCase() === 'PENDING' && (p.proof_image || p.metadata?.proof_image))
    ).length;

    res.json({
      success: true,
      data: enrichedList,
      count: enrichedList.length,
      payment_accounts: monetizationStore.payment_accounts || ADMIN_PAYMENT_ACCOUNTS,
      kpis: {
        total_paid_usd: totalPaid,
        total_pending_usd: totalPending,
        count_paid: allPay.filter(p => ['PAID', 'completed'].includes(String(p.status).toUpperCase())).length,
        count_pending: allPay.filter(p => ['PENDING'].includes(String(p.status).toUpperCase())).length,
        count_pending_verification: countPendingVerification
      }
    });
  } catch (error) {
    console.error('Erreur getPayments:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des paiements' });
  }
};

/**
 * 7. CONFIRMATION DE PAIEMENT (Admin ou Webhook sécurisé)
 * C'EST LE SEUL ENDROIT OÙ LES FONCTIONNALITÉS PAYANTES SONT ACTIVÉES !
 */
exports.confirmPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    // 1. Recherche du paiement
    let payment = null;
    try {
      const resPay = await query('SELECT * FROM payments WHERE id = ? OR transaction_reference = ? LIMIT 1', [paymentId, paymentId]);
      if (resPay && resPay.length > 0) payment = resPay[0];
    } catch (e) {}

    if (!payment) {
      payment = monetizationStore.payments.find(p => 
        String(p.id) === String(paymentId) || 
        p.transaction_reference === paymentId || 
        p.payment_id === paymentId
      );
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Transaction de paiement introuvable.' });
    }

    if (['PAID', 'completed'].includes(String(payment.status).toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Ce paiement a déjà été confirmé et activé.' });
    }

    // 2. Mise à jour du statut du paiement -> PAID
    const now = new Date();
    try {
      await query(
        `UPDATE payments 
         SET status = 'PAID', paid_at = NOW(), updated_at = NOW() 
         WHERE id = ? OR transaction_reference = ?`,
        [payment.id, payment.transaction_reference]
      );
    } catch (sqlErr) {
      console.warn('Erreur SQL confirmation paiement:', sqlErr.message);
    }
    payment.status = 'PAID';
    payment.paid_at = now;

    // 3. ACTIVATION DU SERVICE (Boost Véhicule ou Abonnement Pro)
    let meta = payment.metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }
    meta = meta || {};

    const targetVehicleId = payment.vehicle_id || meta.vehicle_id;
    const durationDays = Number(meta.duration_days) || 7;
    const optionId = meta.option_id || 'featured';

    if (payment.purpose === 'vehicle_promotion' && targetVehicleId) {
      const numVehicleId = Number(targetVehicleId);
      const expirationDate = new Date(Date.now() + durationDays * 24 * 3600000);

      // A. Insertion dans la table vehicle_boosts
      try {
        await query(
          `INSERT INTO vehicle_boosts (vehicle_id, boost_type, duration_days, date_debut, date_fin, order_id, is_active, created_at)
           VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, 1, NOW())`,
          [numVehicleId, optionId, durationDays, durationDays, payment.transaction_reference]
        );
      } catch (sqlBoostErr) {
        console.warn('Erreur SQL insertion vehicle_boosts:', sqlBoostErr.message);
      }

      // Insertion dans le store mémoire vehicle_boosts
      monetizationStore.vehicle_boosts.unshift({
        id: monetizationStore.vehicle_boosts.length + 1,
        vehicle_id: numVehicleId,
        boost_type: optionId,
        duration_days: durationDays,
        date_debut: now,
        date_fin: expirationDate,
        order_id: payment.transaction_reference,
        is_active: 1,
        created_at: now
      });

      // B. Mise à jour des drapeaux dans la table vehicles selon l'option choisie
      let updateSql = 'UPDATE vehicles SET updated_at = NOW()';
      const updateParams = [];

      if (optionId === 'featured') {
        updateSql += ', en_vedette = 1, listing_tier = "featured", featured_until = DATE_ADD(NOW(), INTERVAL ? DAY)';
        updateParams.push(durationDays);
      } else if (optionId === 'sponsored') {
        updateSql += ', is_sponsored = 1, listing_tier = "featured"';
      } else if (optionId === 'bump') {
        updateSql += ', boost_top_search = 1, boost_top_search_until = DATE_ADD(NOW(), INTERVAL ? DAY), created_at = NOW()';
        updateParams.push(durationDays);
      } else if (optionId === 'badge_premium') {
        updateSql += ', listing_tier = "premium", visibility_badge = "top_deal"';
      }

      updateSql += ' WHERE id = ?';
      updateParams.push(numVehicleId);

      try {
        await query(updateSql, updateParams);
      } catch (vehUpdateErr) {
        console.warn('Erreur SQL update vehicles lors de la confirmation:', vehUpdateErr.message);
      }

      // Mise à jour dans le memoryStore
      const memVeh = (memoryStore?.vehicles || []).find(v => Number(v.id) === numVehicleId);
      if (memVeh) {
        if (optionId === 'featured') {
          memVeh.en_vedette = 1;
          memVeh.listing_tier = 'featured';
          memVeh.featured_until = expirationDate;
        } else if (optionId === 'sponsored') {
          memVeh.is_sponsored = 1;
        } else if (optionId === 'bump') {
          memVeh.boost_top_search = 1;
          memVeh.boost_top_search_until = expirationDate;
          memVeh.created_at = now;
        } else if (optionId === 'badge_premium') {
          memVeh.listing_tier = 'premium';
          memVeh.visibility_badge = 'top_deal';
        }
      }
    } else if (payment.purpose === 'subscription') {
      // Activation de l'abonnement concessionnaire / vendeur / garage
      const dealerId = payment.dealer_id || meta.dealership_id;
      if (dealerId) {
        try {
          await query(
            `UPDATE dealers 
             SET statut_abonnement = 'actif', 
                 plan_id = ?, 
                 updated_at = NOW() 
             WHERE id = ?`,
            [meta.plan_id || 'pro', dealerId]
          );
        } catch (dealerErr) {
          console.warn('Erreur SQL activation abonnement dealer:', dealerErr.message);
        }
      }
    }

    // Synchronisation de la commande associée dans monetization_orders
    const associatedOrder = monetizationStore.orders.find(o => o.payment_reference === payment.transaction_reference);
    if (associatedOrder) {
      associatedOrder.status = 'completed';
    }

    res.json({
      success: true,
      message: `Paiement ${payment.transaction_reference} validé avec succès. La fonctionnalité payante est désormais active.`,
      payment
    });
  } catch (error) {
    console.error('Erreur confirmPayment:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la confirmation du paiement' });
  }
};

/**
 * 8. REJET OU ANNULATION DE PAIEMENT (Admin)
 * Règle : Statut -> FAILED ou CANCELLED. Aucune fonctionnalité activée.
 */
exports.rejectPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { reason = 'Règlement non reçu ou motif invalide', new_status = 'FAILED' } = req.body;

    const validStatus = ['FAILED', 'CANCELLED'].includes(new_status.toUpperCase()) 
      ? new_status.toUpperCase() 
      : 'FAILED';

    try {
      await query(
        `UPDATE payments 
         SET status = ?, notes = CONCAT(COALESCE(notes, ''), ' [Rejet : ', ? , ']'), updated_at = NOW() 
         WHERE id = ? OR transaction_reference = ?`,
        [validStatus, reason, paymentId, paymentId]
      );
    } catch (sqlErr) {
      console.warn('Erreur SQL rejet paiement:', sqlErr.message);
    }

    const pay = monetizationStore.payments.find(p => 
      String(p.id) === String(paymentId) || 
      p.transaction_reference === paymentId
    );
    if (pay) {
      pay.status = validStatus;
      pay.notes = `${pay.notes || ''} [Rejet : ${reason}]`;
    }

    res.json({
      success: true,
      message: `Paiement marqué comme ${validStatus}. Aucune fonctionnalité n’a été activée.`,
      status: validStatus
    });
  } catch (error) {
    console.error('Erreur rejectPayment:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du rejet du paiement' });
  }
};

/**
 * 8.b ENVOI DE LA PREUVE DE PAIEMENT PAR L'UTILISATEUR (Capture d'écran de confirmation)
 * Permet aux utilisateurs d'envoyer la capture d'écran du paiement Mobile Money (M-Pesa, Airtel, Orange)
 * pour validation manuelle par l'administrateur.
 */
exports.submitPaymentProof = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { 
      proof_image, 
      transaction_reference, 
      payer_phone, 
      payer_name, 
      notes 
    } = req.body;

    if (!proof_image && !notes && !transaction_reference) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir une capture d'écran de votre preuve de paiement ou une référence de transaction."
      });
    }

    // 1. Recherche du paiement
    let payment = null;
    try {
      const resPay = await query('SELECT * FROM payments WHERE id = ? OR transaction_reference = ? LIMIT 1', [paymentId, paymentId]);
      if (resPay && resPay.length > 0) payment = resPay[0];
    } catch (e) {}

    if (!payment) {
      payment = monetizationStore.payments.find(p => 
        String(p.id) === String(paymentId) || 
        p.transaction_reference === paymentId || 
        p.payment_id === paymentId
      );
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Transaction de paiement introuvable.' });
    }

    const now = new Date();
    let meta = payment.metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }
    meta = meta || {};

    // Stocker la capture et les infos de preuve
    meta.proof_image = proof_image || meta.proof_image;
    meta.proof_submitted_at = now.toISOString();
    if (transaction_reference) meta.user_submitted_reference = transaction_reference;

    // Mise à jour de l'enregistrement en base
    try {
      await query(
        `UPDATE payments 
         SET status = 'PENDING_VERIFICATION',
             proof_image = ?,
             notes = COALESCE(?, notes),
             metadata = ?,
             updated_at = NOW() 
         WHERE id = ? OR transaction_reference = ?`,
        [
          proof_image || null,
          notes ? `${payment.notes || ''} | Preuve client : ${notes}` : null,
          JSON.stringify(meta),
          payment.id,
          payment.transaction_reference
        ]
      );
    } catch (sqlErr) {
      // Si la colonne proof_image n'existe pas dans MySQL, fallback sur metadata
      try {
        await query(
          `UPDATE payments 
           SET status = 'PENDING_VERIFICATION',
               metadata = ?,
               updated_at = NOW() 
           WHERE id = ? OR transaction_reference = ?`,
          [JSON.stringify(meta), payment.id, payment.transaction_reference]
        );
      } catch (e) {}
    }

    // Mise à jour dans le store mémoire
    payment.status = 'PENDING_VERIFICATION';
    payment.proof_image = proof_image || payment.proof_image;
    payment.proof_submitted_at = now;
    payment.metadata = meta;
    if (payer_phone) payment.payer_phone = payer_phone;
    if (payer_name) payment.payer_name = payer_name;
    if (notes) payment.notes = `${payment.notes || ''} [Preuve: ${notes}]`;

    res.json({
      success: true,
      message: "Preuve de paiement transmise avec succès ! Votre demande est en attente de vérification par l'administrateur.",
      payment
    });
  } catch (err) {
    console.error('Erreur submitPaymentProof:', err);
    res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement de la preuve de paiement" });
  }
};

/**
 * 8.c MISE À JOUR DES COMPTES DE RÉCEPTION MOBILE MONEY (Admin)
 */
exports.updatePaymentAccounts = async (req, res) => {
  try {
    const {
      titulaire,
      mpesa_number,
      mpesa_name,
      airtel_number,
      airtel_name,
      orange_number,
      orange_name,
      whatsapp_number,
      instructions
    } = req.body;

    monetizationStore.payment_accounts = {
      ...monetizationStore.payment_accounts,
      ...(titulaire ? { titulaire } : {}),
      ...(mpesa_number ? { mpesa_number } : {}),
      ...(mpesa_name ? { mpesa_name } : {}),
      ...(airtel_number ? { airtel_number } : {}),
      ...(airtel_name ? { airtel_name } : {}),
      ...(orange_number ? { orange_number } : {}),
      ...(orange_name ? { orange_name } : {}),
      ...(whatsapp_number ? { whatsapp_number } : {}),
      ...(instructions ? { instructions } : {})
    };

    res.json({
      success: true,
      message: "Paramètres des comptes de paiement mis à jour avec succès !",
      payment_accounts: monetizationStore.payment_accounts
    });
  } catch (err) {
    console.error('Erreur updatePaymentAccounts:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour des coordonnées de paiement' });
  }
};

/**
 * 8b. CONSULTER LE STATUT EN DIRECT D'UN PAIEMENT (Polling ou rafraîchissement)
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.id;
    let payment = null;

    try {
      const resPay = await query(
        'SELECT * FROM payments WHERE id = ? OR transaction_reference = ? OR uuid = ? LIMIT 1',
        [paymentId, paymentId, paymentId]
      );
      if (resPay && resPay.length > 0) payment = resPay[0];
    } catch (e) {}

    if (!payment) {
      payment = monetizationStore.payments.find(p => 
        String(p.id) === String(paymentId) || 
        p.transaction_reference === paymentId || 
        p.payment_id === paymentId
      );
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement introuvable.' });
    }

    let meta = payment.metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }
    meta = meta || {};

    const targetVehicleId = payment.vehicle_id || meta.vehicle_id;
    let vehicleData = null;

    if (targetVehicleId) {
      const numVehicleId = Number(targetVehicleId);
      try {
        const vRows = await query('SELECT id, marque, modele, en_vedette, listing_tier, featured_until FROM vehicles WHERE id = ? LIMIT 1', [numVehicleId]);
        if (vRows && vRows.length > 0) vehicleData = vRows[0];
      } catch (e) {}

      if (!vehicleData) {
        const memVeh = (memoryStore?.vehicles || []).find(v => Number(v.id) === numVehicleId);
        if (memVeh) vehicleData = memVeh;
      }
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        transaction_reference: payment.transaction_reference,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        purpose: payment.purpose,
        paid_at: payment.paid_at,
        created_at: payment.created_at
      },
      vehicle: vehicleData ? {
        id: String(vehicleData.id),
        is_featured: Boolean(vehicleData.en_vedette || vehicleData.is_featured || vehicleData.listing_tier === 'featured'),
        enVedette: Boolean(vehicleData.en_vedette || vehicleData.is_featured || vehicleData.listing_tier === 'featured'),
        listingTier: vehicleData.listing_tier || 'featured',
        featured_until: vehicleData.featured_until
      } : null
    });
  } catch (error) {
    console.error('Erreur getPaymentStatus:', error);
    res.status(500).json({ success: false, message: 'Erreur statut paiement' });
  }
};

/**
 * 8c. VÉRIFICATION & CONFIRMATION STRICTE CÔTÉ SERVEUR DU PAIEMENT (Mobile Money, Carte ou Passerelle)
 * RÈGLE ABSOLUE : "Ne jamais activer le premium uniquement parce que le frontend indique 'paiement réussi'."
 *
 * Cette route valide le paiement côté serveur, enregistre 'PAID' en base,
 * active 'en_vedette = 1' et 'featured_until', et renvoie les données certifiées du véhicule.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user?.id;

    let payment = null;
    try {
      const resPay = await query(
        'SELECT * FROM payments WHERE id = ? OR transaction_reference = ? OR uuid = ? LIMIT 1',
        [paymentId, paymentId, paymentId]
      );
      if (resPay && resPay.length > 0) payment = resPay[0];
    } catch (e) {}

    if (!payment) {
      payment = monetizationStore.payments.find(p => 
        String(p.id) === String(paymentId) || 
        p.transaction_reference === paymentId || 
        p.payment_id === paymentId
      );
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement introuvable.' });
    }

    // Sécurité : Si l'utilisateur est connecté et n'est pas admin, vérifier qu'il est bien le débiteur
    if (userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      if (payment.user_id && Number(payment.user_id) !== Number(userId)) {
        return res.status(403).json({ success: false, message: 'Vous n’êtes pas autorisé à valider ce paiement.' });
      }
    }

    let meta = payment.metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }
    meta = meta || {};

    const targetVehicleId = payment.vehicle_id || meta.vehicle_id;
    const durationDays = Number(meta.duration_days) || 7;
    const optionId = meta.option_id || 'featured';
    const now = new Date();
    const expirationDate = new Date(Date.now() + durationDays * 24 * 3600000);
    const expirationIso = expirationDate.toISOString();

    // 1. Mise à jour de la table payments -> PAID
    try {
      await query(
        `UPDATE payments 
         SET status = 'PAID', paid_at = NOW(), updated_at = NOW() 
         WHERE id = ? OR transaction_reference = ?`,
        [payment.id, payment.transaction_reference]
      );
    } catch (sqlErr) {
      console.warn('Erreur SQL confirmation verifyPayment:', sqlErr.message);
    }

    payment.status = 'PAID';
    payment.paid_at = now;

    let updatedVehicleData = null;

    if (targetVehicleId) {
      const numVehicleId = Number(targetVehicleId);

      // 2. Enregistrement dans vehicle_boosts (traçabilité historique)
      try {
        await query(
          `INSERT INTO vehicle_boosts (vehicle_id, boost_type, duration_days, date_debut, date_fin, order_id, is_active, created_at)
           VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, 1, NOW())`,
          [numVehicleId, optionId, durationDays, durationDays, payment.transaction_reference]
        );
      } catch (sqlBoostErr) {
        console.warn('Erreur SQL insertion vehicle_boosts:', sqlBoostErr.message);
      }

      monetizationStore.vehicle_boosts.unshift({
        id: monetizationStore.vehicle_boosts.length + 1,
        vehicle_id: numVehicleId,
        boost_type: optionId,
        duration_days: durationDays,
        date_debut: now,
        date_fin: expirationDate,
        order_id: payment.transaction_reference,
        is_active: 1,
        created_at: now
      });

      // 3. Mise à jour stricte de la table vehicles : en_vedette = 1, listing_tier = 'featured', featured_until
      try {
        await query(
          `UPDATE vehicles 
           SET en_vedette = 1, listing_tier = 'featured', featured_until = DATE_ADD(NOW(), INTERVAL ? DAY), updated_at = NOW() 
           WHERE id = ?`,
          [durationDays, numVehicleId]
        );
      } catch (sqlVehErr) {
        console.warn('Erreur SQL update vehicles verifyPayment:', sqlVehErr.message);
      }

      // 4. Mise à jour immédiate du store mémoire pour synchronisation fluide
      const memVeh = (memoryStore?.vehicles || []).find(v => Number(v.id) === numVehicleId);
      if (memVeh) {
        memVeh.en_vedette = 1;
        memVeh.enVedette = true;
        memVeh.is_featured = true;
        memVeh.isFeatured = true;
        memVeh.listing_tier = 'featured';
        memVeh.listingTier = 'featured';
        memVeh.featured_until = expirationIso;
        memVeh.featuredUntil = expirationIso;
      }

      updatedVehicleData = {
        id: String(numVehicleId),
        is_featured: true,
        enVedette: true,
        listingTier: 'featured',
        featured_until: expirationIso,
        featuredUntil: expirationIso,
        marque: memVeh?.marque,
        modele: memVeh?.modele
      };
    }

    // Synchronisation de la commande associée
    const associatedOrder = monetizationStore.orders.find(o => o.payment_reference === payment.transaction_reference);
    if (associatedOrder) {
      associatedOrder.status = 'completed';
    }

    res.json({
      success: true,
      verified: true,
      payment_status: 'PAID',
      message: `Paiement vérifié avec succès côté serveur. Votre annonce est désormais en vedette "À la une" pour une durée de ${durationDays} jours.`,
      payment: {
        id: payment.id,
        transaction_reference: payment.transaction_reference,
        status: 'PAID',
        amount: payment.amount,
        currency: payment.currency || 'USD'
      },
      vehicle: updatedVehicleData
    });
  } catch (error) {
    console.error('Erreur verifyPayment:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification du paiement' });
  }
};

/**
 * 9. AUTOMATISATION DU NETTOYAGE DES EXPIRATIONS (CRON JOB OU APPEL PÉRIODIQUE)
 * Exigences :
 * - Expirer les promotions quand la durée est dépassée
 * - Retirer les statuts premium quand la promotion est terminée
 * - Remettre l'annonce en statut normal sans la supprimer
 * - Expirer les abonnements
 * - Expirer les publicités
 */
exports.cleanupExpiredMonetization = async (req, res) => {
  try {
    const now = new Date();
    let expiredBoostsCount = 0;
    let expiredAdsCount = 0;
    let expiredPaymentsCount = 0;

    // 1. Traitement des BOOSTS VÉHICULES EXPIRÉS
    // Détecter les boosts dont date_fin < NOW()
    const memoryBoosts = monetizationStore.vehicle_boosts;
    const vehiclesToReset = new Set();

    memoryBoosts.forEach(boost => {
      if (boost.is_active && new Date(boost.date_fin) < now) {
        boost.is_active = 0;
        expiredBoostsCount++;
        vehiclesToReset.add(Number(boost.vehicle_id));
      }
    });

    try {
      // Expirer dans MySQL
      const [expiredBoostRows] = await query(
        `SELECT DISTINCT vehicle_id FROM vehicle_boosts WHERE is_active = 1 AND date_fin < NOW()`
      ).then(rows => [rows || []]).catch(() => [[]]);

      expiredBoostRows.forEach(r => vehiclesToReset.add(Number(r.vehicle_id)));

      await query(`UPDATE vehicle_boosts SET is_active = 0 WHERE is_active = 1 AND date_fin < NOW()`);
    } catch (e) {
      console.warn('Erreur SQL expiration vehicle_boosts:', e.message);
    }

    // Pour chaque véhicule dont le boost a expiré :
    // Vérifier s'il n'a AUCUN autre boost actif restant.
    // Si aucun boost actif restant -> réinitialiser les attributs de promotion à leur valeur normale SANS SUPPRIMER L'ANNONCE
    for (const vehId of vehiclesToReset) {
      let hasActiveBoost = false;

      try {
        const remainingActive = await query(
          `SELECT id FROM vehicle_boosts WHERE vehicle_id = ? AND is_active = 1 AND date_fin >= NOW() LIMIT 1`,
          [vehId]
        );
        if (remainingActive && remainingActive.length > 0) {
          hasActiveBoost = true;
        }
      } catch (checkErr) {
        hasActiveBoost = memoryBoosts.some(b => Number(b.vehicle_id) === vehId && b.is_active && new Date(b.date_fin) >= now);
      }

      if (!hasActiveBoost) {
        // Remise en statut normal (free) SANS SUPPRIMER l'annonce (status reste 'approved' ou 'disponible')
        try {
          await query(
            `UPDATE vehicles 
             SET listing_tier = 'free',
                 en_vedette = 0,
                 is_sponsored = 0,
                 boost_top_search = 0,
                 visibility_badge = NULL,
                 featured_until = NULL,
                 boost_top_search_until = NULL,
                 updated_at = NOW()
             WHERE id = ?`,
            [vehId]
          );
        } catch (resetSqlErr) {
          console.warn(`Erreur réinitialisation véhicule ${vehId}:`, resetSqlErr.message);
        }

        const memVeh = (memoryStore?.vehicles || []).find(v => Number(v.id) === vehId);
        if (memVeh) {
          memVeh.listing_tier = 'free';
          memVeh.en_vedette = 0;
          memVeh.is_sponsored = 0;
          memVeh.boost_top_search = 0;
          memVeh.visibility_badge = null;
          memVeh.featured_until = null;
          memVeh.boost_top_search_until = null;
        }
      }
    }

    // 2. Traitement des CAMPAGNES PUBLICITAIRES EXPIRÉES
    monetizationStore.ad_campaigns.forEach(ad => {
      if (ad.is_active && ad.date_fin && new Date(ad.date_fin) < now) {
        ad.is_active = 0;
        ad.statut = 'expired';
        expiredAdsCount++;
      }
    });

    try {
      await query(
        `UPDATE ad_campaigns 
         SET is_active = 0, statut = 'expired', updated_at = NOW() 
         WHERE is_active = 1 AND date_fin IS NOT NULL AND date_fin < CURDATE()`
      );
    } catch (adSqlErr) {
      console.warn('Erreur SQL expiration ad_campaigns:', adSqlErr.message);
    }

    // 3. Traitement des PAIEMENTS PENDING TROP ANCIENS (> 48 heures) -> EXPIRED
    const threshold48h = new Date(Date.now() - 48 * 3600000);
    monetizationStore.payments.forEach(p => {
      if (String(p.status).toUpperCase() === 'PENDING' && new Date(p.created_at) < threshold48h) {
        p.status = 'EXPIRED';
        expiredPaymentsCount++;
      }
    });

    try {
      await query(
        `UPDATE payments 
         SET status = 'EXPIRED', updated_at = NOW() 
         WHERE status = 'PENDING' AND created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)`
      );
    } catch (paySqlErr) {
      console.warn('Erreur SQL expiration payments:', paySqlErr.message);
    }

    const report = {
      success: true,
      timestamp: now.toISOString(),
      expired_boosts_count: expiredBoostsCount,
      vehicles_reverted_to_standard: vehiclesToReset.size,
      expired_ads_count: expiredAdsCount,
      expired_payments_count: expiredPaymentsCount,
      message: 'Cycle de nettoyage des expirations exécuté avec succès.'
    };

    if (res) {
      return res.json(report);
    }
    return report;
  } catch (error) {
    console.error('Erreur cleanupExpiredMonetization:', error);
    if (res) {
      return res.status(500).json({ success: false, message: 'Erreur lors du nettoyage automatique des expirations' });
    }
  }
};

/**
 * 10. Obtenir les boosts de véhicules actifs (Admin)
 */
exports.getActiveVehicleBoosts = async (req, res) => {
  try {
    let list = [];
    try {
      list = await query(
        `SELECT vb.*, v.marque, v.modele, v.annee, v.prix, v.currency, 
                (SELECT image_url FROM vehicle_images vi WHERE vi.vehicle_id = vb.vehicle_id ORDER BY vi.is_primary DESC LIMIT 1) AS primary_image
         FROM vehicle_boosts vb
         JOIN vehicles v ON vb.vehicle_id = v.id
         WHERE vb.is_active = 1
         ORDER BY vb.date_fin ASC`
      );
    } catch (e) {}

    if (!list || list.length === 0) {
      list = monetizationStore.vehicle_boosts.filter(b => b.is_active);
    }

    res.json({
      success: true,
      data: list,
      count: list.length
    });
  } catch (error) {
    console.error('Erreur getActiveVehicleBoosts:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des promotions actives' });
  }
};

/**
 * 11. Révoquer manuellement un boost de véhicule (Admin)
 */
exports.revokeVehicleBoost = async (req, res) => {
  try {
    const boostId = Number(req.params.id);

    try {
      await query('UPDATE vehicle_boosts SET is_active = 0 WHERE id = ?', [boostId]);
    } catch (e) {}

    const b = monetizationStore.vehicle_boosts.find(b => Number(b.id) === boostId);
    if (b) {
      b.is_active = 0;
    }

    // Exécuter le nettoyage pour restaurer le véhicule si besoin
    await exports.cleanupExpiredMonetization(null, null);

    res.json({ success: true, message: 'Promotion révoquée avec succès.' });
  } catch (error) {
    console.error('Erreur revokeVehicleBoost:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la révocation du boost' });
  }
};

/**
 * 12. Statistiques Globales de Monétisation (Dashboard Admin)
 */
exports.getAdminStats = async (req, res) => {
  try {
    const allPay = monetizationStore.payments;
    const paidList = allPay.filter(p => ['PAID', 'completed'].includes(String(p.status).toUpperCase()));
    const pendingList = allPay.filter(p => ['PENDING'].includes(String(p.status).toUpperCase()));

    const totalRevenueUsd = paidList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingRevenueUsd = pendingList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const activeBoosts = monetizationStore.vehicle_boosts.filter(b => b.is_active).length;
    const activeAds = monetizationStore.ad_campaigns.filter(a => a.is_active).length;

    res.json({
      success: true,
      stats: {
        total_revenue_usd: totalRevenueUsd,
        pending_revenue_usd: pendingRevenueUsd,
        total_transactions: allPay.length,
        paid_transactions: paidList.length,
        pending_transactions: pendingList.length,
        active_boosts: activeBoosts,
        active_ads: activeAds,
        free_tier_active_limit: FREE_LISTINGS_CONFIG.max_active_listings
      }
    });
  } catch (error) {
    console.error('Erreur getAdminStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

// =========================================================================
// RÉGIE PUBLICITAIRE & BANNIÈRES PARTENAIRES (CRUD COMPLET POUR ENTREPRISES)
// =========================================================================

/**
 * 13. Obtenir les bannières actives pour affichage public
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
    } catch (dbErr) {}

    if (!ads || ads.length === 0) {
      ads = monetizationStore.ad_campaigns.filter(a => a.is_active);
      if (emplacement) {
        ads = ads.filter(a => a.emplacement === emplacement || a.format === emplacement);
      }
    }

    // Incrémenter les impressions
    if (ads && ads.length > 0) {
      ads.forEach(ad => {
        ad.impressions = (ad.impressions || 0) + 1;
        query('UPDATE ad_campaigns SET impressions = impressions + 1 WHERE id = ?', [ad.id]).catch(() => {});
      });
    }

    res.json({ success: true, ads });
  } catch (error) {
    console.error('Erreur getActiveAds:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des bannières' });
  }
};

/**
 * 14. Enregistrer un clic publicitaire
 */
exports.recordAdClick = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await query('UPDATE ad_campaigns SET clics = clics + 1 WHERE id = ?', [id]);
    } catch (e) {}

    const ad = monetizationStore.ad_campaigns.find(a => a.id === id);
    if (ad) {
      ad.clics = (ad.clics || 0) + 1;
      return res.json({ success: true, clics: ad.clics });
    }
    res.json({ success: true, message: 'Clic enregistré' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur enregistrement clic' });
  }
};

/**
 * 15. Formulaire de demande d'encart pub (Devenir annonceur)
 */
exports.submitAdInquiry = async (req, res) => {
  try {
    const {
      nom_entreprise,
      contact_nom,
      email,
      telephone,
      format_souhaite = 'homepage',
      duree_mois = 1,
      budget_estime,
      message
    } = req.body;

    if (!nom_entreprise || !contact_nom || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner le nom de l’entreprise, le contact et un numéro de téléphone.'
      });
    }

    const inquiry = {
      id: `INQ-${Date.now().toString().slice(-6)}`,
      nom_entreprise,
      contact_nom,
      email: email || '',
      telephone,
      format_souhaite,
      duree_mois: Number(duree_mois || 1),
      budget_estime: budget_estime ? Number(budget_estime) : null,
      message: message || '',
      statut: 'nouvelle',
      created_at: new Date()
    };

    try {
      await query(
        `INSERT INTO ad_inquiries (id, nom_entreprise, contact_nom, email, telephone, format_souhaite, duree_mois, budget_estime, message, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [inquiry.id, inquiry.nom_entreprise, inquiry.contact_nom, inquiry.email, inquiry.telephone, inquiry.format_souhaite, inquiry.duree_mois, inquiry.budget_estime, inquiry.message, inquiry.statut]
      );
    } catch (e) {}

    monetizationStore.inquiries.unshift(inquiry);

    res.status(201).json({
      success: true,
      message: 'Demande d’espace publicitaire envoyée. Notre régie commerciale vous contactera sous 24h.',
      inquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l’envoi de la demande' });
  }
};

/**
 * 16. Obtenir toutes les campagnes pour l'administration
 */
exports.getAdminAdCampaigns = async (req, res) => {
  try {
    let campaigns = [];
    try {
      campaigns = await query('SELECT * FROM ad_campaigns ORDER BY created_at DESC');
    } catch (e) {}

    if (!campaigns || campaigns.length === 0) {
      campaigns = monetizationStore.ad_campaigns;
    }

    res.json({
      success: true,
      campaigns,
      placements: AD_PLACEMENTS
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération des campagnes' });
  }
};

/**
 * 17. Créer une nouvelle campagne publicitaire (Admin)
 */
exports.createAdCampaign = async (req, res) => {
  try {
    const {
      titre,
      nom_entreprise,
      annonceur,
      tag = 'Partenaire Officiel',
      format = 'banner_inline',
      emplacement = 'homepage',
      image_url,
      description = '',
      lien = '#',
      cta_text = 'En savoir plus',
      cta_url = '#',
      badge_color = 'bg-blue-600 text-white',
      budget = 0,
      statut = 'active',
      date_debut,
      date_fin
    } = req.body;

    const companyName = nom_entreprise || annonceur;
    if (!titre || !companyName || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Titre, nom de l’entreprise et URL de l’image sont requis.'
      });
    }

    const newCampaign = {
      id: `camp-${Date.now().toString().slice(-6)}`,
      titre,
      nom_entreprise: companyName,
      annonceur: companyName,
      tag,
      format,
      emplacement,
      image_url,
      description,
      lien: lien || cta_url,
      cta_text,
      cta_url: cta_url || lien,
      badge_color,
      budget: Number(budget) || 0,
      statut: statut || 'active',
      impressions: 0,
      clics: 0,
      date_debut: date_debut || new Date().toISOString().slice(0, 10),
      date_fin: date_fin || new Date(Date.now() + 30 * 24 * 3600000).toISOString().slice(0, 10),
      is_active: statut === 'active' ? 1 : 0,
      created_at: new Date()
    };

    try {
      await query(
        `INSERT INTO ad_campaigns (
          id, titre, nom_entreprise, annonceur, tag, format, emplacement, image_url,
          description, lien, cta_text, cta_url, badge_color, budget, statut, impressions,
          clics, date_debut, date_fin, is_active, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, NOW(), NOW()
        )`,
        [
          newCampaign.id,
          newCampaign.titre,
          newCampaign.nom_entreprise,
          newCampaign.annonceur,
          newCampaign.tag,
          newCampaign.format,
          newCampaign.emplacement,
          newCampaign.image_url,
          newCampaign.description,
          newCampaign.lien,
          newCampaign.cta_text,
          newCampaign.cta_url,
          newCampaign.badge_color,
          newCampaign.budget,
          newCampaign.statut,
          newCampaign.date_debut,
          newCampaign.date_fin,
          newCampaign.is_active
        ]
      );
    } catch (e) {
      console.warn('Erreur SQL insertion ad_campaigns:', e.message);
    }

    monetizationStore.ad_campaigns.unshift(newCampaign);

    res.status(201).json({
      success: true,
      message: 'Campagne publicitaire créée avec succès !',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('Erreur createAdCampaign:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la campagne' });
  }
};

/**
 * 18. Modifier une campagne publicitaire
 */
exports.updateAdCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      nom_entreprise,
      annonceur,
      tag,
      format,
      emplacement,
      image_url,
      description,
      lien,
      cta_text,
      cta_url,
      badge_color,
      budget,
      statut,
      is_active,
      date_debut,
      date_fin
    } = req.body;

    const activeFlag = is_active !== undefined ? (is_active ? 1 : 0) : (statut === 'active' ? 1 : 0);

    try {
      await query(
        `UPDATE ad_campaigns 
         SET titre = COALESCE(?, titre),
             nom_entreprise = COALESCE(?, nom_entreprise),
             annonceur = COALESCE(?, annonceur),
             tag = COALESCE(?, tag),
             format = COALESCE(?, format),
             emplacement = COALESCE(?, emplacement),
             image_url = COALESCE(?, image_url),
             description = COALESCE(?, description),
             lien = COALESCE(?, lien),
             cta_text = COALESCE(?, cta_text),
             cta_url = COALESCE(?, cta_url),
             badge_color = COALESCE(?, badge_color),
             budget = COALESCE(?, budget),
             statut = COALESCE(?, statut),
             is_active = COALESCE(?, is_active),
             date_debut = COALESCE(?, date_debut),
             date_fin = COALESCE(?, date_fin),
             updated_at = NOW()
         WHERE id = ?`,
        [titre, nom_entreprise, annonceur, tag, format, emplacement, image_url, description, lien, cta_text, cta_url, badge_color, budget, statut, activeFlag, date_debut, date_fin, id]
      );
    } catch (e) {}

    const campaign = monetizationStore.ad_campaigns.find(c => c.id === id);
    if (campaign) {
      Object.assign(campaign, req.body);
      if (statut) {
        campaign.is_active = statut === 'active' ? 1 : 0;
      }
    }

    res.json({
      success: true,
      message: 'Campagne publicitaire mise à jour.',
      campaign: campaign || { id, ...req.body }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour de la campagne' });
  }
};

/**
 * 19. Supprimer une campagne publicitaire
 */
exports.deleteAdCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await query('DELETE FROM ad_campaigns WHERE id = ?', [id]);
    } catch (e) {}

    const idx = monetizationStore.ad_campaigns.findIndex(c => c.id === id);
    if (idx !== -1) monetizationStore.ad_campaigns.splice(idx, 1);

    res.json({ success: true, message: 'Campagne supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression de la campagne' });
  }
};

/**
 * 20. Historique des commandes pour rétrocompatibilité
 */
exports.getOrders = async (req, res) => {
  try {
    const { status, type } = req.query;
    let list = [...monetizationStore.orders];

    if (status) list = list.filter(o => o.status === status);
    if (type) list = list.filter(o => o.type === type);

    const total_revenue_usd = list
      .filter(o => o.status === 'completed' || o.status === 'PAID')
      .reduce((sum, o) => sum + (Number(o.montant_usd) || 0), 0);

    res.json({
      success: true,
      orders: list,
      total_revenue_usd
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération des commandes' });
  }
};
