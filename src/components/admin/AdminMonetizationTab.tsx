import React, { useState, useEffect } from 'react';
import { 
  Megaphone, DollarSign, TrendingUp, Sparkles, PlusCircle, Trash2, 
  ExternalLink, Eye, MousePointerClick, CheckCircle2, XCircle, Clock,
  RefreshCw, Building2, Phone, Mail, FileText, ArrowUpRight, ShieldCheck,
  Zap, Award, AlertTriangle, Layers, Car, Check
} from 'lucide-react';

interface AdCampaign {
  id: string;
  titre: string;
  nom_entreprise?: string;
  annonceur: string;
  tag: string;
  format: string;
  emplacement: string;
  image_url: string;
  description: string;
  lien?: string;
  cta_text: string;
  cta_url: string;
  badge_color: string;
  budget?: number;
  statut?: string;
  impressions: number;
  clics: number;
  date_debut?: string;
  date_fin?: string;
  is_active: boolean | number;
}

interface VehicleBoostItem {
  id: number;
  vehicle_id: number;
  boost_type: string;
  duration_days: number;
  date_debut: string;
  date_fin: string;
  order_id?: string;
  is_active: boolean | number;
  marque?: string;
  modele?: string;
  annee?: number;
  prix?: number;
  currency?: string;
  primary_image?: string;
}

export const AdminMonetizationTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'ads' | 'boosts' | 'plans' | 'rules'>('ads');
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [boosts, setBoosts] = useState<VehicleBoostItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Formulaire nouvelle campagne pub
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newTag, setNewTag] = useState('Partenaire Officiel');
  const [newFormat, setNewFormat] = useState('banner_inline');
  const [newEmplacement, setNewEmplacement] = useState('homepage');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState(150);
  const [newCtaText, setNewCtaText] = useState('Découvrir l’offre');
  const [newCtaUrl, setNewCtaUrl] = useState('https://');

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resAds, resBoosts, resStats] = await Promise.all([
        fetch('/api/monetization/admin/ads', { headers: getHeaders() }),
        fetch('/api/monetization/boosts', { headers: getHeaders() }),
        fetch('/api/monetization/admin/stats', { headers: getHeaders() })
      ]);

      const dataAds = await resAds.json();
      if (dataAds.success) setCampaigns(dataAds.campaigns || []);

      const dataBoosts = await resBoosts.json();
      if (dataBoosts.success) setBoosts(dataBoosts.data || []);

      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats || null);
    } catch (err) {
      console.error('Erreur données monétisation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newImageUrl) return;

    try {
      const res = await fetch('/api/monetization/admin/ads', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          titre: newTitle,
          nom_entreprise: newCompany,
          annonceur: newCompany,
          tag: newTag,
          format: newFormat,
          emplacement: newEmplacement,
          image_url: newImageUrl,
          description: newDescription,
          budget: Number(newBudget),
          cta_text: newCtaText,
          cta_url: newCtaUrl,
          statut: 'active',
          is_active: 1
        })
      });

      const data = await res.json();
      if (data.success && data.campaign) {
        setCampaigns([data.campaign, ...campaigns]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewCompany('');
        setNewDescription('');
        setStatusMessage('Campagne publicitaire créée avec succès !');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      alert('Erreur création : ' + err.message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Supprimer cette campagne publicitaire ?')) return;
    try {
      await fetch(`/api/monetization/admin/ads/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Erreur suppression : ' + err.message);
    }
  };

  const handleToggleCampaign = async (camp: AdCampaign) => {
    const nextActive = !Boolean(camp.is_active);
    try {
      await fetch(`/api/monetization/admin/ads/${camp.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: nextActive ? 1 : 0, statut: nextActive ? 'active' : 'paused' })
      });
      setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, is_active: nextActive, statut: nextActive ? 'active' : 'paused' } : c));
    } catch (err) {}
  };

  const handleRevokeBoost = async (boostId: number) => {
    if (!window.confirm('Révoquer ce boost de véhicule ? L’annonce repassera en statut standard.')) return;
    try {
      const res = await fetch(`/api/monetization/boosts/${boostId}/revoke`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setBoosts(boosts.filter(b => b.id !== boostId));
        setStatusMessage('Boost révoqué. Le véhicule a été remis en statut normal.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleRunCleanup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/monetization/cleanup-expired', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Cycle d'automatisation exécuté : ${data.expired_boosts_count} boosts expirés retirés, ${data.vehicles_reverted_to_standard} annonces revenues en statut standard sans suppression.`);
        fetchAllData();
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {statusMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Global Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Revenus Encaissés (PAID)</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            ${stats?.total_revenue_usd ? Number(stats.total_revenue_usd).toLocaleString('fr-FR') : '0'}
          </p>
          <span className="text-[11px] text-slate-500">{stats?.paid_transactions || 0} règlements validés</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">En Attente (PENDING)</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            ${stats?.pending_revenue_usd ? Number(stats.pending_revenue_usd).toLocaleString('fr-FR') : '0'}
          </p>
          <span className="text-[11px] text-slate-500">{stats?.pending_transactions || 0} intentions à valider</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Promotions Actives</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{boosts.length}</p>
          <span className="text-[11px] text-slate-500">Véhicules boostés en ligne</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Campagnes Publicitaires</p>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {campaigns.filter(c => Boolean(c.is_active)).length}
          </p>
          <span className="text-[11px] text-slate-500">Bannières régie en diffusion</span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('ads')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'ads' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Régie Bannières Partenaires ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setSubTab('boosts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'boosts' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Promotions Véhicules Actives ({boosts.length})</span>
          </button>

          <button
            onClick={() => setSubTab('plans')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'plans' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Abonnements Pro & Quotas</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === 'rules' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Règles & Automatisation</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'ads' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer Campagne Pub</span>
            </button>
          )}

          <button
            onClick={handleRunCleanup}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-700"
            title="Expirer les boosts et remettre les annonces en statut normal sans les supprimer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Nettoyer Expirations</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1 : RÉGIE PUBLICITAIRE */}
      {subTab === 'ads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((ad) => {
              const isActive = Boolean(ad.is_active);
              return (
                <div key={ad.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="relative h-36 bg-slate-950 overflow-hidden">
                      <img src={ad.image_url} alt={ad.titre} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold">
                        <span>{ad.tag}</span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isActive ? 'Active' : 'En pause'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        {ad.nom_entreprise || ad.annonceur} • {ad.emplacement}
                      </div>
                      <h4 className="text-white font-black text-sm leading-snug">{ad.titre}</h4>
                      <p className="text-slate-400 text-xs line-clamp-2">{ad.description}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>{ad.impressions || 0} affichages</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{ad.clics || 0} clics</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleCampaign(ad)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isActive ? 'Mettre en pause' : 'Activer'}
                    </button>

                    <button
                      onClick={() => handleDeleteCampaign(ad.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2 : PROMOTIONS & BOOSTS ACTIFS */}
      {subTab === 'boosts' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-white font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Véhicules Actuellement Boostés</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ces annonces bénéficient d’une visibilité surclassée payante (À la une, Sponsorisée, Remontée ou Badge Premium).
              </p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {boosts.length} actif(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Véhicule</th>
                  <th className="py-3 px-4">Option de Boost</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Début</th>
                  <th className="py-3 px-4">Fin Prévue</th>
                  <th className="py-3 px-4">Réf Commande</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {boosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                      <p className="font-semibold text-sm">Aucun boost de véhicule actif pour le moment.</p>
                      <p className="text-xs">Les véhicules payants confirmés apparaîtront ici.</p>
                    </td>
                  </tr>
                ) : (
                  boosts.map((b) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(b.date_fin).getTime() - Date.now()) / (1000 * 3600 * 24)));
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {b.primary_image ? (
                              <img src={b.primary_image} alt="" className="w-10 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-8 bg-slate-800 rounded flex items-center justify-center">
                                <Car className="w-4 h-4 text-slate-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white">{b.marque || 'Véhicule'} {b.modele || `#${b.vehicle_id}`}</p>
                              <span className="text-[10px] text-slate-400">ID #{b.vehicle_id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-400 capitalize bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {b.boost_type === 'featured' ? '⭐ À la Une' : b.boost_type === 'sponsored' ? '🔥 Sponsorisée' : b.boost_type === 'bump' ? '⚡ Remontée Top' : '👑 Badge Premium'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-white">{b.duration_days} jours</span>
                          <div className="text-[10px] text-emerald-400 font-bold">{daysLeft} jour(s) restant(s)</div>
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {new Date(b.date_debut).toLocaleDateString('fr-FR')}
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {new Date(b.date_fin).toLocaleDateString('fr-FR')}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {b.order_id || '-'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRevokeBoost(b.id)}
                            className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 px-2.5 py-1 rounded text-xs transition border border-slate-700"
                            title="Révoquer le boost et remettre l'annonce en statut standard sans la supprimer"
                          >
                            Révoquer
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3 : ABONNEMENTS PRO & QUOTAS */}
      {subTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-white font-extrabold text-sm mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Grille des Forfaits Professionnels (Concessionnaires & Garages)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Chaque forfait intègre un quota d'annonces maximum, des outils de communication et des durées configurables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Forfait Particulier */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Particulier (Gratuit)</span>
                  <span className="text-sm font-black text-emerald-400">0 $</span>
                </div>
                <div className="text-2xl font-black text-white">3 Annonces Max</div>
                <p className="text-[11px] text-slate-400">
                  Dédié aux particuliers vendant leur véhicule personnel. Les annonces supplémentaires nécessitent une mise en avant ou un forfait pro.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div>✓ 3 annonces gratuites simultanées</div>
                  <div>✓ Visibilité standard catalogue</div>
                  <div>✓ Messagerie acheteurs directe</div>
                </div>
              </div>

              {/* Forfait Vendeur Pro */}
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Vendeur Professionnel</span>
                  <span className="text-sm font-black text-blue-300">49 $/mois</span>
                </div>
                <div className="text-2xl font-black text-white">15 Annonces Max</div>
                <p className="text-[11px] text-slate-400">
                  Idéal pour les courtiers et négociants automobiles indépendants de Kinshasa et RDC.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div>✓ 15 annonces actives simultanées</div>
                  <div>✓ Badge Vendeur Pro Vérifié</div>
                  <div>✓ Priorité modération & support</div>
                </div>
              </div>

              {/* Forfait Concessionnaire VIP */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/50 space-y-3 relative overflow-hidden">
                <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Top Pro
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Concessionnaire Gold</span>
                  <span className="text-sm font-black text-amber-300">149 $/mois</span>
                </div>
                <div className="text-2xl font-black text-white">Annonces Illimitées</div>
                <p className="text-[11px] text-slate-400">
                  Pour les showrooms officiels, parcs automobiles majeurs et concessions agréées.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div>✓ Véhicules illimités</div>
                  <div>✓ Showroom digital dédié personnalisé</div>
                  <div>✓ 3 annonces À la Une offertes chaque mois</div>
                  <div>✓ Statistiques de leads et d'appels</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4 : RÈGLES DE SÉCURITÉ & AUTOMATISATION */}
      {subTab === 'rules' && (
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Architecture & Règles de Sécurité du Système de Monétisation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Intégrité des Prix & Sécurité
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Le serveur ne fait <strong>jamais confiance au prix envoyé par le frontend</strong>. Chaque commande et demande de boost est recalculée strictement à partir de la configuration serveur dans <code className="text-amber-300 font-mono">monetizationStorage.js</code> ou la base MySQL.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Statuts & Activation Conditionnelle
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Les nouvelles intentions de paiement sont initialisées avec le statut <code className="text-amber-300 font-mono">PENDING</code>. <strong>Aucune fonctionnalité payante n'est jamais activée tant que le statut n'est pas passé à PAID</strong> après validation manuelle ou callback Mobile Money.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" /> Automatisation & Expirations Sans Perte
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Le script de nettoyage périodique désactive les boosts expirés (<code className="text-purple-300 font-mono">date_fin &lt; NOW()</code>) et <strong>remet l'annonce en statut standard gratuit sans jamais supprimer ou masquer le véhicule</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Car className="w-4 h-4" /> Quota Annonces Particuliers (3 Gratuites)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Les particuliers sont strictement limités à <strong>3 annonces actives</strong> simultanées. Au-delà, ils sont invités à souscrire à un forfait professionnel pour continuer à publier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Campagne Publicitaire */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <span>Nouvelle Campagne Bannières Pub</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nom de l'Annonceur / Entreprise</label>
                <input
                  type="text"
                  required
                  placeholder="ex: TotalEnergies RDC, Rawbank, BCDC, CFAO Motors..."
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Titre de la Campagne</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Financement Auto à 0% d'acompte à Kinshasa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Emplacement</label>
                  <select
                    value={newEmplacement}
                    onChange={(e) => setNewEmplacement(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="homepage">Page d'accueil (Top Banner)</option>
                    <option value="search_results">Résultats de recherche (Inline)</option>
                    <option value="vehicle_detail">Fiche Véhicule (Sidebar)</option>
                    <option value="sidebar">Barre latérale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL Image Bannière</label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Accroche</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Bénéficiez des meilleures offres de leasing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Texte Bouton (CTA)</label>
                  <input
                    type="text"
                    value={newCtaText}
                    onChange={(e) => setNewCtaText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Lien de redirection</label>
                  <input
                    type="url"
                    value={newCtaUrl}
                    onChange={(e) => setNewCtaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow"
                >
                  Lancer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
