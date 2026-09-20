import React, { useState, useEffect } from 'react';
import { 
  X, Rocket, Check, AlertCircle, Clock, ShieldCheck, CreditCard, 
  Smartphone, CheckCircle2, ChevronRight, Lock, ArrowLeft, RefreshCw, 
  Calendar, Sparkles, Star, Award, Zap, AlertTriangle
} from 'lucide-react';
import { Vehicle } from '../../types';
import { monetizationApi } from '../../services/api';

export interface PromoteVehicleModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  isLoggedIn: boolean;
  currentUser: any;
  currentAccountId?: string;
  onOpenAuth: () => void;
  onPromotionSuccess: (updatedVehicle: Vehicle) => void;
  currency?: 'USD' | 'FC';
  usdToFcRate?: number;
}

interface DurationTier {
  jours: number;
  prix_usd: number;
  prix_fc: number;
  popular?: boolean;
  economie?: string;
}

const DEFAULT_TIERS: DurationTier[] = [
  { jours: 3, prix_usd: 9, prix_fc: 25650, economie: 'Idéal vente rapide' },
  { jours: 7, prix_usd: 19, prix_fc: 54150, popular: true, economie: 'Le plus populaire' },
  { jours: 15, prix_usd: 35, prix_fc: 99750, economie: 'Économisez 15%' },
  { jours: 30, prix_usd: 59, prix_fc: 168150, economie: 'Visibilité maximale (Éco 30%)' },
];

export const PromoteVehicleModal: React.FC<PromoteVehicleModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  isLoggedIn,
  currentUser,
  currentAccountId,
  onOpenAuth,
  onPromotionSuccess,
  currency = 'USD',
  usdToFcRate = 2850
}) => {
  if (!isOpen) return null;

  // STEP 1: Vérification de connexion
  // STEP 2: Vérification de propriété
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const isVehicleOwner = 
    isAdmin ||
    (currentUser?.id && vehicle.userId && String(currentUser.id) === String(vehicle.userId)) ||
    (vehicle.dealershipId && (
      String(vehicle.dealershipId) === String(currentUser?.dealershipId) ||
      String(vehicle.dealershipId) === String(currentAccountId)
    )) ||
    (currentUser?.id && (vehicle as any).vendeurId && String(currentUser.id) === String((vehicle as any).vendeurId));

  // STEP 3 & 4: Options et tarifs provenant du backend
  const [durationTiers, setDurationTiers] = useState<DurationTier[]>(DEFAULT_TIERS);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Formulaire & Commande
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel' | 'orange' | 'card'>('mpesa');
  const [payerPhone, setPayerPhone] = useState<string>(currentUser?.telephone || '+243 ');
  const [payerName, setPayerName] = useState<string>(currentUser?.nom_complet || currentUser?.nom || '');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  // STEP 5 & 6: Attente confirmation paiement
  const [activePayment, setActivePayment] = useState<any | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string>('');

  // STEP 7: Succès après confirmation serveur
  const [promotionConfirmed, setPromotionConfirmed] = useState<boolean>(false);
  const [confirmedVehicle, setConfirmedVehicle] = useState<Vehicle | null>(null);

  // 1. Récupération des prix stricts provenant du backend
  useEffect(() => {
    let isMounted = true;
    const fetchBackendPricing = async () => {
      setLoadingConfig(true);
      try {
        const res = await monetizationApi.getConfig();
        if (isMounted && res.success && res.data?.promotion_options?.featured?.durees) {
          const backendTiers: DurationTier[] = res.data.promotion_options.featured.durees.map((d: any) => ({
            jours: d.jours,
            prix_usd: d.prix_usd,
            prix_fc: d.prix_fc || d.prix_usd * usdToFcRate,
            popular: d.jours === 7,
            economie: d.economie || (d.jours === 7 ? 'Le plus choisi' : d.jours === 30 ? 'Meilleur rapport' : undefined)
          }));
          setDurationTiers(backendTiers);
        }
      } catch (err) {
        console.warn('Utilisation grille tarifaire standard:', err);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    };

    fetchBackendPricing();
    return () => { isMounted = false; };
  }, [usdToFcRate]);

  // Polling automatique du statut pendant l'attente
  useEffect(() => {
    if (!activePayment || promotionConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await monetizationApi.getPaymentStatus(activePayment.transaction_reference);
        if (statusRes.success && statusRes.payment?.status?.toUpperCase() === 'PAID') {
          // Serveur a confirmé le paiement !
          handleServerConfirmed(statusRes.vehicle, statusRes.payment);
        }
      } catch (e) {
        // Polling silencieux
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activePayment, promotionConfirmed]);

  const selectedTier = durationTiers.find(t => t.jours === selectedDuration) || durationTiers[1];

  const formatPrice = (usd: number, cdf?: number) => {
    if (currency === 'FC' && cdf) {
      return `${cdf.toLocaleString('fr-FR')} CDF`;
    }
    return `$${usd} USD`;
  };

  // STEP 5: Créer une commande de paiement côté serveur
  const handleCreatePaymentOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setIsSubmittingOrder(true);

    try {
      const response = await monetizationApi.promoteVehicle({
        vehicle_id: vehicle.id,
        option_id: 'featured',
        duration_days: selectedDuration,
        payment_method: paymentMethod,
        payer_phone: payerPhone,
        payer_name: payerName
      });

      if (!response.success || !response.payment) {
        throw new Error(response.message || 'Impossible d’initialiser la commande de paiement.');
      }

      // La commande est enregistrée avec statut 'PENDING'
      setActivePayment(response.payment);
      setPaymentInstructions(response.instructions || `Effectuez le règlement de ${formatPrice(response.payment.amount, response.payment.amount_fc)} via ${paymentMethod.toUpperCase()} avec la référence ${response.payment.transaction_reference}.`);
    } catch (err: any) {
      setOrderError(err.message || 'Erreur lors de la création de la commande de paiement.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // STEP 6 & 7: Vérification & validation STRICTE côté serveur
  // Règle : Ne jamais activer le premium uniquement parce que le frontend indique "paiement réussi"
  const handleTriggerServerVerification = async () => {
    if (!activePayment) return;
    setIsVerifying(true);
    setVerifyError('');

    try {
      const verifyRes = await monetizationApi.verifyPayment(activePayment.transaction_reference, {
        phone: payerPhone
      });

      if (verifyRes.success && verifyRes.verified && verifyRes.payment_status === 'PAID') {
        // Le serveur a formellement validé et renvoyé les champs du véhicule
        handleServerConfirmed(verifyRes.vehicle, verifyRes.payment);
      } else {
        setVerifyError(verifyRes.message || 'Le paiement n’a pas encore été reçu ou confirmé par l’opérateur.');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Erreur lors de la vérification du paiement auprès du serveur.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleServerConfirmed = (serverVehicle: any, paymentData: any) => {
    const updated: Vehicle = {
      ...vehicle,
      is_featured: true,
      isFeatured: true,
      enVedette: true,
      listingTier: 'featured',
      featured_until: serverVehicle?.featured_until || serverVehicle?.featuredUntil || new Date(Date.now() + selectedDuration * 86400000).toISOString(),
      featuredUntil: serverVehicle?.featured_until || serverVehicle?.featuredUntil || new Date(Date.now() + selectedDuration * 86400000).toISOString()
    };

    setConfirmedVehicle(updated);
    setPromotionConfirmed(true);
    onPromotionSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-xs">
              <Rocket className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Mettre à la une sur AutoKin</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Top Visibilité
                </span>
              </h2>
              <p className="text-xs text-blue-200 truncate max-w-md">
                {vehicle.marque} {vehicle.modele} ({vehicle.annee}) • {vehicle.prix.toLocaleString('fr-FR')} $
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* CAS 1: UTILISATEUR NON CONNECTÉ */}
          {!isLoggedIn && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Connexion Requise
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Vous devez être connecté à votre compte AutoKin pour promouvoir cette annonce et gérer sa visibilité.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Se connecter ou créer un compte</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* CAS 2: CONNECTÉ MAIS ANNONCE N'APPARTIENT PAS À L'UTILISATEUR */}
          {isLoggedIn && !isVehicleOwner && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Propriété non Vérifiée
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Cette annonce ne vous appartient pas. Seul le propriétaire certifié du véhicule ou la concession associée peut activer la mise à la une.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-1 text-slate-600">
                <p><strong>Compte actif :</strong> {currentUser?.nom_complet || currentUser?.nom || currentUser?.email}</p>
                <p><strong>Concession associée :</strong> {vehicle.dealershipId || 'Particulier'}</p>
                <p className="text-slate-500 text-[11px] pt-1">
                  Si vous êtes le gérant ou concessionnaire de ce véhicule, assurez-vous d’être connecté avec le compte concessionnaire approprié.
                </p>
              </div>

              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
              >
                Compris, fermer
              </button>
            </div>
          )}

          {/* CAS 3: PROMOTION CONFIRMÉE AVEC SUCCÈS PAR LE SERVEUR */}
          {isLoggedIn && isVehicleOwner && promotionConfirmed && (
            <div className="py-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Paiement Confirmé & Validé
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Félicitations ! Votre annonce est À la Une
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Le véhicule <strong>{vehicle.marque} {vehicle.modele}</strong> bénéficie maintenant de la priorité maximale sur AutoKin jusqu'au{' '}
                  <span className="text-blue-700 font-black">
                    {new Date(confirmedVehicle?.featured_until || Date.now()).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>.
                </p>
              </div>

              {/* Badges acquis */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold max-w-lg mx-auto">
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-center">
                  <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span>Badge À la une</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-center">
                  <Rocket className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span>Position n°1</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-center">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span>+350% de vues</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span>Statut vérifié</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-8 py-3 rounded-xl transition shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Voir mon annonce dans "À la une"</span>
                </button>
              </div>
            </div>
          )}

          {/* CAS 4: EN ATTENTE DE CONFIRMATION DE PAIEMENT (STEP 6) */}
          {isLoggedIn && isVehicleOwner && !promotionConfirmed && activePayment && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center animate-spin">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-950">
                      En attente de confirmation du paiement...
                    </h4>
                    <p className="text-xs text-amber-800">
                      Commande créée avec succès. La mise à la une s'activera dès validation du règlement côté serveur.
                    </p>
                  </div>
                </div>

                {/* Recap Commande */}
                <div className="bg-white/80 border border-amber-200/80 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Référence de transaction :</span>
                    <span className="font-mono font-black text-slate-900">{activePayment.transaction_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durée souscrite :</span>
                    <span className="font-bold text-slate-900">{activePayment.duration_days} jours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Montant à régler :</span>
                    <span className="font-black text-blue-700 text-sm">{formatPrice(activePayment.amount, activePayment.amount_fc)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Moyen de paiement :</span>
                    <span className="font-bold text-slate-900 uppercase">{activePayment.payment_method || paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut actuel du serveur :</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black text-[10px]">
                      {activePayment.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-100 space-y-1">
                  <p className="font-bold text-slate-900">📲 Instructions pour valider :</p>
                  <p>{paymentInstructions}</p>
                  <p className="text-slate-500 text-[11px] pt-1">
                    Un message USSD a été envoyé sur votre téléphone ({payerPhone}). Saisissez votre code PIN Mobile Money pour approuver.
                  </p>
                </div>
              </div>

              {verifyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Bouton de vérification manuelle & automatique */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleTriggerServerVerification}
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Vérification auprès de la passerelle en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Confirmer le paiement & Activer la mise à la une</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Validation sécurisée côté serveur • Vérification automatique active toutes les 4s
                </p>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePayment(null)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Modifier la durée ou le mode de paiement</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Fermer la fenêtre (Le paiement reste actif)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CAS 5: CHOIX DES DURÉES ET PASSATION DE COMMANDE (STEPS 3, 4 & 5) */}
          {isLoggedIn && isVehicleOwner && !promotionConfirmed && !activePayment && (
            <form onSubmit={handleCreatePaymentOrder} className="space-y-6">

              {/* Information Véhicule */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <img 
                  src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300"} 
                  alt={vehicle.modele}
                  className="w-16 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm text-slate-900 truncate">{vehicle.marque} {vehicle.modele}</h4>
                  <p className="text-xs text-slate-500">{vehicle.annee} • {vehicle.carburant} • {vehicle.kilometrage.toLocaleString('fr-FR')} km</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Prix affiché</span>
                  <p className="text-sm font-black text-slate-900">{vehicle.prix.toLocaleString('fr-FR')} $</p>
                </div>
              </div>

              {/* STEP 3 & 4: Sélection de la Durée avec prix du backend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. Choisissez la durée de mise à la une</span>
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold">
                    Tarifs officiels AutoKin
                  </span>
                </div>

                {loadingConfig ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {durationTiers.map((tier) => {
                      const isSelected = selectedDuration === tier.jours;
                      return (
                        <button
                          key={tier.jours}
                          type="button"
                          onClick={() => setSelectedDuration(tier.jours)}
                          className={`relative p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {tier.popular && (
                            <span className="absolute -top-2.5 right-2 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                              Populaire
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">
                                {tier.jours} jours
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-base font-black text-blue-700 mt-1">
                              {formatPrice(tier.prix_usd, tier.prix_fc)}
                            </p>
                          </div>

                          {tier.economie && (
                            <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate">
                              {tier.economie}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Avantages Inclus */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p className="font-black text-slate-900 text-[11px] uppercase tracking-wider">
                  Avantages garantis pour {selectedTier.jours} jours :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Badge exclusif <strong>"À LA UNE"</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Position prioritaire n°1 dans les recherches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Affichage dans l'onglet "Featured Items"</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Notification acheteurs & boost WhatsApp direct</span>
                  </div>
                </div>
              </div>

              {/* STEP 5: Mode de paiement et coordonnées */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Mode de règlement</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      paymentMethod === 'mpesa'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      paymentMethod === 'orange'
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>Orange Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      paymentMethod === 'airtel'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Airtel Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Carte Visa / MC</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Numéro de téléphone ({paymentMethod.toUpperCase()}) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="+243 820 000 000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nom complet du titulaire *
                    </label>
                    <input
                      type="text"
                      required
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Ex: Jean Mukendi"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Bouton de confirmation de commande */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] text-slate-500">Montant total calculé :</span>
                  <div className="text-lg font-black text-slate-900">
                    {formatPrice(selectedTier.prix_usd, selectedTier.prix_fc)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Création de la commande...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 text-amber-300" />
                      <span>Commander & Payer {formatPrice(selectedTier.prix_usd, selectedTier.prix_fc)}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
