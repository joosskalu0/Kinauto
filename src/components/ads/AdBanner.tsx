import React, { useState } from 'react';
import { ExternalLink, Sparkles, Building2, ChevronRight, Megaphone } from 'lucide-react';
import { AdCampaign } from '../../types';

interface AdBannerProps {
  campaign?: AdCampaign;
  format?: 'banner_leaderboard' | 'banner_inline' | 'sidebar_box' | 'banner_sos';
  onOpenAdInquiry?: () => void;
  onNavigateToMonetization?: () => void;
}

const FALLBACK_ADS: Record<string, Partial<AdCampaign>> = {
  banner_inline: {
    id: 'camp-rawbank-credit-auto',
    titre: 'Crédit Auto Rawbank jusqu’à 80%',
    annonceur: 'Rawbank RDC',
    tag: 'Partenaire Financement Officiel',
    description: 'Financez l’achat de votre véhicule neuf ou d’occasion avec un taux préférentiel et une réponse rapide à Kinshasa.',
    cta_text: 'Simuler mon Crédit',
    cta_url: '#financement',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    badge_color: 'bg-emerald-600 text-white'
  },
  banner_leaderboard: {
    id: 'camp-sonas-assurance',
    titre: 'Assurance Automobile Obligatoire & Tous Risques SONAS',
    annonceur: 'SONAS RDC',
    tag: 'Partenaire Assurance',
    description: 'Attestation instantanée délivrée sur WhatsApp pour circuler en toute légalité et sérénité.',
    cta_text: 'Demander un devis',
    cta_url: '#assurance',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200',
    badge_color: 'bg-blue-600 text-white'
  },
  sidebar_box: {
    id: 'camp-sonas-sidebar',
    titre: 'Souscrivez votre assurance auto en 3 minutes',
    annonceur: 'SONAS SA',
    tag: 'Assurance Immédiate',
    description: 'Formule au tiers ou tous risques adaptée à Kinshasa.',
    cta_text: 'Tarifs Assurance',
    cta_url: '#assurance',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    badge_color: 'bg-blue-600 text-white'
  },
  banner_sos: {
    id: 'camp-total-lubrifiants',
    titre: 'Huile Moteur Quartz TotalEnergies : Protection Maximale',
    annonceur: 'TotalEnergies RDC',
    tag: 'Entretien & Vidange Recommandé',
    description: 'Protégez le moteur de votre 4x4 contre la poussière et la chaleur. Disponible dans toutes les stations.',
    cta_text: 'Trouver une Station',
    cta_url: '#garages',
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200',
    badge_color: 'bg-rose-600 text-white'
  }
};

export const AdBanner: React.FC<AdBannerProps> = ({
  campaign,
  format = 'banner_inline',
  onOpenAdInquiry,
  onNavigateToMonetization
}) => {
  const ad = campaign || (FALLBACK_ADS[format] as AdCampaign);

  const handleClickAd = () => {
    if (ad.id) {
      // Notification du clic vers le backend en tâche de fond
      fetch(`/api/monetization/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {});
    }
    if (ad.cta_url && ad.cta_url.startsWith('http')) {
      window.open(ad.cta_url, '_blank');
    }
  };

  // 1. LEADERBOARD TOP BANNER
  if (format === 'banner_leaderboard') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 shadow-md flex flex-col md:flex-row items-center justify-between p-4 sm:p-5 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.annonceur}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/20 shrink-0"
              />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${ad.badge_color || 'bg-blue-600 text-white'}`}>
                  {ad.tag || 'Sponsorisé'}
                </span>
                <span className="text-xs text-blue-200/80 font-medium">Par {ad.annonceur}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                {ad.titre}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-2xl">
                {ad.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={handleClickAd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>{ad.cta_text || 'En savoir plus'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenAdInquiry || onNavigateToMonetization}
              className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition cursor-pointer px-2 py-1"
              title="Réserver un encart publicitaire"
            >
              Espace Pub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SIDEBAR BOX BANNER
  if (format === 'sidebar_box') {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Annonce Sponsorisée
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{ad.annonceur}</span>
        </div>

        {ad.image_url && (
          <div className="aspect-[16/9] rounded-xl overflow-hidden relative">
            <img
              src={ad.image_url}
              alt={ad.annonceur}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h4 className="text-sm font-bold text-white leading-tight">
          {ad.titre}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {ad.description}
        </p>

        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            onClick={handleClickAd}
            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{ad.cta_text || 'Voir l’offre'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenAdInquiry || onNavigateToMonetization}
            className="p-2 text-slate-400 hover:text-slate-200 text-xs border border-slate-700 hover:border-slate-500 rounded-xl transition cursor-pointer"
            title="Votre pub ici"
          >
            <Megaphone className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. IN-FEED CATALOGUE BANNER (DEFAULT)
  return (
    <div className="col-span-full my-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border border-blue-900/40 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left flex-1">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.annonceur}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-white/10 shadow-lg shrink-0"
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${ad.badge_color || 'bg-amber-500 text-slate-950'}`}>
                  {ad.tag || 'Offre Partenaire'}
                </span>
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> {ad.annonceur}
                </span>
                <span className="text-[11px] text-slate-400">• Partenaire Officiel RDC</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {ad.titre}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {ad.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 justify-center">
            <button
              onClick={handleClickAd}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{ad.cta_text || 'Découvrir l’offre'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdInquiry || onNavigateToMonetization}
              className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Annoncez ici</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
