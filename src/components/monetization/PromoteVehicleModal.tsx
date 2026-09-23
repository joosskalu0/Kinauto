import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Rocket, Check, AlertCircle, Clock, ShieldCheck, CreditCard, 
  Smartphone, CheckCircle2, ChevronRight, Lock, ArrowLeft, RefreshCw, 
  Calendar, Sparkles, Star, Award, Zap, AlertTriangle, Camera, Upload,
  MessageCircle, Copy, FileText, Image as ImageIcon, Trash2
} from 'lucide-react';
import { Vehicle } from '../../types';
import { monetizationApi } from '../../services/api';
import { compressImageFile } from '../../lib/imageOptimization';

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

interface PaymentAccounts {
  titulaire: string;
  mpesa_number: string;
  mpesa_name: string;
  airtel_number: string;
  airtel_name: string;
  orange_number: string;
  orange_name: string;
  whatsapp_number: string;
  instructions: string;
}

const DEFAULT_TIERS: DurationTier[] = [
  { jours: 3, prix_usd: 9, prix_fc: 25650, economie: 'Idéal vente rapide' },
  { jours: 7, prix_usd: 19, prix_fc: 54150, popular: true, economie: 'Le plus populaire' },
  { jours: 15, prix_usd: 35, prix_fc: 99750, economie: 'Économisez 15%' },
  { jours: 30, prix_usd: 59, prix_fc: 168150, economie: 'Visibilité maximale (Éco 30%)' },
];

const DEFAULT_ACCOUNTS: PaymentAccounts = {
  titulaire: 'AutoKin RDC / Direction Commerciale',
  mpesa_number: '+243 812 345 678',
  mpesa_name: 'AutoKin M-Pesa',
  airtel_number: '+243 991 234 567',
  airtel_name: 'AutoKin Airtel Money',
  orange_number: '+243 899 876 543',
  orange_name: 'AutoKin Orange Money',
  whatsapp_number: '+243 812 345 678',
  instructions: 'Effectuez le transfert vers l’un de nos numéros Mobile Money puis téléversez votre capture d’écran de confirmation.'
};

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
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccounts>(DEFAULT_ACCOUNTS);

  // Formulaire & Choix de paiement
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel' | 'orange'>('mpesa');
  const [payerPhone, setPayerPhone] = useState<string>(currentUser?.telephone || '+243 ');
  const [payerName, setPayerName] = useState<string>(currentUser?.nom_complet || currentUser?.nom || '');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // STEP 5: Commande créée
  const [activePayment, setActivePayment] = useState<any | null>(null);

  // STEP 6: Capture d'écran / Preuve utilisateur
  const [proofImage, setProofImage] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [proofMessage, setProofMessage] = useState<string>('');
  const [userTransactionRef, setUserTransactionRef] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [proofError, setProofError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 7: Succès après confirmation serveur
  const [promotionConfirmed, setPromotionConfirmed] = useState<boolean>(false);
  const [confirmedVehicle, setConfirmedVehicle] = useState<Vehicle | null>(null);

  // 1. Récupération des prix et des comptes de paiement provenant du backend
  useEffect(() => {
    let isMounted = true;
    const fetchBackendPricing = async () => {
      setLoadingConfig(true);
      try {
        const res = await monetizationApi.getConfig();
        if (isMounted && res.success && res.data) {
          if (res.data.promotion_options?.featured?.durees) {
            const backendTiers: DurationTier[] = res.data.promotion_options.featured.durees.map((d: any) => ({
              jours: d.jours,
              prix_usd: d.prix_usd,
              prix_fc: d.prix_fc || d.prix_usd * usdToFcRate,
              popular: d.jours === 7,
              economie: d.economie || (d.jours === 7 ? 'Le plus choisi' : d.jours === 30 ? 'Meilleur rapport' : undefined)
            }));
            setDurationTiers(backendTiers);
          }
          if (res.data.payment_accounts) {
            setPaymentAccounts(res.data.payment_accounts);
          }
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

  // Polling automatique en arrière-plan : détecte la validation par l'administrateur
  useEffect(() => {
    if (!activePayment || promotionConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await monetizationApi.getPaymentStatus(activePayment.transaction_reference);
        if (statusRes.success && statusRes.payment?.status?.toUpperCase() === 'PAID') {
          // L'administrateur a validé la capture d'écran côté serveur !
          handleServerConfirmed(statusRes.vehicle, statusRes.payment);
        }
      } catch (e) {
        // Polling silencieux
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activePayment, promotionConfirmed]);

  const selectedTier = durationTiers.find(t => t.jours === selectedDuration) || durationTiers[1];

  const formatPrice = (usd: number, cdf?: number) => {
    if (currency === 'FC' && cdf) {
      return `${cdf.toLocaleString('fr-FR')} CDF`;
    }
    return `$${usd} USD`;
  };

  const getRecipientNumber = () => {
    switch (paymentMethod) {
      case 'airtel':
        return { number: paymentAccounts.airtel_number, name: paymentAccounts.airtel_name, label: 'Airtel Money' };
      case 'orange':
        return { number: paymentAccounts.orange_number, name: paymentAccounts.orange_name, label: 'Orange Money' };
      case 'mpesa':
      default:
        return { number: paymentAccounts.mpesa_number, name: paymentAccounts.mpesa_name, label: 'Vodacom M-Pesa' };
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // STEP 5: Créer une commande de paiement côté serveur (statut PENDING)
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
        throw new Error(response.message || 'Impossible d’initialiser la commande.');
      }

      setActivePayment(response.payment);
    } catch (err: any) {
      setOrderError(err.message || 'Erreur lors de la création de la commande de paiement.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Gestion du fichier capture d'écran avec compression automatique
  const handleCaptureFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingProof(true);
    setProofError('');
    try {
      // Compresse instantanément la capture d'écran pour un téléversement immédiat
      const compressedDataUrl = await compressImageFile(file, 1600, 1600, 0.82);
      setProofImage(compressedDataUrl);
      setProofFileName(file.name);
    } catch (err: any) {
      console.error('Erreur compression capture:', err);
      setProofError('Impossible de lire cette image. Veuillez sélectionner un format standard (JPG, PNG, WEBP).');
    } finally {
      setIsCompressingProof(false);
    }
  };

  // Soumission de la preuve à l'administrateur
  const handleSubmitProof = async () => {
    if (!activePayment) return;
    if (!proofImage && !userTransactionRef) {
      setProofError('Veuillez sélectionner la capture d’écran de votre preuve de paiement.');
      return;
    }

    setIsSubmittingProof(true);
    setProofError('');

    try {
      const res = await monetizationApi.submitPaymentProof(activePayment.transaction_reference, {
        proof_image: proofImage,
        transaction_reference: userTransactionRef || activePayment.transaction_reference,
        payer_phone: payerPhone,
        payer_name: payerName,
        notes: userNotes
      });

      if (res.success) {
        setProofSubmitted(true);
        setProofMessage(res.message || 'Preuve transmise avec succès ! En attente de validation par l’administrateur.');
        if (res.payment) {
          setActivePayment(res.payment);
        }
      } else {
        setProofError(res.message || 'Erreur lors de l’envoi de la preuve.');
      }
    } catch (err: any) {
      setProofError(err.message || 'Erreur réseau lors de l’envoi.');
    } finally {
      setIsSubmittingProof(false);
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

  // Lien WhatsApp direct avec message prérempli
  const getWhatsAppLink = () => {
    const cleanNum = (paymentAccounts.whatsapp_number || '+243812345678').replace(/[^0-9]/g, '');
    const amountStr = activePayment ? formatPrice(activePayment.amount, activePayment.amount_fc) : formatPrice(selectedTier.prix_usd, selectedTier.prix_fc);
    const refStr = activePayment?.transaction_reference || 'Réf en attente';
    const text = encodeURIComponent(
      `Bonjour AutoKin !\nJe viens d'effectuer le paiement de ${amountStr} par ${paymentMethod.toUpperCase()} pour la mise à la une de mon annonce :\n🚗 *${vehicle.marque} ${vehicle.modele}*\n🔖 Réf : ${refStr}\n\nVeuillez trouver ma capture d'écran ci-joint pour validation. Merci !`
    );
    return `https://wa.me/${cleanNum}?text=${text}`;
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
                <p className="text-xs text-slate-500">
                  Vous devez être connecté à votre compte AutoKin pour mettre votre annonce en avant.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Se connecter / S'inscrire</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* CAS 2: CE N'EST PAS LE PROPRIÉTAIRE DE L'ANNONCE */}
          {isLoggedIn && !isVehicleOwner && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Propriété Non Vérifiée
                </h3>
                <p className="text-xs text-slate-500">
                  Seul le propriétaire ou le concessionnaire ayant publié cette annonce peut la promouvoir.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}

          {/* CAS 3: PROMOTION CONFIRMÉE PAR L'ADMINISTRATEUR (SUCCÈS RÉEL) */}
          {isLoggedIn && isVehicleOwner && promotionConfirmed && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Validation confirmée
                </span>
                <h3 className="text-xl font-black text-slate-900 pt-1">
                  Félicitations ! Annonce À la Une !
                </h3>
                <p className="text-xs text-slate-600">
                  Votre paiement a été validé par l’administrateur. Votre véhicule bénéficie dès maintenant de la position n°1 et du badge premium.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-xs grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Durée active</span>
                  <span className="font-bold text-slate-900">{selectedDuration} jours garantis</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Fin de promotion</span>
                  <span className="font-bold text-emerald-700">
                    {new Date(Date.now() + selectedDuration * 86400000).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
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

          {/* CAS 4: COMMANDE CRÉÉE -> INSTRUCTIONS MOBILE MONEY & ENVOI DE LA CAPTURE */}
          {isLoggedIn && isVehicleOwner && !promotionConfirmed && activePayment && (
            <div className="space-y-5">
              {/* Carte des Coordonnées de Paiement de l'Administrateur */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Compte de réception Mobile Money officiel
                      </h4>
                      <p className="text-xs text-slate-600">
                        Transférez le montant exact ci-dessous pour activer votre boost
                      </p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                    Réf : {activePayment.transaction_reference}
                  </span>
                </div>

                {/* Box de Numéro & Montant */}
                <div className="bg-white border border-blue-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Montant exact à envoyer</span>
                      <div className="text-xl font-black text-blue-700">
                        {formatPrice(activePayment.amount, activePayment.amount_fc)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Durée souscrite</span>
                      <div className="text-sm font-black text-slate-900">
                        {activePayment.duration_days || selectedDuration} jours de visibilité
                      </div>
                    </div>
                  </div>

                  {/* Numéro et Nom du titulaire */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <span className="text-blue-600">Réseau :</span>
                        <span className="uppercase font-black">{getRecipientNumber().label}</span>
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono tracking-wider mt-0.5">
                        {getRecipientNumber().number}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Titulaire : <strong>{paymentAccounts.titulaire}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyNumber(getRecipientNumber().number)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Copié !' : 'Copier le numéro'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-blue-100 space-y-1">
                  <p className="font-bold text-slate-900">📋 Marche à suivre en 2 étapes :</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 text-[11px]">
                    <li>Effectuez le transfert depuis votre téléphone vers le numéro <strong>{getRecipientNumber().number}</strong>.</li>
                    <li>Prenez une capture d’écran du reçu ou du SMS de confirmation reçu et importez-la ci-dessous.</li>
                  </ol>
                </div>
              </div>

              {/* ZONE DE TÉLÉVERSEMENT DE LA CAPTURE D'ÉCRAN */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Envoyer la capture d'écran de votre paiement</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Validation manuelle par l'administrateur
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleCaptureFile}
                  className="hidden"
                />

                {!proofImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isCompressingProof
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white hover:bg-blue-50/50 border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {isCompressingProof ? (
                      <>
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-xs font-bold text-blue-700">Traitement de l'image en cours...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            Cliquez ici pour choisir la capture d'écran
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Photos de téléphone, captures d'écran SMS ou reçus (JPG, PNG)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={proofImage}
                        alt="Preuve"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {proofFileName || 'Capture de confirmation'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Check className="w-3 h-3" /> Photo prête à l'envoi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        title="Changer d'image"
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProofImage(''); setProofFileName(''); }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Champs complémentaires optionnels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Code de transaction SMS (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={userTransactionRef}
                      onChange={(e) => setUserTransactionRef(e.target.value)}
                      placeholder="Ex: MP260901.1234.H56789"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Numéro expéditeur du paiement
                    </label>
                    <input
                      type="text"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="+243 820 000 000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium"
                    />
                  </div>
                </div>

                {proofError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{proofError}</span>
                  </div>
                )}

                {/* Bouton d'envoi de la capture */}
                <button
                  type="button"
                  onClick={handleSubmitProof}
                  disabled={isSubmittingProof || !proofImage}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingProof ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Envoi de votre capture d'écran...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Transmettre ma capture d'écran pour validation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message de confirmation de preuve soumise & Bouton WhatsApp direct */}
              {proofSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Capture d'écran transmise avec succès !</p>
                      <p className="text-emerald-800 text-[11px] mt-0.5">
                        L’administrateur va vérifier votre reçu. Dès validation, votre annonce sera instantanément propulsée dans le carrousel <strong>"À la une"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span>Envoyer aussi sur WhatsApp ({paymentAccounts.whatsapp_number})</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Indicateur de synchronisation automatique */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span className="text-[11px] font-medium">
                    Détection automatique en cours • Cette fenêtre se validera dès que l'administrateur valide votre preuve.
                  </span>
                </div>
              </div>

              {/* Navigation retour */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => { setActivePayment(null); setProofSubmitted(false); setProofImage(''); }}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Changer de formule ou de réseau</span>
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
          )}

          {/* CAS 5: CHOIX DES DURÉES ET DU RÉSEAU (INITIAL STEP) */}
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
                    <span>Affichage dans le carrousel d'accueil</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Validation manuelle par capture d'écran</span>
                  </div>
                </div>
              </div>

              {/* Choix du moyen Mobile Money */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Choisissez votre opérateur Mobile Money</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'mpesa'
                        ? 'border-red-500 bg-red-50 text-red-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <span>Vodacom M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'airtel'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span>Airtel Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'orange'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-600" />
                    <span>Orange Money</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Votre numéro de téléphone ({paymentMethod.toUpperCase()}) *
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
                      Votre nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Ex: Patrick Mukendi"
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

              {/* Bouton pour générer la commande et afficher les coordonnées */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] text-slate-500">Montant à régler :</span>
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
                      <span>Génération des instructions...</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 text-amber-300" />
                      <span>Continuer vers les coordonnées & la preuve</span>
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
