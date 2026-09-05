import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Eye, PhoneCall, Calendar, 
  Car, Share2, ArrowLeft, ArrowUpRight, Award, ShieldCheck, 
  CheckCircle2, Sparkles, Filter, Clock, Euro
} from 'lucide-react';
import { DealershipInfo, Vehicle, Lead, AnalyticsReport } from '../../types';
import { generateGtmReport } from '../../lib/gtm';

interface DealershipAnalyticsProps {
  dealership: DealershipInfo;
  vehicles: Vehicle[];
  leads: Lead[];
  onSaveDealership?: (info: DealershipInfo) => void;
  onNavigateHome?: () => void;
}

export const DealershipAnalytics: React.FC<DealershipAnalyticsProps> = ({
  dealership,
  vehicles,
  leads,
  onNavigateHome
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [report, setReport] = useState<AnalyticsReport>(() => generateGtmReport(dealership.nom));

  useEffect(() => {
    setReport(generateGtmReport(dealership.nom));
  }, [dealership.nom, leads.length, vehicles.length]);

  // Lead statistics breakdown
  const totalLeads = leads.length;
  const testDriveLeads = leads.filter(l => l.typeDemande === 'essai').length;
  const quoteLeads = leads.filter(l => l.typeDemande === 'information' || l.typeDemande === 'financement').length;
  const tradeInLeads = leads.filter(l => l.typeDemande === 'offre_reprise').length;
  const priceOfferLeads = leads.filter(l => l.typeDemande === 'offre_prix').length;
  const concludedLeads = leads.filter(l => l.statut === 'conclu').length;

  const totalStockValue = vehicles.reduce((sum, v) => sum + v.prix, 0);
  const avgVehiclePrice = vehicles.length > 0 ? Math.round(totalStockValue / vehicles.length) : 0;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Vitrine</span>
                </button>
              )}
              <span className="p-2 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md">
                <BarChart3 className="w-4 h-4" /> Statistiques Concession
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-950/80 px-2.5 py-0.5 rounded-md border border-slate-800">
                {dealership.nom}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Tableau de Bord des Performances & Ventes
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consultez les indicateurs d'audience, l'intérêt généré par vos annonces, les demandes d'essais routiers et les conversions de votre concession.
            </p>
          </div>

          {/* Time Range Filter Controls */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-1 rounded-2xl">
            {[
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: '90d', label: '3 mois' },
              { id: 'all', label: 'Tout' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Page Views */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visites Totales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">{report.totalPageViews.toLocaleString('fr-FR')}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs période préc.</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {report.totalUniqueVisitors.toLocaleString('fr-FR')} visiteurs uniques
          </span>
        </div>

        {/* Vehicle Views */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fiches Consultées</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-sky-400">{report.vehicleViews.toLocaleString('fr-FR')}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24.1% d'intérêt stock</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Sur {vehicles.length} véhicules actifs
          </span>
        </div>

        {/* Test Drives Booked */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Essais Réservés</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{testDriveLeads || report.testDriveBookings}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intention d'achat élevée</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Rendez-vous programmés
          </span>
        </div>

        {/* Global Conversion Rate */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de Conversion</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">{report.conversionRate}%</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold mt-1">
              <Award className="w-3.5 h-3.5" />
              <span>{totalLeads} contacts générés</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {concludedLeads} ventes conclues
          </span>
        </div>

      </div>

      {/* Two Column Section: Top Consulted Vehicles & Leads Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top Consulted Vehicles */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                Véhicules les Plus Consultés de la Concession
              </h3>
              <p className="text-xs text-slate-400">
                Classement par nombre de vues de fiche et demandes clients.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {vehicles.length} véhicules
            </span>
          </div>

          <div className="space-y-3">
            {report.topVehicles.slice(0, 5).map((v, idx) => (
              <div
                key={v.id || idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : idx === 2
                      ? 'bg-amber-800 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{v.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID : {v.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <span className="text-xs font-black text-sky-400 block">{v.views} vues</span>
                    <span className="text-[10px] text-slate-500">Visites fiche</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-400 block">{v.leads} leads</span>
                    <span className="text-[10px] text-slate-500">Demandes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leads & Demand Breakdown */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Répartition des Demandes Clients
              </h3>
              <p className="text-xs text-slate-400">
                Types de contacts générés par vos annonces en ligne.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              {/* Test Drives */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Demandes d'Essais Routiers</span>
                    <span className="text-[10px] text-slate-400">Rendez-vous programmés</span>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-400">{testDriveLeads}</span>
              </div>

              {/* Quotes / Financing */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Euro className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Devis & Financements</span>
                    <span className="text-[10px] text-slate-400">Simulations de crédit / LOA</span>
                  </div>
                </div>
                <span className="text-sm font-black text-indigo-400">{quoteLeads}</span>
              </div>

              {/* Trade-in Offers */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Demandes de Reprise</span>
                    <span className="text-[10px] text-slate-400">Estimations ancien véhicule</span>
                  </div>
                </div>
                <span className="text-sm font-black text-sky-400">{tradeInLeads}</span>
              </div>

              {/* Online Price Offers */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Offres de Prix Négociées</span>
                    <span className="text-[10px] text-slate-400">Propositions d'acheteurs</span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">{priceOfferLeads}</span>
              </div>
            </div>
          </div>

          {/* Centralized Admin Notice */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Les balises techniques de tracking publicitaire (Google Tag Manager, Meta Pixel, TikTok, Google Ads) sont supervisées et optimisées par la direction centrale de la plateforme SaaS.
            </p>
          </div>
        </div>

      </div>

      {/* Stock Value & Overview Summary */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Synthèse Commerciale du Parc
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">Valeur Totale du Stock</span>
            <p className="text-xl font-black text-white font-mono">{totalStockValue.toLocaleString('fr-FR')} €</p>
            <span className="text-[10px] text-slate-500">Prix affichés catalogue</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">Prix Moyen d'un Véhicule</span>
            <p className="text-xl font-black text-amber-400 font-mono">{avgVehiclePrice.toLocaleString('fr-FR')} €</p>
            <span className="text-[10px] text-slate-500">Moyenne du catalogue actif</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">Délai Moyen de Contact</span>
            <p className="text-xl font-black text-emerald-400 font-mono">&lt; 2 Heures</p>
            <span className="text-[10px] text-slate-500">Recommandé pour maximiser les ventes</span>
          </div>
        </div>
      </div>

    </div>
  );
};
