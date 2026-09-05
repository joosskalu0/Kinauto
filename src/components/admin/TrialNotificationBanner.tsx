import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { DealershipAccount, SubscriptionPlan } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/mockSaas';

interface TrialNotificationBannerProps {
  account: DealershipAccount;
  subscriptionPlans?: SubscriptionPlan[];
  onRequestInvoice: () => void;
  onOpenSuperAdmin: () => void;
}

export const TrialNotificationBanner: React.FC<TrialNotificationBannerProps> = ({
  account,
  subscriptionPlans,
  onRequestInvoice,
  onOpenSuperAdmin
}) => {
  const plans = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : SUBSCRIPTION_PLANS;
  const plan = plans.find((p) => p.id === account.planId) || plans[1];

  // Calculate days remaining
  const today = new Date();
  const trialEnd = new Date(account.finEssaiGratuit);
  const diffTime = trialEnd.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (account.statutAbonnement === 'actif') {
    return (
      <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">Abonnement Offre {plan.nom} Actif</span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                Payé & Confirmé
              </span>
            </div>
            <p className="text-emerald-300/80 text-[11px] mt-0.5">
              Prochaine facturation le {account.prochaineFacturation} • Montant : {account.prixFactureMensuel.toLocaleString('fr-FR')} FC / mois.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-300">Concessionnaire certifié</span>
        </div>
      </div>
    );
  }

  if (account.statutAbonnement === 'essai_gratuit') {
    return (
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border border-amber-500/50 text-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl text-xs animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0 shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">Période d'Essai Gratuit : {daysRemaining} jour(s) restant(s)</span>
              <span className="bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full uppercase">
                Formule {plan.nom}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Votre essai prend fin le <strong className="text-amber-400">{account.finEssaiGratuit}</strong>. Profitez de toutes les fonctionnalités de publication et de gestion d'annonces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRequestInvoice}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" /> Activer mon Abonnement Payant ({plan.prixMensuel.toLocaleString('fr-FR')} FC/mois)
          </button>
        </div>
      </div>
    );
  }

  if (account.statutAbonnement === 'facture_en_attente') {
    return (
      <div className="bg-amber-950/90 border border-amber-500 text-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-white text-sm">Fin d'Essai Gratuit Atteinte — Facture en attente de règlement</span>
            <p className="text-amber-300/80 text-[11px] mt-0.5">
              Une facture de <strong className="text-white">{account.prixFactureMensuel.toLocaleString('fr-FR')} FC HT</strong> a été émise par l'administrateur SaaS.
            </p>
          </div>
        </div>

        <button
          onClick={onRequestInvoice}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
        >
          <CreditCard className="w-3.5 h-3.5" /> Réglage Facture / Consulter Reçu
        </button>
      </div>
    );
  }

  // Expired / Suspended
  return (
    <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl text-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="font-black text-white text-sm">Abonnement Expiré ou Suspendu</span>
          <p className="text-rose-300/80 text-[11px] mt-0.5">
            Votre temps d'essai gratuit est écoulé. Contactez l'administrateur principal pour réactiver la publication de vos véhicules.
          </p>
        </div>
      </div>

      <button
        onClick={onRequestInvoice}
        className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
      >
        Régler mon Abonnement
      </button>
    </div>
  );
};
