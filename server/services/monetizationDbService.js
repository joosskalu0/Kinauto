/**
 * 🚗 AUTOKIN - SERVICE NODE.JS DE GESTION DE LA MONÉTISATION MYSQL
 * Fonctions asynchrones Node.js utilisant le pool MySQL ('mysql2/promise')
 */

const { query, pool } = require('../config/database');

/**
 * 1. Obtenir le nombre d'annonces actives d'un utilisateur et vérifier son quota
 */
async function checkUserListingQuota(userId) {
  // 1. Récupérer l'abonnement actif éventuel de l'utilisateur
  const subQuery = `
    SELECT us.id, us.status, us.ends_at, sp.max_active_listings, sp.name AS plan_name, sp.badge_verified
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ? 
      AND us.status = 'active' 
      AND us.ends_at > NOW()
    ORDER BY sp.max_active_listings DESC
    LIMIT 1
  `;
  const subs = await query(subQuery, [userId]);
  
  let maxAllowed = 3; // 3 annonces gratuites par défaut pour particulier
  let planName = 'Particulier (Gratuit)';
  let isPro = false;

  if (subs && subs.length > 0) {
    maxAllowed = subs[0].max_active_listings;
    planName = subs[0].plan_name;
    isPro = true;
  }

  // 2. Compter les véhicules actifs en base
  const countQuery = `
    SELECT COUNT(*) AS total_active
    FROM vehicles
    WHERE user_id = ? 
      AND deleted_at IS NULL 
      AND status IN ('disponible', 'en_attente', 'approved')
  `;
  const countRes = await query(countQuery, [userId]);
  const activeCount = countRes && countRes.length > 0 ? Number(countRes[0].total_active) : 0;

  return {
    user_id: userId,
    active_count: activeCount,
    max_allowed: maxAllowed,
    remaining: Math.max(0, maxAllowed - activeCount),
    can_publish: activeCount < maxAllowed,
    is_pro: isPro,
    plan_name: planName
  };
}

/**
 * 2. Créer une intention de mise en avant (Promotion véhicule)
 */
async function createPromotion({ vehicleId, userId, promotionType, durationDays, pricePaid, currency = 'USD' }) {
  const promoUuid = `prm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const sql = `
    INSERT INTO promotions (
      uuid, vehicle_id, user_id, promotion_type, duration_days,
      starts_at, ends_at, status, price_paid, currency, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'pending', ?, ?, NOW(), NOW()
    )
  `;
  const res = await query(sql, [
    promoUuid, vehicleId, userId, promotionType, durationDays,
    durationDays, pricePaid, currency
  ]);

  return {
    id: res.insertId,
    uuid: promoUuid,
    vehicle_id: vehicleId,
    user_id: userId,
    promotion_type: promotionType,
    duration_days: durationDays,
    status: 'pending',
    price_paid: pricePaid,
    currency
  };
}

/**
 * 3. Enregistrer une transaction de paiement (Mobile Money ou Carte)
 */
async function recordPayment({
  userId,
  purpose,
  amount,
  currency = 'USD',
  exchangeRate = 2850.00,
  paymentMethod,
  gateway = 'maxicash',
  payerPhone,
  payerName,
  payerEmail,
  subscriptionId = null,
  promotionId = null,
  vehicleId = null,
  advertisementId = null,
  notes = null,
  metadata = null
}) {
  const payUuid = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const txRef = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const sql = `
    INSERT INTO payments (
      uuid, transaction_reference, user_id, subscription_id, promotion_id,
      vehicle_id, advertisement_id, purpose, amount, currency, exchange_rate,
      payment_method, gateway, payer_phone, payer_name, payer_email,
      status, notes, metadata, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      'pending', ?, ?, NOW(), NOW()
    )
  `;

  const metaString = metadata ? JSON.stringify(metadata) : null;

  const res = await query(sql, [
    payUuid, txRef, userId, subscriptionId, promotionId,
    vehicleId, advertisementId, purpose, amount, currency, exchangeRate,
    paymentMethod, gateway, payerPhone, payerName, payerEmail,
    notes, metaString
  ]);

  return {
    id: res.insertId,
    uuid: payUuid,
    transaction_reference: txRef,
    amount,
    currency,
    status: 'pending',
    payment_method: paymentMethod
  };
}

/**
 * 4. Valider un paiement et activer le service associé (Promotion, Abonnement, Pub)
 */
async function confirmPaymentAndActivate(paymentReferenceOrId) {
  // 1. Récupérer le paiement
  const getPaySql = `
    SELECT * FROM payments 
    WHERE id = ? OR transaction_reference = ? 
    LIMIT 1
  `;
  const rows = await query(getPaySql, [paymentReferenceOrId, paymentReferenceOrId]);
  if (!rows || rows.length === 0) {
    throw new Error('Paiement introuvable');
  }

  const payment = rows[0];
  if (['paid', 'completed'].includes(String(payment.status).toLowerCase())) {
    return { already_paid: true, payment };
  }

  // 2. Marquer le paiement comme complété
  await query(
    `UPDATE payments SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = ?`,
    [payment.id]
  );

  // 3. Activer la promotion si liée
  if (payment.promotion_id) {
    const [promo] = await query('SELECT * FROM promotions WHERE id = ?', [payment.promotion_id]);
    if (promo) {
      await query(
        `UPDATE promotions SET status = 'active', starts_at = NOW(), ends_at = DATE_ADD(NOW(), INTERVAL ? DAY), updated_at = NOW() WHERE id = ?`,
        [promo.duration_days, promo.id]
      );

      // Mettre à jour le véhicule
      if (promo.promotion_type === 'featured') {
        await query(
          `UPDATE vehicles SET en_vedette = 1, listing_tier = 'featured', featured_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?`,
          [promo.duration_days, promo.vehicle_id]
        );
      } else if (promo.promotion_type === 'sponsored') {
        await query(
          `UPDATE vehicles SET is_sponsored = 1, listing_tier = 'featured' WHERE id = ?`,
          [promo.vehicle_id]
        );
      } else if (promo.promotion_type === 'badge_premium') {
        await query(
          `UPDATE vehicles SET listing_tier = 'premium' WHERE id = ?`,
          [promo.vehicle_id]
        );
      } else if (promo.promotion_type === 'bump') {
        await query(
          `UPDATE vehicles SET created_at = NOW() WHERE id = ?`,
          [promo.vehicle_id]
        );
      }
    }
  }

  // 4. Activer l'abonnement si lié
  if (payment.subscription_id) {
    await query(
      `UPDATE user_subscriptions SET status = 'active', starts_at = NOW(), ends_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?`,
      [payment.subscription_id]
    );
  }

  return { success: true, payment_id: payment.id, status: 'paid' };
}

/**
 * 5. Récupérer les publicités actives pour l'affichage public
 */
async function getActiveAdvertisements(placement = null) {
  let sql = `
    SELECT * FROM advertisements 
    WHERE is_active = 1 
      AND status = 'active' 
      AND starts_at <= CURDATE() 
      AND ends_at >= CURDATE()
  `;
  const params = [];

  if (placement) {
    sql += ' AND placement = ?';
    params.push(placement);
  }

  sql += ' ORDER BY RAND() LIMIT 5';
  return await query(sql, params);
}

module.exports = {
  checkUserListingQuota,
  createPromotion,
  recordPayment,
  confirmPaymentAndActivate,
  getActiveAdvertisements
};
