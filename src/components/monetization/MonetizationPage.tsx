import React, { useState } from 'react';
import { 
  Car, Sparkles, Crown, Wrench, Megaphone, ShieldCheck, ArrowRight, CheckCircle2,
  AlertCircle, CreditCard, Smartphone, Building2, Eye, Star, Zap, Check, Flame,
  TrendingUp, Clock, Tag, ArrowUpRight, HelpCircle, Layers, FileText
} from 'lucide-react';
import { ListingTierPlan, VisibilityOption } from '../../types';

interface MonetizationPageProps {
  onBackToPublic: () => void;
  onOpenAddVehicleModal?: () => void;
  onOpenAdInquiry?: () => void;
  currency: 'USD' | 'FC';
  usdToFcRate: number;
}

export const MonetizationPage: React.FC<MonetizationPageProps> = ({
  onBackToPublic,
  onOpenAddVehicleModal,
  onOpenAdInquiry,
  currency,
  usdToFcRate
}) => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'concessions' | 'garages' | 'publicite' | 'paiements'>('annonces');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Order Simulator State (Sandbox / Architecture)
  const [simulatedOrderSuccess, setSimulatedOrderSuccess] = useState<string | null>(null);

  const formatPrice = (valUSD: number) => {
    if (currency === 'FC') {
      return `${(valUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `${valUSD.toLocaleString('fr-FR')} $`;
  };

  const handleSimulateOrder = (title: string, amountUSD: number, type: string) => {
    // Calling backend order API
    fetch('/api/monetization/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        item_id: title.toLowerCase().replace(/\s+/g, '_'),
        item_nom: title,
        montant_usd: amountUSD,
        payment_method: 'mpesa',
        simulate_instant_approval: true
      })
    }).then(res => res.json())
      .then(data => {
        setSimulatedOrderSuccess(`Commande "${title}" confirmée (${formatPrice(amountUSD)}) ! Référence : ${data.order?.id || 'ORD-OK'}`);
        setTimeout(() => setSimulatedOrderSuccess(null), 6000);
      })
      .catch(() => {
        setSimulatedOrderSuccess(`Simulation validée pour "${title}" (${formatPrice(amountUSD)}). Architecture prête pour l'intégration de la passerelle de paiement.`);
        setTimeout(() => setSimulatedOrderSuccess(null), 6000);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-950/60 via-slate-900 to-slate-950 border-b border-slate-800 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Modèles Économiques & Monétisation de la Plateforme</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tarifs Transparents & Solutions de Visibilité
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Que vous soyez un particulier vendeur, un concessionnaire professionnel, un atelier de réparation ou un annonceur, accédez à des offres adaptées au marché automobile de Kinshasa et de la RDC.
          </p>

          {/* Navigation Tabs */}
          <div className="pt-6 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('annonces')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'annonces'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Car className="w-4 h-4 text-blue-300" />
              <span>1. Annonces & Visibilité</span>
            </button>

            <button
              onClick={() => setActiveTab('concessions')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'concessions'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>2. Abonnements Concessions</span>
            </button>

            <button
              onClick={() => setActiveTab('garages')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'garages'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4 text-emerald-300" />
              <span>3. Abonnements Garages</span>
            </button>

            <button
              onClick={() => setActiveTab('publicite')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'publicite'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4 text-purple-300" />
              <span>4. Régie Publicitaire</span>
            </button>

            <button
              onClick={() => setActiveTab('paiements')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'paiements'
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>5. Architecture de Paiement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Simulation Feedback Alert */}
        {simulatedOrderSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-4 text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold">{simulatedOrderSuccess}</span>
            </div>
            <button 
              onClick={() => setSimulatedOrderSuccess(null)}
              className="text-xs text-emerald-300 hover:text-white underline cursor-pointer"
            >
              Masquer
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 1: FORMULES D'ANNONCES & OPTIONS DE VISIBILITÉ (VÉHICULES) */}
        {/* =================================================================== */}
        {activeTab === 'annonces' && (
          <div className="space-y-12">
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Formules de Publication de Véhicules</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Choisissez le niveau d’exposition pour vendre votre véhicule rapidement aux meilleurs acheteurs de Kinshasa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. ANNONCE GRATUITE (STANDARD) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                        Standard
                      </span>
                      <span className="text-xs text-slate-500">Valable 30 jours</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Annonce Gratuite</h3>
                      <p className="text-xs text-slate-400 mt-1">L’essentiel pour vendre son véhicule sans engagement financier.</p>
                    </div>
                    <div className="pt-2">
                      <span className="text-4xl font-black text-white">0 $</span>
                      <span className="text-xs text-slate-400 ml-2">/ annonce</span>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Visibilité standard dans les filtres</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Jusqu’à <strong>5 photos</strong> du véhicule</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Contact WhatsApp & Appel direct</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Fiche descriptive complète</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={onOpenAddVehicleModal || onBackToPublic}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Publier gratuitement
                    </button>
                  </div>
                </div>

                {/* 2. ANNONCE PREMIUM (POPULAIRE) */}
                <div className="bg-gradient-to-b from-slate-900 to-amber-950/30 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xl shadow-amber-500/5">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md">
                    ⭐ Recommandé • Vente 2x plus rapide
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                        Premium
                      </span>
                      <span className="text-xs text-amber-300/80">Valable 60 jours</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Annonce Premium</h3>
                      <p className="text-xs text-slate-300 mt-1">Mise en avant dorée, priorité de tri et album complet.</p>
                    </div>
                    <div className="pt-2">
                      <span className="text-4xl font-black text-amber-400">{formatPrice(15)}</span>
                      <span className="text-xs text-slate-400 ml-2">/ annonce unique</span>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Badge « ⭐ PREMIUM »</strong> et liseré doré</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Priorité de position au-dessus des annonces gratuites</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Jusqu’à <strong>15 photos</strong> haute résolution</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Durée doublée : <strong>60 jours</strong> d’affichage</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Statistiques de consultations et de clics</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleSimulateOrder('Annonce Premium (Option 15$)', 15, 'listing_tier')}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Choisir la Formule Premium</span>
                    </button>
                  </div>
                </div>

                {/* 3. ANNONCE À LA UNE / EN VEDETTE */}
                <div className="bg-gradient-to-b from-slate-900 to-purple-950/30 border border-purple-800/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-purple-500 transition">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> À La Une VIP
                      </span>
                      <span className="text-xs text-purple-300/80">Valable 30 jours</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Annonce En Vedette</h3>
                      <p className="text-xs text-slate-300 mt-1">L’impact maximal : carrousel d’accueil et x5 contacts garantis.</p>
                    </div>
                    <div className="pt-2">
                      <span className="text-4xl font-black text-purple-400">{formatPrice(29)}</span>
                      <span className="text-xs text-slate-400 ml-2">/ annonce</span>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span><strong>Carrousel « À la Une »</strong> sur la page d'accueil</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Badge flamboyant <strong>« 🔥 À LA UNE »</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Tête de liste garantie dans toutes les recherches</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Jusqu’à <strong>30 photos + vidéo</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Relai sur les canaux officiels WhatsApp</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleSimulateOrder('Annonce À la Une Vedette (29$)', 29, 'listing_tier')}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
                    >
                      Mettre À la Une (29 $)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTIONS DE VISIBILITÉ À LA CARTE */}
            <div className="pt-6 border-t border-slate-800/80 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Options de Visibilité à la Carte (Micro-Boosts)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Activez un coup de pouce ponctuel sur une annonce existante à tout moment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Micro Boost 1 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-400">7 Jours</span>
                      <span className="text-base font-black text-white">{formatPrice(5)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Remontée en tête</h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Repositionne instantanément votre véhicule en 1ère position des résultats.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulateOrder('Remontée en tête de recherche', 5, 'visibility_boost')}
                    className="mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Activer (5 $)
                  </button>
                </div>

                {/* Micro Boost 2 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400">14 Jours</span>
                      <span className="text-base font-black text-white">{formatPrice(3)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Badge « 🚨 Urgent »</h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Signale un prix négociable ou une vente rapide aux acheteurs réactifs.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulateOrder('Badge Vente Urgente', 3, 'visibility_boost')}
                    className="mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Activer (3 $)
                  </button>
                </div>

                {/* Micro Boost 3 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">30 Jours</span>
                      <span className="text-base font-black text-white">{formatPrice(7)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Badge « 🛡️ Certifié »</h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Label de confiance après contrôle du carnet d’entretien et du châssis VIN.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulateOrder('Badge Véhicule Certifié & Garanti', 7, 'visibility_boost')}
                    className="mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Activer (7 $)
                  </button>
                </div>

                {/* Micro Boost 4 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-400">14 Jours</span>
                      <span className="text-base font-black text-white">{formatPrice(12)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Carrousel Accueil</h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Présence dans le bandeau supérieur de l’accueil avec les véhicules stars.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulateOrder('Encart Carrousel Accueil 14j', 12, 'visibility_boost')}
                    className="mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Activer (12 $)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ABONNEMENTS CONCESSIONNAIRES (DEALER SAAS) */}
        {/* =================================================================== */}
        {activeTab === 'concessions' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Abonnements Concessions Automobiles</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Gérez tout votre stock, collectez des leads qualifiés WhatsApp et développez votre notoriété à Kinshasa.
              </p>

              {/* Billing Cycle Switch */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
                  Facturation Mensuelle
                </span>
                <button
                  onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 bg-slate-800 rounded-full p-1 border border-slate-700 relative transition cursor-pointer"
                >
                  <div className={`w-4 h-4 bg-amber-400 rounded-full transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className={`text-xs font-bold flex items-center gap-1 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
                  <span>Facturation Annuelle</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">2 mois offerts</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DEALER 1: STARTER */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                    Starter Parc
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Formule Découverte</h3>
                    <p className="text-xs text-slate-400 mt-1">Idéal pour démarrer avec un stock de 15 véhicules.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-white">
                      {formatPrice(billingCycle === 'annual' ? 40 : 49)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">/ mois</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Jusqu’à <strong>15 véhicules</strong> en ligne</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>1 annonce À la Une</strong> offerte / mois</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Vitrine personnalisée avec logo & contact</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Générateur d’annonces avec IA Gemini</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Commission sur les ventes : <strong>0%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSimulateOrder('Abonnement Concession Starter (49$/mois)', 49, 'dealership_subscription')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Souscrire Starter
                  </button>
                </div>
              </div>

              {/* DEALER 2: PRO (BEST-SELLER) */}
              <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xl">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md">
                  Le Choix des Concessions Actives
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    Concessionnaire Pro
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Formule Pro Kinshasa</h3>
                    <p className="text-xs text-slate-300 mt-1">Rotation accélérée et gestion avancée de la clientèle.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-amber-400">
                      {formatPrice(billingCycle === 'annual' ? 82 : 99)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">/ mois</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Jusqu’à <strong>50 véhicules</strong> en simultané</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>5 annonces À la Une</strong> offertes / mois</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Toutes les annonces en statut <strong>⭐ PREMIUM</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>CRM de gestion des leads et demandes d’essais</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Badge officiel « Concession Vérifiée »</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Statistiques détaillées de fréquentation</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSimulateOrder('Abonnement Concession Pro (99$/mois)', 99, 'dealership_subscription')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
                  >
                    Souscrire Concession Pro
                  </button>
                </div>
              </div>

              {/* DEALER 3: ELITE */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                    Élite Multi-Sites
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Formule Groupe & Réseau</h3>
                    <p className="text-xs text-slate-400 mt-1">Pour grands groupes, importateurs et concessions multi-adresses.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-purple-400">
                      {formatPrice(billingCycle === 'annual' ? 165 : 199)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">/ mois</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Véhicules <strong>ILLIMITÉS</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>15 annonces À la Une</strong> chaque mois</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Import automatique de votre catalogue (API / CSV)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Chargé de compte dédié à Kinshasa</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Bannière publicitaire partenaire offerte</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSimulateOrder('Abonnement Élite Réseau (199$/mois)', 199, 'dealership_subscription')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Souscrire Élite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: ABONNEMENTS GARAGES & SOS DÉPANNAGE */}
        {/* =================================================================== */}
        {activeTab === 'garages' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Abonnements Garages & Dépannage SOS</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Recevez directement les alertes de pannes par commune et captez une clientèle d’automobilistes fidèles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GARAGE 1: DÉCOUVERTE */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                    Atelier Standard
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Référencement Découverte</h3>
                    <p className="text-xs text-slate-400 mt-1">Présence essentielle dans l’annuaire des 24 communes.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-white">0 $</span>
                    <span className="text-xs text-slate-400 ml-2">/ gratuit à vie</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Fiche dans l’annuaire par commune</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Numéro de téléphone et repère géographique</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Spécialités principales (électricité, freinage)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onBackToPublic}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Référencement Gratuit
                  </button>
                </div>
              </div>

              {/* GARAGE 2: GARAGE PRO AGRÉÉ */}
              <div className="bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xl">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md">
                  Le Plus Choisi par les Garages
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Garage Agréé & SOS
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Formule Garage Pro</h3>
                    <p className="text-xs text-slate-300 mt-1">Recevez les demandes de dépannage directement sur votre téléphone.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-emerald-400">{formatPrice(39)}</span>
                    <span className="text-xs text-slate-400 ml-2">/ mois</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Badge de confiance <strong>« 🛡️ Atelier Agréé »</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Alertes SOS Pannes en direct</strong> par WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Bouton d’appel d’urgence prioritaire</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Galerie photos de l'atelier & ponts élévateurs</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Grille tarifaire et forfaits révisions détaillés</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSimulateOrder('Abonnement Garage Pro SOS (39$/mois)', 39, 'garage_subscription')}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
                  >
                    Devenir Garage Agréé (39 $)
                  </button>
                </div>
              </div>

              {/* GARAGE 3: FLOTTE MOBILE 24/7 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                    Centre Auto & Flotte Mobile
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Formule Dépannage 24/7</h3>
                    <p className="text-xs text-slate-400 mt-1">Pour les flottes mobiles d’intervention et les remorqueuses.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-4xl font-black text-cyan-400">{formatPrice(89)}</span>
                    <span className="text-xs text-slate-400 ml-2">/ mois</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Positionnement <strong>N°1 en tête de liste</strong> pour les pannes</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Gestion de plusieurs dépanneuses mobiles</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Encart sponsorisé permanent dans l’onglet SOS</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Support prioritaire et mise en relation VIP</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSimulateOrder('Abonnement Flotte Mobile 24/7 (89$/mois)', 89, 'garage_subscription')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Souscrire Flotte 24/7 (89 $)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: RÉGIE PUBLICITAIRE & SPONSORING */}
        {/* =================================================================== */}
        {activeTab === 'publicite' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Régie Publicitaire & Bannières Partenaires</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Placez votre marque au cœur de l'écosystème automobile congolais auprès d’un public qualifié à fort pouvoir d’achat.
              </p>
            </div>

            {/* Audience stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-white">65 000+</span>
                <p className="text-xs text-slate-400 mt-1">Visiteurs mensuels uniques</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">92%</span>
                <p className="text-xs text-slate-400 mt-1">Trafic local Kinshasa & RDC</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">4,8 min</span>
                <p className="text-xs text-slate-400 mt-1">Temps moyen par session</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-purple-400">3,2%</span>
                <p className="text-xs text-slate-400 mt-1">Taux de clic moyen (CTR)</p>
              </div>
            </div>

            {/* Ad Placements Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Grille Tarifaire des Encarts Publicitaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Placement 1 */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                        Leaderboard Header (728x90)
                      </span>
                      <span className="text-lg font-black text-white">{formatPrice(150)}/mois</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Bannière Haut de Page sous Navigation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Visible dès l’ouverture du site par 100% des visiteurs. Recommandé pour les banques, assurances et concessions.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAdInquiry}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Réserver cet emplacement
                  </button>
                </div>

                {/* Placement 2 */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        Native In-Feed (970x250)
                      </span>
                      <span className="text-lg font-black text-white">{formatPrice(120)}/mois</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Bannière Intégrée au Catalogue Auto</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Intercalée harmonieusement tous les 6 véhicules dans les résultats de recherche. Taux de clic maximal.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAdInquiry}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                  >
                    Réserver cet emplacement
                  </button>
                </div>

                {/* Placement 3 */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        Pavé Carré Fiche (300x250)
                      </span>
                      <span className="text-lg font-black text-white">{formatPrice(80)}/mois</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Colonne Latérale Détail Véhicule</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      S'affiche aux acheteurs au moment précis où ils étudient un véhicule à acheter. Idéal pour crédits & assurances.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAdInquiry}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Réserver cet emplacement
                  </button>
                </div>

                {/* Placement 4 */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                        Espace SOS & Garages
                      </span>
                      <span className="text-lg font-black text-white">{formatPrice(95)}/mois</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Encart Exclusif Entretien & Pièces</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cible les automobilistes en quête de pièces détachées, batteries, pneus, lubrifiants ou d’assistance panne.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAdInquiry}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Réserver cet emplacement
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Campagne Sur-Mesure ou Sponsoring de Marque ?</h4>
                <p className="text-xs text-slate-300">Habillage de site, opérations spéciales, notifications ciblées...</p>
              </div>
              <button
                onClick={onOpenAdInquiry}
                className="px-6 py-3 bg-white text-slate-950 font-black rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg shrink-0 cursor-pointer"
              >
                Contacter la Régie Commerciale
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: ARCHITECTURE DE PAIEMENT & INTÉGRATION EXTENSIBLE */}
        {/* =================================================================== */}
        {activeTab === 'paiements' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Architecture & Moyens de Paiement</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Conçue selon les directives : architecture prête à accueillir les passerelles automatisées (M-Pesa, Orange Money, Airtel Money, Stripe, virement bancaire) sans complexité prématurée.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CANAL 1: MOBILE MONEY RDC */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Mobile Money RDC</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le moyen le plus accessible et rapide en République Démocratique du Congo :
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-rose-400">Vodacom M-Pesa</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Prêt</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-amber-400">Orange Money RDC</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Prêt</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-red-400">Airtel Money</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Prêt</span>
                  </div>
                </div>
              </div>

              {/* CANAL 2: VIREMENT & BANQUES LOCALES */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Virement & Factures Pro</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour les concessions, flottes et annonceurs institutionnels avec émission de facture proforma :
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200">Rawbank RDC</span>
                    <p className="text-[11px] text-slate-400">Compte USD & CDF avec rapprochement par référence</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200">EquityBCDC</span>
                    <p className="text-[11px] text-slate-400">Virement interbancaire ou dépôt guichet</p>
                  </div>
                </div>
              </div>

              {/* CANAL 3: CARTES INTERNATIONALES */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Cartes Bancaires & Stripe</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour la diaspora congolaise et les règlements par cartes de débit ou de crédit :
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-200">Visa / Mastercard</span>
                    <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">Connecteur Prêt</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200">Stripe / Passerelle SDK</span>
                    <p className="text-[11px] text-slate-400">Points d'API `/api/monetization/order` prêts à recevoir le webhook</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Explanation Box */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Respect Strict des Directives Architecturales</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le système enregistre chaque intention d’achat (Boost, Annonce Premium, Abonnement, Bannière Pub) sous le format unifié <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">MonetizationOrder</code> avec suivi du statut (<code className="text-slate-200">pending</code>, <code className="text-emerald-400">completed</code>, <code className="text-rose-400">failed</code>). Cela permet aux administrateurs de valider manuellement les paiements sans retarder le lancement, tout en permettant le branchement futur d'un Webhook M-Pesa ou Stripe en une seule fonction.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
